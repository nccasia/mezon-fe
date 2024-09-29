import {
	useAppNavigation,
	useAppParams,
	useAuth,
	useChannelMembersActions,
	useDirect,
	useFriends,
	useMessageValue,
	usePermissionChecker,
	useSettingFooter
} from '@mezon/core';
import {
	selectAllRolesClan,
	selectCurrentChannel,
	selectCurrentClan,
	selectDmGroupCurrent,
	selectFriendStatus,
	selectMemberClanByUserId
} from '@mezon/store';
import { ChannelMembersEntity, EPermission, EUserSettings } from '@mezon/utils';
import { Dropdown } from 'flowbite-react';
import { ChannelType } from 'mezon-js';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Coords } from '../ChannelLink';
import { directMessageValueProps } from '../DmList/DMListItem';
import { DataMemberCreate } from '../DmList/MemberListGroupChat';
import GroupPanelMember from './GroupPanelMember';
import ItemPanelMember from './ItemPanelMember';
import PanelGroupDM from './PanelGroupDm';

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

const useClanOwnerChecker = (userId: string) => {
	const currentClan = useSelector(selectCurrentClan);
	const isClanOwner = useMemo(() => {
		return currentClan?.creator_id === userId;
	}, [currentClan, userId]);
	return isClanOwner;
};

const useCheckRoleAdminMember = (userId: string) => {
	const userById = useSelector(selectMemberClanByUserId(userId));
	const rolesClan = useSelector(selectAllRolesClan);
	const userRolesClan = useMemo(() => {
		return userById?.role_id ? rolesClan.filter((role) => userById?.role_id?.includes(role.id)) : [];
	}, [userById?.role_id, rolesClan]);
	const hasAdminRole = useMemo(() => {
		return userRolesClan.some((role) =>
			role?.permission_list?.permissions?.some((permission) => permission.slug === 'administrator' && permission.active === 1)
		);
	}, [userRolesClan]);

	return hasAdminRole;
};

