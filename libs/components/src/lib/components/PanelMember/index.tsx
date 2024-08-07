import {
	useAppNavigation,
	useAppParams,
	useAuth,
	useChannelMembersActions,
	useClanRestriction, useDirect,
	useFriends, useMessageValue
} from '@mezon/core';
import { selectAllRolesClan, selectCurrentChannel, selectCurrentClan, selectDmGroupCurrent, selectFriendStatus, selectMemberByUserId } from '@mezon/store';
import { ChannelMembersEntity, EPermission } from '@mezon/utils';
import { Dropdown } from 'flowbite-react';
import { ChannelType } from 'mezon-js';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Coords } from '../ChannelLink';
import { directMessageValueProps } from '../DmList/DMListItem';
import { DataMemberCreate } from '../DmList/MemberListGroupChat';
import GroupPanelMember from './GroupPanelMember';
import ItemPanelMember from './ItemPanelMember';
import PanelGroupDM from './PanelGroupDm';
import {useNavigate} from "react-router-dom";

type PanelMemberProps = {
	coords: Coords;
	member?: ChannelMembersEntity;
	onClose: () => void;
	onRemoveMember?: () => void;
	directMessageValue?: directMessageValueProps;
	name?: string;
	isMemberDMGroup?: boolean;
	isMemberChannel?: boolean;
	dataMemberCreate?: DataMemberCreate;
	onOpenProfile?: () => void;
};

const useCheckRoleAdminMember = (userId: string) => {
	const userById = useSelector(selectMemberByUserId(userId));
	const RolesClan = useSelector(selectAllRolesClan);
	const userRolesClan = useMemo(() => {
		return userById?.role_id ? RolesClan.filter((role) => userById?.role_id?.includes(role.id)) : [];
	}, [userById?.role_id, RolesClan]);
	const hasAdminRole = useMemo(() => {
		return userRolesClan.some(role => 
			role?.permission_list?.permissions?.some(permission => 
				permission.slug === 'administrator' && permission.active === 1
			)
		);
	}, [userRolesClan]);
	
	return hasAdminRole;
}

