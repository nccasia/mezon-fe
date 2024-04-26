import { useEscapeKey, useMenu, useOnClickOutside } from '@mezon/core';
import { appActions, selectIsShowMemberList } from '@mezon/store';
import { IChannel } from '@mezon/utils';
import { Tooltip } from 'flowbite-react';
import { ChannelType } from 'mezon-js';
import { useRef, useState } from 'react';
import { useModal } from 'react-modal-hook';
import { useDispatch, useSelector } from 'react-redux';
import * as Icons from '../Icons';
import ModalInvite from '../ListMemberInvite/modalInvite';
import NotificationList from '../NotificationList';
import { ChannelLabel, SearchMessage } from './TopBarComponents';
import ThreadModal from './TopBarComponents/Threads/ThreadModal';

export type ChannelTopbarProps = {
	channel?: IChannel | null;
};

function ChannelTopbar({ channel }: ChannelTopbarProps) {
	const checkChannelType = channel?.type === ChannelType.CHANNEL_TYPE_VOICE;
	const [openInviteChannelModal, closeInviteChannelModal] = useModal(() => (
		<ModalInvite onClose={closeInviteChannelModal} open={true} channelID={channel?.id || ''} />
	));
	const { closeMenu, statusMenu } = useMenu();

	return (
		<div
			className={`flex p-3 min-w-0 items-center  flex-shrink h-heightHeader fixed z-[1] w-full sbm:w-widthHeader top-0 right-0 ${closeMenu && !statusMenu ? '' : 'left-[344px] right-auto'} ${checkChannelType ? 'bg-[#1E1E1E]' : 'bg-bgSecondary border-b border-black'}`}
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
									<div className="relative" onClick={openInviteChannelModal}>
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
							<div className="hidden ssm:flex">
								<div className="relative justify-start items-center gap-[15px] flex iconHover mr-2">
									<ThreadButton />
									<MuteButton />
									<PinButton />
									<ChannelListButton />
								</div>
								<SearchMessage />
							</div>
							<div
								className={`gap-4 iconHover relative flex  w-[82px] h-8 justify-center items-center left-[345px] ssm:left-auto ssm:right-0 ${checkChannelType ? 'bg-[#1E1E1E]' : 'bg-[linear-gradient(90deg,_#151515de,_#151515,_#151515)]'}`}
								id="inBox"
							>
								<InboxButton />
								<HelpButton />
							</div>
							<div className="ssm:hidden mr-5">
								<ChannelListButton />
							</div>
						</div>
					</div>
				</>
			)}
		</div>
	);
}

function ThreadButton() {
	const [isShowThread, setIsShowThread] = useState<boolean>(false);
	const threadRef = useRef<HTMLDivElement | null>(null);

	const handleShowThreads = () => {
		setIsShowThread(!isShowThread);
	};

	useOnClickOutside(threadRef, () => setIsShowThread(false));
	useEscapeKey(() => setIsShowThread(false));

	return (
		<div className="relative leading-5 h-5" ref={threadRef}>
			<Tooltip className={`${isShowThread && 'hidden'}`} content="Threads" trigger="hover" animation="duration-500">
				<button className="focus-visible:outline-none" onClick={handleShowThreads} onContextMenu={(e) => e.preventDefault()}>
					<Icons.ThreadIcon />
				</button>
			</Tooltip>
			{isShowThread && <ThreadModal setIsShowThread={setIsShowThread} />}
		</div>
	);
}

function MuteButton() {
	return (
		<button>
			<Icons.MuteBell />
		</button>
	);
}

function PinButton() {
	return (
		<button>
			<Icons.PinRight />
		</button>
	);
}

export function InboxButton() {
	const [isShowInbox, setIsShowInbox] = useState<boolean>(false);
	const inboxRef = useRef<HTMLDivElement | null>(null);

	const handleShowInbox = () => {
		setIsShowInbox(!isShowInbox);
	};

	useOnClickOutside(inboxRef, () => setIsShowInbox(false));
	useEscapeKey(() => setIsShowInbox(false));

	return (
		<div className="relative leading-5 h-5" ref={inboxRef}>
			<button className="focus-visible:outline-none" onClick={handleShowInbox} onContextMenu={(e) => e.preventDefault()}>
				<Icons.Inbox />
			</button>
			{isShowInbox && <NotificationList />}
		</div>
	);
}

export function HelpButton() {
	return (
		<button>
			<Icons.Help />
		</button>
	);
}

function ChannelListButton() {
	const dispatch = useDispatch();
	const isActive = useSelector(selectIsShowMemberList);
	const handleClick = () => {
		dispatch(appActions.setIsShowMemberList(!isActive));
	};
	return (
		<button onClick={handleClick}>
			<Icons.MemberList isWhite={isActive} />
		</button>
	);
}

export default ChannelTopbar;
