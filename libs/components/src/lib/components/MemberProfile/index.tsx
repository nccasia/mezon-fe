import { AvatarImage, ShortUserProfile } from '@mezon/components';
import { useChannelMembersActions, useEscapeKey, useOnClickOutside } from '@mezon/core';
import { ChannelMembersEntity, selectAllAccount, selectCurrentClan, selectCurrentClanId } from '@mezon/store';
import { Icons } from '@mezon/ui';
import { MemberProfileType, MouseButton } from '@mezon/utils';
import { ChannelStreamMode, ChannelType } from 'mezon-js';
import { useMemo, useRef, useState } from 'react';
import { useModal } from 'react-modal-hook';
import { useSelector } from 'react-redux';
import { Coords } from '../ChannelLink';
import { directMessageValueProps } from '../DmList/DMListItem';
import { DataMemberCreate } from '../DmList/MemberListGroupChat';
import PanelMember from '../PanelMember';
import StatusUser from '../StatusUser';
import UserProfileModalInner from '../UserProfileModalInner';
import ModalRemoveMemberClan from './ModalRemoveMemberClan';

export type MemberProfileProps = {
	avatar: string;
	name: string;
	status?: boolean;
	customStatus?: string;
	isHideStatus?: boolean;
	isHideIconStatus?: boolean;
	numberCharacterCollapse?: number;
	textColor?: string;
	isHideUserName?: boolean;
	classParent?: string;
	user?: ChannelMembersEntity;
	listProfile?: boolean;
	isOffline?: boolean;
	isHideAnimation?: boolean;
	isUnReadDirect?: boolean;
	directMessageValue?: directMessageValueProps;
	isMemberGroupDm?: boolean;
	positionType?: MemberProfileType;
	countMember?: number;
	dataMemberCreate?: DataMemberCreate;
	isHiddenAvatarPanel?: boolean;
	userNameAva?: string;
	hideLongName?: boolean;
	isDM?: boolean;
};

export enum ModalType {
	ProfileItem = 'profileItem',
	PannelMember = 'pannelMember',
	UserProfile = 'userProfile'
}

export const profileElemHeight = 358;
export const profileElemWidth = 320;

