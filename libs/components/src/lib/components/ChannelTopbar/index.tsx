import { useAppNavigation, usePermissionChecker, useThreads } from '@mezon/core';
import {
	appActions,
	notificationActions,
	searchMessagesActions,
	selectAllChannelLastSeenTimestampByClanId,
	selectCloseMenu,
	selectCurrentChannelId,
	selectCurrentChannelNotificatonSelected,
	selectCurrentClan,
	selectDefaultNotificationCategory,
	selectDefaultNotificationClan,
	selectIsShowInbox,
	selectIsShowMemberList,
	selectLastPinMessageByChannelId,
	selectLastSeenPinMessageChannelById,
	selectMentionAndReplyUnreadByClanId,
	selectStatusMenu,
	selectTheme,
	useAppDispatch
} from '@mezon/store';
import { Icons } from '@mezon/ui';
import { EPermission, IChannel } from '@mezon/utils';
import { Tooltip } from 'flowbite-react';
import { ChannelStreamMode, ChannelType, NotificationType } from 'mezon-js';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useModal } from 'react-modal-hook';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
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
	const param = useParams();
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

function ThreadButton({ isLightMode }: { isLightMode: boolean }) {
	const [isShowThread, setIsShowThread] = useState<boolean>(false);
	const threadRef = useRef<HTMLDivElement | null>(null);

	const handleShowThreads = () => {
		setIsShowThread(!isShowThread);
	};

	const handleClose = useCallback(() => {
		setIsShowThread(false);
	}, []);

	return (
		<div className="relative leading-5 h-5" ref={threadRef}>
			<Tooltip
				className={`${isShowThread && 'hidden'}  flex justify-center items-center`}
				content="Threads"
				trigger="hover"
				animation="duration-500"
				style={isLightMode ? 'light' : 'dark'}
			>
				<button className="focus-visible:outline-none" onClick={handleShowThreads} onContextMenu={(e) => e.preventDefault()}>
					<Icons.ThreadIcon isWhite={isShowThread} defaultSize="size-6" />
				</button>
			</Tooltip>
			{isShowThread && <ThreadModal onClose={handleClose} rootRef={threadRef} />}
		</div>
	);
}

function MuteButton({ isLightMode }: { isLightMode: boolean }) {
	const [isMuteBell, setIsMuteBell] = useState<boolean>(false);
	const getNotificationChannelSelected = useSelector(selectCurrentChannelNotificatonSelected);
	const defaultNotificationCategory = useSelector(selectDefaultNotificationCategory);
	const defaultNotificationClan = useSelector(selectDefaultNotificationClan);

	useEffect(() => {
		const shouldMuteBell = (): boolean => {
			if (
				getNotificationChannelSelected?.active === 1 &&
				getNotificationChannelSelected?.notification_setting_type === NotificationType.NOTHING_MESSAGE
			) {
				return true;
			}

			if (getNotificationChannelSelected?.id !== '0' && getNotificationChannelSelected?.active !== 1) {
				return true;
			}

			if (getNotificationChannelSelected?.id === '0') {
				if (defaultNotificationCategory?.notification_setting_type === NotificationType.NOTHING_MESSAGE) {
					return true;
				}
				return defaultNotificationClan?.notification_setting_type === NotificationType.NOTHING_MESSAGE;
			}

			return false;
		};
		setIsMuteBell(shouldMuteBell());
	}, [getNotificationChannelSelected, defaultNotificationCategory, defaultNotificationClan]);

	const [isShowNotificationSetting, setIsShowNotificationSetting] = useState<boolean>(false);
	const notiRef = useRef<HTMLDivElement | null>(null);

	const handleShowNotificationSetting = () => {
		setIsShowNotificationSetting(!isShowNotificationSetting);
	};

	const handleClose = useCallback(() => {
		setIsShowNotificationSetting(false);
	}, []);

	return (
		<div className="relative leading-5 h-5" ref={notiRef}>
			<Tooltip
				className={`${isShowNotificationSetting && 'hidden'} w-[164px] flex justify-center items-center`}
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
			{isShowNotificationSetting && <NotificationSetting onClose={handleClose} rootRef={notiRef} />}
		</div>
	);
}

function PinButton({ isLightMode }: { isLightMode: boolean }) {
	const [isShowPinMessage, setIsShowPinMessage] = useState<boolean>(false);
	const pinRef = useRef<HTMLDivElement | null>(null);
	const handleShowPinMessage = () => {
		setIsShowPinMessage(!isShowPinMessage);
	};
	const handleClose = useCallback(() => {
		setIsShowPinMessage(false);
	}, []);
	const currentChannelId = useSelector(selectCurrentChannelId) ?? '';
	const lastSeenPinMessageChannel = useSelector(selectLastSeenPinMessageChannelById(currentChannelId));
	const lastPinMessage = useSelector(selectLastPinMessageByChannelId(currentChannelId));
	const shouldShowPinIndicator = lastPinMessage && (!lastSeenPinMessageChannel || lastPinMessage !== lastSeenPinMessageChannel);
	return (
		<div className="relative leading-5 h-5" ref={pinRef}>
			<Tooltip
				className={`${isShowPinMessage && 'hidden'} w-[142px]  flex justify-center items-center`}
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
			{isShowPinMessage && <PinnedMessages rootRef={pinRef} onClose={handleClose} />}
		</div>
	);
}

export function InboxButton({ isLightMode, isVoiceChannel }: { isLightMode?: boolean; isVoiceChannel?: boolean }) {
	const dispatch = useAppDispatch();
	const isShowInbox = useSelector(selectIsShowInbox);
	const inboxRef = useRef<HTMLDivElement | null>(null);
	const currentClan = useSelector(selectCurrentClan);

	const allLastSeenChannelAllChannelInClan = useSelector(selectAllChannelLastSeenTimestampByClanId(currentClan?.clan_id ?? ''));
	const getNotificationMentionAndReplyUnread = useSelector(
		selectMentionAndReplyUnreadByClanId(currentClan?.clan_id ?? '', allLastSeenChannelAllChannelInClan)
	);

	const handleShowInbox = () => {
		dispatch(notificationActions.setIsShowInbox(!isShowInbox));
	};

	return (
		<div className="relative leading-5 h-5" ref={inboxRef}>
			<Tooltip content={isShowInbox ? '' : 'Inbox'} trigger="hover" animation="duration-500" style={isLightMode ? 'light' : 'dark'}>
				<button className="focus-visible:outline-none" onClick={handleShowInbox} onContextMenu={(e) => e.preventDefault()}>
					<Icons.Inbox isWhite={isShowInbox} defaultFill={isVoiceChannel ? 'text-contentTertiary' : ''} />
					{(currentClan?.badge_count ?? 0) > 0 && <RedDot />}
				</button>
			</Tooltip>
			{isShowInbox && <NotificationList unReadReplyAndMentionList={getNotificationMentionAndReplyUnread} rootRef={inboxRef} />}
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
			<Tooltip
				content="Members"
				trigger="hover"
				animation="duration-500"
				style={isLightMode ? 'light' : 'dark'}
				className={'flex justify-center items-center'}
			>
				<button onClick={handleClick}>
					<Icons.MemberList isWhite={isActive} />
				</button>
			</Tooltip>
		</div>
	);
}

export default ChannelTopbar;
