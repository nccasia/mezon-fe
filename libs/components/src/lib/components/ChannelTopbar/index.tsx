import { useAppNavigation, useAppParams, useEscapeKey, useOnClickOutside, usePermissionChecker, useThreads } from '@mezon/core';
import {
	appActions,
	notificationActions,
	searchMessagesActions,
	selectCloseMenu,
	selectCurrentChannel,
	selectCurrentChannelId,
	selectCurrentChannelNotificatonSelected,
	selectCurrentClanId,
	selectDefaultNotificationCategory,
	selectDefaultNotificationClan,
	selectIsShowInbox,
	selectIsShowMemberList,
	selectLastPinMessageByChannelId,
	selectLastSeenPinMessageChannelById,
	selectNewNotificationStatus,
	selectStatusMenu,
	selectTheme,
	useAppDispatch
} from '@mezon/store';
import { Icons } from '@mezon/ui';
import { EPermission, IChannel } from '@mezon/utils';
import { Tooltip } from 'flowbite-react';
import { ChannelStreamMode, ChannelType, NotificationType } from 'mezon-js';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useModal } from 'react-modal-hook';
import { useDispatch, useSelector } from 'react-redux';
import SettingChannel from '../ChannelSetting';
import ModalInvite from '../ListMemberInvite/modalInvite';
import NotificationList from '../NotificationList';
import SearchMessageChannel from '../SearchMessageChannel';
import { ChannelLabel } from './TopBarComponents';
import NotificationSetting from './TopBarComponents/NotificationSetting';
import PinnedMessages from './TopBarComponents/PinnedMessages';
import ThreadModal from './TopBarComponents/Threads/ThreadModal';

export type ChannelTopbarProps = {
	readonly channel?: Readonly<IChannel> | null;
	isChannelVoice?: boolean;
	mode?: ChannelStreamMode;
};

const ChannelTopbar = memo(({ channel, mode }: ChannelTopbarProps) => {
	const isChannelVoice = channel?.type === ChannelType.CHANNEL_TYPE_VOICE;
	const closeMenu = useSelector(selectCloseMenu);
	const statusMenu = useSelector(selectStatusMenu);

	return (
		<div
			className={`z-20 flex h-heightTopBar p-3 min-w-0 items-center flex-shrink ${isChannelVoice ? 'bg-black' : 'dark:bg-bgPrimary bg-bgLightPrimary shadow-inner border-b-[1px] dark:border-bgTertiary border-bgLightTertiary'} ${closeMenu && 'fixed top-0 w-screen'} ${closeMenu && statusMenu ? 'left-[100vw]' : 'left-0'}`}
		>
			{isChannelVoice ? <TopBarChannelVoice channel={channel} /> : <TopBarChannelText channel={channel} mode={mode} />}
		</div>
	);
});