function MemberProfile({
	avatar,
	name,
	status,
	customStatus,
	isHideStatus,
	isHideIconStatus,
	isHideUserName,
	classParent = '',
	user,
	listProfile,
	isOffline,
	isHideAnimation,
	isUnReadDirect,
	directMessageValue,
	positionType,
	countMember,
	dataMemberCreate,
	isHiddenAvatarPanel,
	userNameAva,
	hideLongName,
	isDM
}: MemberProfileProps) {
	const [coords, setCoords] = useState<Coords>({
		mouseX: 0,
		mouseY: 0,
		distanceToBottom: 0
	});
	const [openModalRemoveMember, setOpenModalRemoveMember] = useState<boolean>(false);
	const [isOpenProfileModal, setIsOpenProfileModal] = useState<boolean>(false);

	const { removeMemberClan } = useChannelMembersActions();
	const currentClanId = useSelector(selectCurrentClanId);
	const currentClan = useSelector(selectCurrentClan);
	const userProfile = useSelector(selectAllAccount);

	const panelRef = useRef<HTMLDivElement | null>(null);

	const handleMouseClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		// stop open popup default of web
		window.oncontextmenu = (e) => {
			e.preventDefault();
		};

		const mouseX = event.clientX;
		const mouseY = event.clientY;
		const windowWidth = window.innerWidth;
		const windowHeight = window.innerHeight;

		// adjust mouseX if it is less than 200px(panel width) from the right edge of the browser
		const adjustedMouseX = mouseX > windowWidth - 200 ? mouseX - 200 : mouseX;

		if (event.button === MouseButton.LEFT) {
			// handle show profile item
			const rect = panelRef.current?.getBoundingClientRect() as DOMRect;
			setCoords({ distanceToBottom: windowHeight - rect.bottom, mouseX: windowWidth - rect.left, mouseY: rect.top - rect.height });

			if (modalState.current.profileItem) {
				closeModal(ModalType.ProfileItem);
			} else {
				resetModalState();
				openProfileItem();
			}
		}

		if (event.button === MouseButton.RIGHT) {
			const distanceToBottom = windowHeight - mouseY;
			setCoords({ mouseX: adjustedMouseX, mouseY, distanceToBottom });
			if (modalState.current.pannelMember) {
				closeModal(ModalType.PannelMember);
			} else {
				resetModalState();
				openPanelMember();
			}
		}
	};

	const handleClickRemoveMember = () => {
		setOpenModalRemoveMember(true);
		closeModal(ModalType.ProfileItem);
		closeModal(ModalType.PannelMember);
	};

	const handleRemoveMember = async () => {
		if (user) {
			const userIds = [user.user?.id ?? ''];
			await removeMemberClan({ clanId: currentClanId as string, channelId: user.channelId as string, userIds });

			setOpenModalRemoveMember(false);
		}
	};

	const handleClickOutSide = () => {
		closeModal(ModalType.ProfileItem);
		closeModal(ModalType.PannelMember);
	};

	useOnClickOutside(panelRef, handleClickOutSide);

	useEscapeKey(() => {
		closeModal(ModalType.ProfileItem);
		closeModal(ModalType.PannelMember);
	});

	const isFooter = useMemo(() => positionType === MemberProfileType.FOOTER_PROFILE, [positionType]);

	const isListFriend = useMemo(() => positionType === MemberProfileType.LIST_FRIENDS, [positionType]);

	const isMemberDMGroup = useMemo(() => positionType === MemberProfileType.DM_MEMBER_GROUP, [positionType]);

	const isMemberChannel = useMemo(() => positionType === MemberProfileType.MEMBER_LIST, [positionType]);

	const isListDm = useMemo(() => positionType === MemberProfileType.DM_LIST, [positionType]);

	const isAnonymous = useMemo(
		() => (isFooter ? userProfile?.user?.id : user?.user?.id) === process.env.NX_CHAT_APP_ANNONYMOUS_USER_ID,
		[isFooter, user?.user?.id, userProfile?.user?.id]
	);

	const userName = useMemo(() => (isFooter ? userProfile?.user?.username || '' : name || ''), [isFooter, name, userProfile?.user?.username]);

	const subNameRef = useRef<HTMLInputElement>(null);
	const minWidthNameMain = useMemo(() => subNameRef.current?.offsetWidth, [subNameRef]);

	const isOwnerClanOrGroup = useMemo(() => {
		return (
			(dataMemberCreate?.createId || currentClan?.creator_id) &&
			(dataMemberCreate ? dataMemberCreate?.createId : currentClan?.creator_id) === user?.user?.id
		);
	}, [currentClan?.creator_id, dataMemberCreate, user?.user?.id]);

	const modalState = useRef({
		profileItem: false,
		pannelMember: false,
		userProfile: false
	});

	const [openProfileItem, closeProfileItem] = useModal(() => {
		if (!listProfile) return;
		modalState.current.profileItem = true;

		return (
			<ShortUserProfile
				userID={user?.id || ''}
				mode={isMemberDMGroup ? ChannelStreamMode.STREAM_MODE_GROUP : undefined}
				avatar={avatar}
				name={name}
				coords={coords}
				isDM={isDM}
			/>
		);
	}, [coords]);

	const [openPanelMember, closePanelMember] = useModal(() => {
		if (isHiddenAvatarPanel) return;
		modalState.current.pannelMember = true;
		return (
			<PanelMember
				coords={coords}
				onClose={() => closeModal(ModalType.PannelMember)}
				member={user}
				onRemoveMember={handleClickRemoveMember}
				directMessageValue={directMessageValue}
				name={name}
				isMemberDMGroup={dataMemberCreate ? true : false}
				dataMemberCreate={dataMemberCreate}
				isMemberChannel={isMemberChannel}
				onOpenProfile={openUserProfile}
			/>
		);
	}, [coords]);

	const [openUserProfile, closeUserProfile] = useModal(() => {
		modalState.current.userProfile = true;
		return (
			<UserProfileModalInner
				openModal={isOpenProfileModal}
				userId={user?.user?.id || user?.user_id?.[0]}
				directId={(user as any)?.channel_id || user?.channelId}
				onClose={() => closeModal(ModalType.UserProfile)}
				isDM={isDM}
				user={user}
			/>
		);
	});

	const closeModal = (modalType: ModalType) => {
		switch (modalType) {
			case ModalType.ProfileItem:
				closeProfileItem();
				break;
			case ModalType.PannelMember:
				closePanelMember();
				break;
			case ModalType.UserProfile:
				closeUserProfile();
				break;
		}
		modalState.current[modalType] = false;
	};

	const resetModalState = () => {
		closeModal(ModalType.ProfileItem);
		closeModal(ModalType.PannelMember);
		closeModal(ModalType.UserProfile);
	};

	return (
		<div className="relative group">
			<div
				ref={panelRef}
				onMouseDown={handleMouseClick}
				className={`relative gap-[5px] flex items-center cursor-pointer rounded ${isFooter ? 'h-10 max-w-[142px]' : ''} ${classParent} ${isOffline ? 'opacity-60' : ''} ${listProfile ? '' : 'overflow-hidden'}`}
			>
				<div className="mr-[2px] relative inline-flex items-center justify-start w-8 h-8 text-lg text-white rounded-full">
					<AvatarImage
						alt={userName}
						userName={userNameAva ?? userName}
						className="min-w-8 min-h-8 max-w-8 max-h-8"
						classNameText="font-semibold"
						src={avatar}
						isAnonymous={isAnonymous}
					/>
					{isFooter && (
						<span
							className={`absolute bottom-[0px] inline-flex items-center justify-center gap-1 p-[3px] text-sm text-white dark:bg-bgSecondary bg-bgLightMode rounded-full right-[-4px]`}
						>
							<Icons.OnlineStatus />
						</span>
					)}
					{!isFooter && !isHideIconStatus && (
						<StatusUser
							isListDm={isListDm}
							isMemberChannel={isMemberChannel}
							isMemberDMGroup={isMemberDMGroup}
							status={status}
							directMessageValue={directMessageValue}
							userId={user?.user?.id}
						/>
					)}
				</div>
				<div className="flex flex-col items-start h-full">
					<div
						ref={subNameRef}
						className={`absolute top-[22px] mr-5 max-w-full overflow-x-hidden transition-all duration-300 flex flex-col items-start justify-start ${isFooter ? 'ml-1' : ''} ${isHideAnimation ? '' : 'group-hover:-translate-y-4'}`}
					>
						{!isHideStatus && (
							<>
								{customStatus && (isFooter || isListFriend) ? (
									<span className={`text-[11px] text-left dark:text-contentSecondary text-colorTextLightMode line-clamp-1`}>
										{customStatus}
									</span>
								) : (
									<span className={`text-[11px] dark:text-contentSecondary text-colorTextLightMode`}>
										{!status ? 'Offline' : 'Online'}
									</span>
								)}

								<p className="text-[11px] dark:text-contentSecondary text-colorTextLightMode overflow-x-hidden whitespace-nowrap text-ellipsis text-left w-full">
									{userProfile?.user?.username}
								</p>
							</>
						)}
					</div>
					{!isHideUserName && (
						<div className={'h-full flex-col'}>
							<div className="flex flex-row items-center w-full overflow-x-hidden" style={{ minWidth: `${minWidthNameMain}px` }}>
								<p
									className={`text-base font-medium nameMemberProfile
				  ${isListFriend ? ' inline-flex justify-start' : ''}
                  ${isFooter ? 'top-[-4px] leading-[26px] max-w-[102px] overflow-x-hidden text-ellipsis' : ''}
                  ${isMemberChannel || positionType === MemberProfileType.DM_MEMBER_GROUP ? ` ${isOwnerClanOrGroup ? 'max-w-[150px]' : 'max-w-[176px]'}  whitespace-nowrap overflow-x-hidden text-ellipsis` : ''}
                  ${positionType === MemberProfileType.DM_LIST ? `${isOwnerClanOrGroup ? 'max-w-[150px]' : 'max-w-[176px]'} whitespace-nowrap overflow-x-hidden text-ellipsis` : ''}
                  ${classParent === '' ? 'bg-transparent' : 'relative dark:bg-transparent bg-channelTextareaLight'}
                  ${isUnReadDirect ? 'dark:text-white text-black dark:font-medium font-semibold' : 'font-medium dark:text-channelTextLabel text-colorTextLightMode'}
							    `}
									title={name}
								>
									<span
										className={`one-line ${hideLongName && 'truncate !block'} ${isOwnerClanOrGroup && 'max-w-[140px]'} ${isListFriend ? 'dark:text-white text-black' : ''}`}
									>
										{!isHiddenAvatarPanel && name}
									</span>
									{isListFriend && <span className="hidden group-hover/list_friends:inline">&nbsp;{userNameAva}</span>}
								</p>
								{isOwnerClanOrGroup && (
									<button className="w-[14px] h-[14px] ml-1">
										<Icons.OwnerIcon />
									</button>
								)}
							</div>
							{customStatus && (isMemberChannel || isMemberDMGroup) && (
								<p
									className="dark:text-channelTextLabel text-black w-full text-[12px] line-clamp-1 break-all max-w-[176px] "
									title={customStatus}
								>
									{customStatus}
								</p>
							)}
						</div>
					)}

					{Number(directMessageValue?.type) === ChannelType.CHANNEL_TYPE_GROUP && (
						<p className="dark:text-channelTextLabel text-colorTextLightMode text-xs">{countMember} Members</p>
					)}
				</div>
			</div>

			{openModalRemoveMember && (
				<ModalRemoveMemberClan
					openModal={openModalRemoveMember}
					username={user?.user?.username}
					onClose={() => setOpenModalRemoveMember(false)}
					onRemoveMember={handleRemoveMember}
				/>
			)}
		</div>
	);
}

export default MemberProfile;
