import { useAppParams, useAuth, useChannelMembersActions, useClanRestriction, useFriends } from '@mezon/core';
import { selectCurrentChannel, selectCurrentClan, selectDmGroupCurrent, selectFriendStatus } from '@mezon/store';
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
};

const PanelMember = ({ coords, member, directMessageValue, name, onClose, onRemoveMember, isMemberDMGroup, isMemberChannel, dataMemberCreate }: PanelMemberProps) => {
	const { userProfile } = useAuth();
	const currentChannel = useSelector(selectCurrentChannel);
	const currentClan = useSelector(selectCurrentClan);
	const panelRef = useRef<HTMLDivElement | null>(null);
	const [positionTop, setPositionTop] = useState<boolean>(false);
	const { removeMemberChannel } = useChannelMembersActions();
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
	const checkAddFriend = useSelector(selectFriendStatus(directMessageValue ? directMessageValue?.userId[0] : member?.user?.id || ''));
	const checkCreateUser = useMemo(() => userProfile?.user?.id === currentChannel?.creator_id, [currentChannel?.creator_id, userProfile?.user?.id]);
	const checkOwnerClan = useMemo(() => currentClan?.creator_id === member?.user?.id, [currentClan?.creator_id, member?.user?.id]);
	const checkUser = useMemo(() => userProfile?.user?.id === member?.user?.id, [member?.user?.id, userProfile?.user?.id]);
	const checkDm = useMemo(() => Number(directMessageValue?.type) === ChannelType.CHANNEL_TYPE_DM, [directMessageValue?.type]);
	const checkDmGroup = useMemo(() => Number(directMessageValue?.type) === ChannelType.CHANNEL_TYPE_GROUP, [directMessageValue?.type]);
	const { deleteFriend, addFriend } = useFriends();
	const [isDmGroupOwner, setIsDmGroupOwner] = useState(false);

	const currentDmGroup = useSelector(selectDmGroupCurrent(directMessageValue?.dmID ?? ''));

	useEffect(() => {
		if (userProfile?.user?.id === currentDmGroup?.creator_id) {
			setIsDmGroupOwner(true);
		}
	}, [currentDmGroup, userProfile]);

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
						<ItemPanelMember children="Profile" />
						{directMessageValue ? checkDm && <ItemPanelMember children="Call" /> : <ItemPanelMember children="Mention" />}

						{!checkUser && (
							<>
								{!checkDm && (
									<>
										<ItemPanelMember children="Message" />
										<ItemPanelMember children="Call" />
									</>
								)}
								<ItemPanelMember children="Add Note" />
								<ItemPanelMember children="Add Friend Nickname" />
							</>
						)}
						{directMessageValue && <ItemPanelMember children="Close DM" />}
					</GroupPanelMember>
					{isMemberDMGroup && !checkUser && dataMemberCreate?.createId === userProfile?.user?.id && (
						<GroupPanelMember>
							<ItemPanelMember children="Remove From Group" onClick={handleRemoveMemberChannel} danger  />
							<ItemPanelMember children="Make Group Owner" danger />
						</GroupPanelMember>
					)}

					{!isMemberDMGroup && (
						<GroupPanelMember>
							{!directMessageValue && <ItemPanelMember children="Mute" type="checkbox" />}
							{checkUser && (
								<>
									<ItemPanelMember children="Deafen" type="checkbox" />
									<ItemPanelMember children="Edit Serve Profile" />
									<ItemPanelMember children="Apps" />
								</>
							)}
							{!checkUser && (
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
									{checkAddFriend.friend ? (
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
												console.log(1);
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
							{!checkUser && (
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
									{checkAddFriend.friend ? (
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
					{((checkCreateUser || (hasAdministratorPermission && !checkOwnerClan)) && !checkUser && isMemberChannel) && (
						<GroupPanelMember>
							<ItemPanelMember children="Move View" />
							<ItemPanelMember children={`Timeout ${member?.user?.username}`} danger />
							<ItemPanelMember onClick={handleRemoveMember} children={`Kick ${member?.user?.username}`} danger />
							<ItemPanelMember children={`Ban ${member?.user?.username}`} danger />
						</GroupPanelMember>
					)}
					{checkUser && !isMemberDMGroup && (
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