const PanelMember = ({
	coords,
	member,
	directMessageValue,
	name,
	onClose,
	onRemoveMember,
	isMemberDMGroup,
	isMemberChannel,
	dataMemberCreate,
	onOpenProfile
}: PanelMemberProps) => {
	const { userProfile } = useAuth();
	const currentChannel = useSelector(selectCurrentChannel);
	const panelRef = useRef<HTMLDivElement | null>(null);
	const [positionTop, setPositionTop] = useState<boolean>(false);
	const { removeMemberChannel } = useChannelMembersActions();
	const hasAdminRole = useCheckRoleAdminMember(member?.user?.id ?? '');
	const isClanOwner = useClanOwnerChecker(member?.user?.id ?? '');
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
			await removeMemberChannel({ channelId: directId || '', userIds });
		}
	};
	const friendInfor = useMemo(() => {
		return {
			id: directMessageValue ? directMessageValue?.userId[0] || '' : member?.user?.id || '',
			name: directMessageValue ? name || '' : member?.user?.username || ''
		};
	}, [directMessageValue]);

	const [canManageClan] = usePermissionChecker([EPermission.manageClan]);
	const hasAddFriend = useSelector(
		selectFriendStatus(
			directMessageValue && directMessageValue.type !== ChannelType.CHANNEL_TYPE_GROUP ? directMessageValue.userId[0] : member?.user?.id || ''
		)
	);
	const isSelf = useMemo(() => userProfile?.user?.id === member?.user?.id, [member?.user?.id, userProfile?.user?.id]);
	const checkDm = useMemo(() => directMessageValue?.type === ChannelType.CHANNEL_TYPE_DM, [directMessageValue?.type]);
	const checkDmGroup = useMemo(() => directMessageValue?.type === ChannelType.CHANNEL_TYPE_GROUP, [directMessageValue?.type]);
	const { deleteFriend, addFriend } = useFriends();
	const [isDmGroupOwner, setIsDmGroupOwner] = useState(false);
	const { toDmGroupPageFromMainApp } = useAppNavigation();
	const navigate = useNavigate();
	const { createDirectMessageWithUser } = useDirect();
	const { setRequestInput, request } = useMessageValue(currentChannel?.channel_id);
	const displayMentionName = useMemo(() => {
		if (member?.clan_nick) return member.clan_nick;
		return member?.user?.display_name ?? member?.user?.username;
	}, [member]);
	const currentDmGroup = useSelector(selectDmGroupCurrent(directMessageValue?.dmID ?? ''));
	const { setIsShowSettingFooterStatus, setIsShowSettingFooterInitTab, setIsUserProfile } = useSettingFooter();

	const handleOpenProfile = () => {
		if (onOpenProfile) {
			onOpenProfile();
		}
		onClose();
	};

	const handleDirectMessageWithUser = async () => {
		const response = await createDirectMessageWithUser(member?.user?.id || '');
		if (response?.channel_id) {
			const directDM = toDmGroupPageFromMainApp(response.channel_id, Number(response.type));
			navigate('/' + directDM);
		}
	};

	const handleClickMention = () => {
		const mention = `@[${displayMentionName}](${member?.user?.id})`;
		if (request?.valueTextInput) {
			setRequestInput({ ...request, valueTextInput: request?.valueTextInput + mention });
		} else {
			setRequestInput({ ...request, valueTextInput: mention });
		}
	};

	useEffect(() => {
		if (userProfile?.user?.id === currentDmGroup?.creator_id) {
			setIsDmGroupOwner(true);
		}
	}, [currentDmGroup, userProfile]);

	const handleOpenClanProfileSetting = () => {
		setIsUserProfile(false);
		setIsShowSettingFooterInitTab(EUserSettings.PROFILES);
		setIsShowSettingFooterStatus(true);
		if (onClose) {
			onClose();
		}
	};

	return (
		<div
			ref={panelRef}
			onMouseDown={(e) => e.stopPropagation()}
			style={{
				left: coords.mouseX,
				bottom: positionTop ? '12px' : 'auto',
				top: positionTop ? 'auto' : coords.mouseY,
				boxShadow: 'rgba(0, 0, 0, 0.25) 0px 14px 28px, rgba(0, 0, 0, 0.22) 0px 10px 10px'
			}}
			className="fixed top-full dark:bg-bgProfileBody bg-bgLightPrimary z-20 w-[200px] py-[10px] px-[10px] border border-slate-300 dark:border-none rounded"
			onClick={(e) => {
				e.stopPropagation();
				onClose();
			}}
		>
			{directMessageValue && checkDmGroup ? (
				<PanelGroupDM isDmGroupOwner={isDmGroupOwner} dmGroupId={directMessageValue.dmID} lastOne={!directMessageValue.userId.length} />
			) : (
				<>
					<GroupPanelMember>
						<ItemPanelMember children="Profile" onClick={handleOpenProfile} />
						{directMessageValue ? (
							checkDm && <ItemPanelMember children="Call" />
						) : (
							<ItemPanelMember children="Mention" onClick={handleClickMention} />
						)}

						{!isSelf && (
							<>
								{!checkDm && (
									<>
										<ItemPanelMember children="Message" onClick={handleDirectMessageWithUser} />
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
							<ItemPanelMember children="Remove From Group" onClick={handleRemoveMemberChannel} danger />
							<ItemPanelMember children="Make Group Owner" danger />
						</GroupPanelMember>
					)}

					{!isMemberDMGroup && (
						<GroupPanelMember>
							{!directMessageValue && <ItemPanelMember children="Mute" type="checkbox" />}
							{isSelf && (
								<>
									<ItemPanelMember children="Deafen" type="checkbox" />
									<ItemPanelMember children="Edit Clan Profile" onClick={handleOpenClanProfileSetting} />
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
												deleteFriend(friendInfor.name, friendInfor.id);
											}}
										/>
									) : (
										<ItemPanelMember
											children="Add Friend"
											onClick={() => {
												addFriend({ usernames: [friendInfor.name], ids: [] });
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
										<ItemPanelMember children="Remove Friend" onClick={() => deleteFriend(friendInfor.name, friendInfor.id)} />
									) : (
										<ItemPanelMember
											children="Add Friend"
											onClick={() => addFriend({ usernames: [friendInfor.name], ids: [] })}
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
					{canManageClan && !hasAdminRole && !isClanOwner && (
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