function TopBarChannelVoice({ channel }: ChannelTopbarProps) {
	const [openInviteChannelModal, closeInviteChannelModal] = useModal(
		() => <ModalInvite onClose={closeInviteChannelModal} open={true} channelID={channel?.id || ''} />,
		[channel?.channel_id]
	);
	return (
		<>
			<div className="justify-start items-center gap-1 flex">
				<ChannelLabel channel={channel} />
			</div>
			<div className="items-center h-full ml-auto flex">
				<div className="justify-end items-center gap-2 flex">
					<div className="">
						<div className="justify-start items-center gap-[15px] flex iconHover">
							<div className="relative" onClick={openInviteChannelModal} role="button">
								<Icons.AddMemberCall />
							</div>
							<InboxButton isVoiceChannel />
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

function TopBarChannelText({ channel, isChannelVoice, mode }: ChannelTopbarProps) {
	const { setTurnOffThreadMessage } = useThreads();
	const appearanceTheme = useSelector(selectTheme);
	const hasChannelManagePermission = usePermissionChecker([EPermission.manageChannel]);
	const isShowSettingChannel = hasChannelManagePermission;
	return (
		<>
			<div className="justify-start items-center gap-1 flex">
				<ChannelLabel channel={channel} />
			</div>
			{channel?.type !== ChannelType.CHANNEL_TYPE_STREAMING && (
				<div className="items-center h-full ml-auto flex">
					<div className="justify-end items-center gap-2 flex">
						<div className="hidden sbm:flex">
							<div className="relative justify-start items-center gap-[15px] flex mr-4">
								<InviteBtn isLightMode={appearanceTheme === 'light'} />
								{isShowSettingChannel && <ChannelSettingBtn isLightMode={appearanceTheme === 'light'} />}
								<ThreadButton isLightMode={appearanceTheme === 'light'} />
								<MuteButton isLightMode={appearanceTheme === 'light'} />
								<PinButton isLightMode={appearanceTheme === 'light'} />
								<div onClick={() => setTurnOffThreadMessage()}>
									<ChannelListButton isLightMode={appearanceTheme === 'light'} />
								</div>
							</div>
							<SearchMessageChannel mode={mode} />
						</div>
						<div
							className={`gap-4 relative flex  w-[82px] h-8 justify-center items-center left-[345px] sbm:left-auto sbm:right-0 ${isChannelVoice ? 'bg-[#1E1E1E]' : 'dark:bg-bgPrimary bg-bgLightPrimary'}`}
							id="inBox"
						>
							<InboxButton isLightMode={appearanceTheme === 'light'} />
							<HelpButton isLightMode={appearanceTheme === 'light'} />
						</div>
						<div className="sbm:hidden mr-5">
							<ChannelListButton />
						</div>
					</div>
				</div>
			)}
		</>
	);
}

function ChannelSettingBtn({ isLightMode }: { isLightMode: boolean }) {
	const [isOpenSetting, setIsOpenSetting] = useState<boolean>(false);
	const ChannelSettingRef = useRef<HTMLDivElement | null>(null);
	const currentChannel = useSelector(selectCurrentChannel) as IChannel;
	const handleShowChannelSetting = () => {
		setIsOpenSetting(!isOpenSetting);
	};

	useOnClickOutside(ChannelSettingRef, () => setIsOpenSetting(false));
	useEscapeKey(() => setIsOpenSetting(false));

	return (
		<div className="relative leading-5 h-5" ref={ChannelSettingRef}>
			<Tooltip
				className={`${isOpenSetting && 'hidden'}`}
				content="Channel setting"
				trigger="hover"
				animation="duration-500"
				style={isLightMode ? 'light' : 'dark'}
			>
				<button className="focus-visible:outline-none" onClick={handleShowChannelSetting} onContextMenu={(e) => e.preventDefault()}>
					<Icons.SettingProfile
						className={`w-6 h-6hover:text-black dark:hover:text-white size-6 dark:text-[#B5BAC1] text-colorTextLightMode cursor-pointer`}
					/>
				</button>
			</Tooltip>
			{isOpenSetting && (
				<SettingChannel
					onClose={() => {
						setIsOpenSetting(false);
					}}
					channel={currentChannel}
				/>
			)}
		</div>
	);
}

function InviteBtn({ isLightMode }: { isLightMode: boolean }) {
	const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
	const InviteBtnRef = useRef<HTMLDivElement | null>(null);
	const currentChannel = useSelector(selectCurrentChannel) as IChannel;

	const [openInviteChannelModal, closeInviteChannelModal] = useModal(
		() => <ModalInvite onClose={closeInviteChannelModal} open={true} channelID={currentChannel.id} />,
		[currentChannel?.id]
	);

	useOnClickOutside(InviteBtnRef, () => setIsOpenModal(false));
	useEscapeKey(() => setIsOpenModal(false));

	return (
		<div className="relative leading-5 h-5" ref={InviteBtnRef}>
			<Tooltip
				className={`${isOpenModal && 'hidden'}`}
				content="Invite Friends"
				trigger="hover"
				animation="duration-500"
				style={isLightMode ? 'light' : 'dark'}
			>
				<button className="focus-visible:outline-none" onClick={openInviteChannelModal} onContextMenu={(e) => e.preventDefault()}>
					<Icons.AddPerson
						className={`w-6 h-6 hover:text-black dark:hover:text-white size-6 dark:text-[#B5BAC1] text-colorTextLightMode cursor-pointer`}
					/>
				</button>
			</Tooltip>
		</div>
	);
}

function ThreadButton({ isLightMode }: { isLightMode: boolean }) {
	const [isShowThread, setIsShowThread] = useState<boolean>(false);
	const threadRef = useRef<HTMLDivElement | null>(null);

	const handleShowThreads = () => {
		setIsShowThread(!isShowThread);
	};

	useOnClickOutside(threadRef, () => setIsShowThread(false));
	useEscapeKey(() => setIsShowThread(false));

	return (
		<div className="relative leading-5 h-5" ref={threadRef}>
			<Tooltip
				className={`${isShowThread && 'hidden'}`}
				content="Threads"
				trigger="hover"
				animation="duration-500"
				style={isLightMode ? 'light' : 'dark'}
			>
				<button className="focus-visible:outline-none" onClick={handleShowThreads} onContextMenu={(e) => e.preventDefault()}>
					<Icons.ThreadIcon isWhite={isShowThread} defaultSize="size-6" />
				</button>
			</Tooltip>
			{isShowThread && <ThreadModal setIsShowThread={setIsShowThread} />}
		</div>
	);
}

function MuteButton({ isLightMode }: { isLightMode: boolean }) {
	const [isMuteBell, setIsMuteBell] = useState<boolean>(false);
	const getNotificationChannelSelected = useSelector(selectCurrentChannelNotificatonSelected);
	const defaultNotificationCategory = useSelector(selectDefaultNotificationCategory);
	const defaultNotificationClan = useSelector(selectDefaultNotificationClan);
	useEffect(() => {
		if (
			getNotificationChannelSelected?.active === 1 &&
			getNotificationChannelSelected?.notification_setting_type === NotificationType.NOTHING_MESSAGE
		) {
			setIsMuteBell(true);
		} else if (getNotificationChannelSelected?.id !== '0' && getNotificationChannelSelected?.active !== 1) {
			setIsMuteBell(true);
		} else if (getNotificationChannelSelected?.id === '0') {
			if (
				defaultNotificationCategory?.notification_setting_type &&
				defaultNotificationCategory?.notification_setting_type === NotificationType.NOTHING_MESSAGE
			) {
				setIsMuteBell(true);
			} else if (
				defaultNotificationClan?.notification_setting_type &&
				defaultNotificationClan?.notification_setting_type === NotificationType.NOTHING_MESSAGE
			) {
				setIsMuteBell(true);
			} else {
				setIsMuteBell(false);
			}
		} else {
			setIsMuteBell(false);
		}
	}, [getNotificationChannelSelected, defaultNotificationCategory, defaultNotificationClan]);
	const [isShowNotificationSetting, setIsShowNotificationSetting] = useState<boolean>(false);
	const notiRef = useRef<HTMLDivElement | null>(null);

	const handleShowNotificationSetting = () => {
		setIsShowNotificationSetting(!isShowNotificationSetting);
	};

	useOnClickOutside(notiRef, () => setIsShowNotificationSetting(false));
	useEscapeKey(() => setIsShowNotificationSetting(false));
	return (
		<div className="relative leading-5 h-5" ref={notiRef}>
			<Tooltip
				className={`${isShowNotificationSetting && 'hidden'} w-[164px]`}
				content="Notification Settings"
				trigger="hover"
				animation="duration-500"
				style={isLightMode ? 'light' : 'dark'}
			>
				<button className="focus-visible:outline-none" onClick={handleShowNotificationSetting} onContextMenu={(e) => e.preventDefault()}>
					{isMuteBell ? (
						<Icons.MuteBell isWhite={isShowNotificationSetting} />
					) : (
						<Icons.UnMuteBell isWhite={isShowNotificationSetting} defaultSize="size-6" />
					)}
				</button>
			</Tooltip>
			{isShowNotificationSetting && <NotificationSetting />}
		</div>
	);
}

function PinButton({ isLightMode }: { isLightMode: boolean }) {
	const [isShowPinMessage, setIsShowPinMessage] = useState<boolean>(false);
	const pinRef = useRef<HTMLDivElement | null>(null);
	const handleShowPinMessage = () => {
		setIsShowPinMessage(!isShowPinMessage);
	};
	const currentChannelId = useSelector(selectCurrentChannelId) ?? '';
	const lastSeenPinMessageChannel = useSelector(selectLastSeenPinMessageChannelById(currentChannelId));
	const lastPinMessage = useSelector(selectLastPinMessageByChannelId(currentChannelId));
	useOnClickOutside(pinRef, () => setIsShowPinMessage(false));
	const shouldShowPinIndicator = lastPinMessage && (!lastSeenPinMessageChannel || lastPinMessage !== lastSeenPinMessageChannel);
	const handleClose = () => setIsShowPinMessage(false);
	useEscapeKey(handleClose);
	return (
		<div className="relative leading-5 h-5" ref={pinRef}>
			<Tooltip
				className={`${isShowPinMessage && 'hidden'} w-[142px]`}
				content="Pinned Messages"
				trigger="hover"
				animation="duration-500"
				style={isLightMode ? 'light' : 'dark'}
			>
				<button className="focus-visible:outline-none relative" onClick={handleShowPinMessage} onContextMenu={(e) => e.preventDefault()}>
					<Icons.PinRight isWhite={isShowPinMessage} />
					{shouldShowPinIndicator && (
						<span className="w-[10px] h-[10px] rounded-full bg-[#DA373C] absolute bottom-0 right-[3px] border-[1px] border-solid dark:border-bgPrimary border-white"></span>
					)}
				</button>
			</Tooltip>
			{isShowPinMessage && <PinnedMessages onClose={handleClose} />}
		</div>
	);
}

export function InboxButton({ isLightMode, isVoiceChannel }: { isLightMode?: boolean; isVoiceChannel?: boolean }) {
	const dispatch = useAppDispatch();
	const isShowInbox = useSelector(selectIsShowInbox);
	const inboxRef = useRef<HTMLDivElement | null>(null);
	const newNotificationStatus = useSelector(selectNewNotificationStatus);
	const currentClanId = useSelector(selectCurrentClanId);
	const { directId: currentDmGroupId } = useAppParams();

	const [notiIdsUnread, setNotiIdsUnread] = useState<string[]>();

	const notiUnreadList = useMemo(() => {
		return localStorage.getItem('notiUnread');
	}, [newNotificationStatus]);

	useEffect(() => {
		const updateNotiUnread = () => {
			setNotiIdsUnread(notiUnreadList ? JSON.parse(notiUnreadList) : []);
		};
		updateNotiUnread();
		const handleStorageChange = (event: StorageEvent) => {
			if (event.key === 'notiUnread') {
				updateNotiUnread();
			}
		};
		window.addEventListener('storage', handleStorageChange);

		return () => {
			window.removeEventListener('storage', handleStorageChange);
		};
	}, [newNotificationStatus]);

	const handleShowInbox = () => {
		dispatch(notificationActions.fetchListNotification({ clanId: currentClanId as string }));
		dispatch(notificationActions.setIsShowInbox(!isShowInbox));
	};

	const handleSetIsShowInbox = () => {
		dispatch(notificationActions.setIsShowInbox(false));
	};

	useOnClickOutside(inboxRef, () => handleSetIsShowInbox());
	useEscapeKey(() => handleSetIsShowInbox());

	return (
		<div className="relative leading-5 h-5" ref={inboxRef}>
			<Tooltip content={isShowInbox ? '' : 'Inbox'} trigger="hover" animation="duration-500" style={isLightMode ? 'light' : 'dark'}>
				<button className="focus-visible:outline-none" onClick={handleShowInbox} onContextMenu={(e) => e.preventDefault()}>
					<Icons.Inbox isWhite={isShowInbox} defaultFill={isVoiceChannel ? 'text-contentTertiary' : ''} />
					{notiIdsUnread && notiIdsUnread.length > 0 && <RedDot />}
				</button>
			</Tooltip>
			{isShowInbox && <NotificationList unReadList={notiIdsUnread} />}
		</div>
	);
}

function RedDot() {
	return (
		<div
			className="absolute border-[1px] dark:border-bgPrimary border-[#ffffff]
		 w-[12px] h-[12px] rounded-full bg-colorDanger
		  font-bold text-[11px] flex items-center justify-center -bottom-1.5 -right-1"
		></div>
	);
}

export function HelpButton({ isLightMode }: { isLightMode?: boolean }) {
	const { navigate } = useAppNavigation();
	return (
		<div className="relative leading-5 h-5">
			<Tooltip content="Help" trigger="hover" animation="duration-500" style={isLightMode ? 'light' : 'dark'}>
				<button onClick={() => navigate('help')}>
					<Icons.Help />
				</button>
			</Tooltip>
		</div>
	);
}

function ChannelListButton({ isLightMode }: { isLightMode?: boolean }) {
	const dispatch = useDispatch();
	const isActive = useSelector(selectIsShowMemberList);
	const currentChannelId = useSelector(selectCurrentChannelId);
	const handleClick = () => {
		dispatch(appActions.setIsShowMemberList(!isActive));
		dispatch(searchMessagesActions.setIsSearchMessage({ channelId: currentChannelId as string, isSearchMessage: false }));
	};
	return (
		<div className="relative leading-5 h-5">
			<Tooltip content="Members" trigger="hover" animation="duration-500" style={isLightMode ? 'light' : 'dark'}>
				<button onClick={handleClick}>
					<Icons.MemberList isWhite={isActive} />
				</button>
			</Tooltip>
		</div>
	);
}

export default ChannelTopbar;
