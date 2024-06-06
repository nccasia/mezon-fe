import { useApp, useEscapeKey, useMenu, useOnClickOutside, useThreads } from '@mezon/core';
import { appActions, messagesActions, selectIsShowMemberList } from '@mezon/store';
import { IChannel } from '@mezon/utils';
import { Tooltip } from 'flowbite-react';
import { ChannelType } from 'mezon-js';
import { useRef, useState } from 'react';
import { useModal } from 'react-modal-hook';
import { useDispatch, useSelector } from 'react-redux';
import * as Icons from '../Icons';
import ModalInvite from '../ListMemberInvite/modalInvite';
import NotificationList from '../NotificationList';
import SearchMessageChannel from '../SearchMessageChannel';
import { ChannelLabel } from './TopBarComponents';
import NotificationSetting from './TopBarComponents/NotificationSetting';
import PinnedMessages from './TopBarComponents/PinnedMessages';
import ThreadModal from './TopBarComponents/Threads/ThreadModal';

export type ChannelTopbarProps = {
	readonly channel?: Readonly<IChannel> | null;
};

function ChannelTopbar({ channel }: ChannelTopbarProps) {
	const checkChannelType = channel?.type === ChannelType.CHANNEL_TYPE_VOICE;
	const [openInviteChannelModal, closeInviteChannelModal] = useModal(() => (
		<ModalInvite onClose={closeInviteChannelModal} open={true} channelID={channel?.id || ''} />
	));
	const { appearanceTheme } = useApp();
	const { setTurnOffThreadMessage } = useThreads();
	const { closeMenu, statusMenu } = useMenu();

	return (
		<div
			className={`flex h-heightTopBar p-3 min-w-0 items-cente flex-shrink ${checkChannelType ? 'bg-bgPrimary' : 'dark:bg-bgPrimary bg-bgLightPrimary shadow-inner border-b-[1px] dark:border-bgTertiary border-bgLightTertiary'} ${closeMenu && 'fixed top-0 w-screen z-[1]'} ${closeMenu && statusMenu ? 'left-[100vw]' : 'left-0'}`}
		>
			{checkChannelType ? (
				<>
					<div className="justify-start items-center gap-1 hidden group-hover:flex">
						<ChannelLabel channel={channel} />
					</div>
					<div className="items-center h-full ml-auto hidden group-hover:flex">
						<div className="justify-end items-center gap-2 flex">
							<div className="">
								<div className="justify-start items-center gap-[15px] flex iconHover">
									<div className="relative" onClick={openInviteChannelModal} role="button">
										<Icons.AddMemberCall />
									</div>
									<InboxButton />
									<Icons.ThreeDot />
									<Icons.BoxChatIcon />
								</div>
							</div>
						</div>
					</div>
				</>
			) : (
				<>
					<div className="justify-start items-center gap-1 flex">
						<ChannelLabel channel={channel} />
					</div>
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
								<SearchMessageChannel />
							</div>
							<div
								className={`gap-4 relative flex  w-[82px] h-8 justify-center items-center left-[345px] sbm:left-auto sbm:right-0 ${checkChannelType ? 'bg-[#1E1E1E]' : 'dark:bg-bgPrimary bg-bgLightPrimary'}`}
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
				</>
			)}
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
	const [isShowNotificationSetting, setIsShowNotificationSetting] = useState<boolean>(false);
	const threadRef = useRef<HTMLDivElement | null>(null);

	const handleShowNotificationSetting = () => {
		setIsShowNotificationSetting(!isShowNotificationSetting);
	};

	useOnClickOutside(threadRef, () => setIsShowNotificationSetting(false));
	useEscapeKey(() => setIsShowNotificationSetting(false));
	return (
		<div className="relative leading-5 h-5" ref={threadRef}>
			<Tooltip
				className={`${isShowNotificationSetting && 'hidden'} w-[164px]`}
				content="Notification Settings"
				trigger="hover"
				animation="duration-500"
				style={isLightMode ? 'light' : 'dark'}
			>
				<button className="focus-visible:outline-none" onClick={handleShowNotificationSetting} onContextMenu={(e) => e.preventDefault()}>
					<Icons.MuteBell />
				</button>
			</Tooltip>
			{isShowNotificationSetting && <NotificationSetting />}
		</div>
	);
}

function PinButton({ isLightMode }: { isLightMode: boolean }) {
	const [isShowPinMessage, setIsShowPinMessage] = useState<boolean>(false);
	const threadRef = useRef<HTMLDivElement | null>(null);

	const handleShowPinMessage = () => {
		setIsShowPinMessage(!isShowPinMessage);
	};

	useOnClickOutside(threadRef, () => setIsShowPinMessage(false));
	useEscapeKey(() => setIsShowPinMessage(false));
	return (
		<div className="relative leading-5 h-5" ref={threadRef}>
			<Tooltip
				className={`${isShowPinMessage && 'hidden'} w-[142px]`}
				content="Pinned Messages"
				trigger="hover"
				animation="duration-500"
				style={isLightMode ? 'light' : 'dark'}
			>
				<button className="focus-visible:outline-none" onClick={handleShowPinMessage} onContextMenu={(e) => e.preventDefault()}>
					<Icons.PinRight isWhite={isShowPinMessage} />
				</button>
			</Tooltip>
			{isShowPinMessage && <PinnedMessages />}
		</div>
	);
}

export function InboxButton({ isLightMode }: { isLightMode?: boolean }) {
	const [isShowInbox, setIsShowInbox] = useState<boolean>(false);
	const inboxRef = useRef<HTMLDivElement | null>(null);

	const handleShowInbox = () => {
		setIsShowInbox(!isShowInbox);
	};

	useOnClickOutside(inboxRef, () => setIsShowInbox(false));
	useEscapeKey(() => setIsShowInbox(false));

	return (
		<div className="relative leading-5 h-5" ref={inboxRef}>
			<Tooltip content="Inboxs" trigger="hover" animation="duration-500" style={isLightMode ? 'light' : 'dark'}>
				<button className="focus-visible:outline-none" onClick={handleShowInbox} onContextMenu={(e) => e.preventDefault()}>
					<Icons.Inbox />
				</button>
			</Tooltip>
			{isShowInbox && <NotificationList />}
		</div>
	);
}

export function HelpButton({ isLightMode }: { isLightMode?: boolean }) {
	return (
		<div className="relative leading-5 h-5">
			<Tooltip content="Help" trigger="hover" animation="duration-500" style={isLightMode ? 'light' : 'dark'}>
				<button>
					<Icons.Help />
				</button>
			</Tooltip>
		</div>
	);
}

function ChannelListButton({ isLightMode }: { isLightMode?: boolean }) {
	const dispatch = useDispatch();
	const isActive = useSelector(selectIsShowMemberList);
	const handleClick = () => {
		dispatch(appActions.setIsShowMemberList(!isActive));
		dispatch(messagesActions.setIsSearchMessage(false));
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