const PanelMember = ({ coords, member, directMessageValue, name, onClose, onRemoveMember, isMemberDMGroup, isMemberChannel, dataMemberCreate, onOpenProfile }: PanelMemberProps) => {
	const { userProfile } = useAuth();
	const currentChannel = useSelector(selectCurrentChannel);
	const currentClan = useSelector(selectCurrentClan);
	const panelRef = useRef<HTMLDivElement | null>(null);
	const [positionTop, setPositionTop] = useState<boolean>(false);
	const { removeMemberChannel } = useChannelMembersActions();
	const hasAdminRole = useCheckRoleAdminMember(member?.user?.id || '');
	const { directId } = useAppParams();
	
	useEffect(() => {
		const heightPanel = panelRef.current?.clientHeight;
		if (heightPanel && heightPanel > coords.distanceToBottom) {
			setPositionTop(true);
		}
	}, [coords.distanceToBottom]);

	const handleRemoveMember = () => {
		onRemoveMember?.();
	};

	const handleRemoveMemberChannel = async () => {
		if (member) {
			const userIds = [member?.user?.id ?? ''];
			await removeMemberChannel({ channelId: directId || "", userIds });
		}
	};

	const [hasAdministratorPermission] = useClanRestriction([EPermission.administrator]);
	const [hasClanPermission] = useClanRestriction([EPermission.manageClan]);
	const hasAddFriend = useSelector(selectFriendStatus(directMessageValue ? directMessageValue?.userId[0] : member?.user?.id || ''));
	const isOwnerChannel = useMemo(() => userProfile?.user?.id === currentChannel?.creator_id, [currentChannel?.creator_id, userProfile?.user?.id]);
	const isOwnerClan = useMemo(() => currentClan?.creator_id === member?.user?.id, [currentClan?.creator_id, member?.user?.id]);
	const isSelf = useMemo(() => userProfile?.user?.id === member?.user?.id, [member?.user?.id, userProfile?.user?.id]);
	const checkDm = useMemo(() => Number(directMessageValue?.type) === ChannelType.CHANNEL_TYPE_DM, [directMessageValue?.type]);
	const checkDmGroup = useMemo(() => Number(directMessageValue?.type) === ChannelType.CHANNEL_TYPE_GROUP, [directMessageValue?.type]);
	const { deleteFriend, addFriend } = useFriends();
	const [isDmGroupOwner, setIsDmGroupOwner] = useState(false);
	const { toDmGroupPageFromMainApp } = useAppNavigation();
	const navigate = useNavigate();
	const { createDirectMessageWithUser } = useDirect();
	const { setValueTextInput, valueTextInput } = useMessageValue(currentChannel?.channel_id);

	const currentDmGroup = useSelector(selectDmGroupCurrent(directMessageValue?.dmID ?? ''));
	
	const handleOpenProfile = () => {
		if (onOpenProfile) {
			onOpenProfile();
		}
		onClose();
	}
	
	const handleDirectMessageWithUser = async() => {
		const response = await createDirectMessageWithUser(member?.user?.id || '');
		if(response?.channel_id) {
			const directDM = toDmGroupPageFromMainApp(response.channel_id, Number(response.type));
			navigate('/' + directDM);
		}
	}
	
	const handleClickMention = () => {
		const mention = `@[${member?.user?.display_name}](${member?.user?.id})`
		if(valueTextInput) {
			setValueTextInput(valueTextInput + mention);
		} else {
			setValueTextInput(mention);
		}
	}

	useEffect(() => {
		if (userProfile?.user?.id === currentDmGroup?.creator_id) {
			setIsDmGroupOwner(true);
		}
	}, [currentDmGroup, userProfile]);

	const isShowManageMember = (isOwnerChannel || hasAdministratorPermission || (hasClanPermission && !hasAdminRole)) && !isOwnerClan && !isSelf && isMemberChannel;

	return (
		<div
			ref={panelRef}
			onMouseDown={(e) => e.stopPropagation()}
			style={{
				right: isMemberDMGroup ? '30px' : 'auto',
				left: isMemberDMGroup ? 'auto' : coords.mouseX,
				bottom: positionTop ? '12px' : 'auto',
				top: positionTop ? 'auto' : coords.mouseY,
				boxShadow: 'rgba(0, 0, 0, 0.25) 0px 14px 28px, rgba(0, 0, 0, 0.22) 0px 10px 10px',
			}}
			className="fixed top-full dark:bg-bgProfileBody bg-bgLightPrimary z-20 w-[200px] py-[10px] px-[10px] border border-slate-300 dark:border-none rounded"
			onClick={(e) => {
				e.stopPropagation();
				onClose();
			}}
		>
			{directMessageValue && checkDmGroup ? (
				<PanelGroupDM isDmGroupOwner={isDmGroupOwner} />
			) : (
				<>
					<GroupPanelMember>
						<ItemPanelMember children="Profile" onClick={handleOpenProfile}/>
						{directMessageValue ? checkDm && <ItemPanelMember children="Call" /> : <ItemPanelMember children="Mention" onClick={handleClickMention}/>}

						{!isSelf && (
							<>
								{!checkDm && (
									<>
										<ItemPanelMember children="Message" onClick={handleDirectMessageWithUser}/>
										<ItemPanelMember children="Call" />
									</>
								)}
								<ItemPanelMember children="Add Note" />
								<ItemPanelMember children="Add Friend Nickname" />
							</>
						)}
						{directMessageValue && <ItemPanelMember children="Close DM" />}
					</GroupPanelMember>
					{isMemberDMGroup && !isSelf && dataMemberCreate?.createId === userProfile?.user?.id && (
						<GroupPanelMember>
							<ItemPanelMember children="Remove From Group" onClick={handleRemoveMemberChannel} danger  />
							<ItemPanelMember children="Make Group Owner" danger />
						</GroupPanelMember>
					)}

					{!isMemberDMGroup && (
						<GroupPanelMember>
							{!directMessageValue && <ItemPanelMember children="Mute" type="checkbox" />}
							{isSelf && (
								<>
									<ItemPanelMember children="Deafen" type="checkbox" />
									<ItemPanelMember children="Edit Clan Profile" />
									<ItemPanelMember children="Apps" />
								</>
							)}
							{!isSelf && (
								<>
									{directMessageValue && <ItemPanelMember children="Apps" />}
									<Dropdown
										trigger="hover"
										dismissOnClick={false}
										renderTrigger={() => (
											<div>
												<ItemPanelMember children="Invite to Clan" dropdown />
											</div>
										)}
										label=""
										placement="left-start"
										className="dark:!bg-bgProfileBody !bg-bgLightPrimary !left-[-6px] border-none py-[6px] px-[8px] w-[200px]"
									>
										<ItemPanelMember children="Komu" />
										<ItemPanelMember children="Clan 1" />
										<ItemPanelMember children="Clan 2" />
										<ItemPanelMember children="Clan 3" />
									</Dropdown>
									{hasAddFriend.friend ? (
										<ItemPanelMember
											children="Remove Friend"
											onClick={() => {
												deleteFriend(
													directMessageValue ? name || '' : member?.user?.username || '',
													directMessageValue ? directMessageValue?.userId[0] || '' : member?.user?.id || '',
												);
											}}
										/>
									) : (
										<ItemPanelMember
											children="Add Friend"
											onClick={() => {
												addFriend({ usernames: [directMessageValue ? name || '' : member?.user?.username || ''], ids: [] });
											}}
										/>
									)}
									<ItemPanelMember children="Block" />
								</>
							)}
						</GroupPanelMember>
					)}
					{isMemberDMGroup && (
						<>
							<ItemPanelMember children="Apps" />
							{!isSelf && (
								<>
									<Dropdown
										trigger="hover"
										dismissOnClick={false}
										renderTrigger={() => (
											<div>
												<ItemPanelMember children="Invite to Clan" dropdown />
											</div>
										)}
										label=""
										placement="left-start"
										className="dark:!bg-bgProfileBody !bg-bgLightPrimary !left-[-6px] border-none py-[6px] px-[8px] w-[200px]"
									>
										<ItemPanelMember children="Komu" />
										<ItemPanelMember children="Clan 1" />
										<ItemPanelMember children="Clan 2" />
										<ItemPanelMember children="Clan 3" />
									</Dropdown>
									{hasAddFriend.friend ? (
										<ItemPanelMember
											children="Remove Friend"
											onClick={() =>
												deleteFriend(
													directMessageValue ? name || '' : member?.user?.username || '',
													directMessageValue ? directMessageValue?.userId[0] || '' : member?.user?.id || '',
												)
											}
										/>
									) : (
										<ItemPanelMember
											children="Add Friend"
											onClick={() =>
												addFriend({ usernames: [directMessageValue ? name || '' : member?.user?.username || ''], ids: [] })
											}
										/>
									)}
									<ItemPanelMember children="Block" />
								</>
							)}
						</>
					)}
					{directMessageValue && (
						<GroupPanelMember>
							<ItemPanelMember children={`Mute @${name}`} />
						</GroupPanelMember>
					)}
					{(isShowManageMember) && (
						<GroupPanelMember>
							<ItemPanelMember children="Move View" />
							<ItemPanelMember children={`Timeout ${member?.user?.username}`} danger />
							<ItemPanelMember onClick={handleRemoveMember} children={`Kick ${member?.user?.username}`} danger />
							<ItemPanelMember children={`Ban ${member?.user?.username}`} danger />
						</GroupPanelMember>
					)}
					{isSelf && !isMemberDMGroup && (
						<GroupPanelMember>
							<ItemPanelMember children="Roles" />
						</GroupPanelMember>
					)}
				</>
			)}
		</div>
	);
};

export default PanelMember;
