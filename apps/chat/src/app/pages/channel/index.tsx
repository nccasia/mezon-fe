import { FileUploadByDnD, MemberList, SearchMessageChannelRender } from '@mezon/components';
import { useDragAndDrop, useSearchMessages, useThreads, useVoice } from '@mezon/core';
import { channelsActions, selectCloseMenu, selectCurrentChannel, selectIsShowMemberList, selectShowScreen, selectStatusMenu, useAppDispatch } from '@mezon/store';
import { ChannelStreamMode, ChannelType } from 'mezon-js';
import { DragEvent, useCallback, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { ChannelMedia } from './ChannelMedia';
import { ChannelMessageBox } from './ChannelMessageBox';
import { ChannelTyping } from './ChannelTyping';

// TODO: move this to core
function useChannelSeen(channelId: string) {
	const dispatch = useAppDispatch();

	useEffect(() => {
		const timestamp = Date.now() / 1000;
		dispatch(channelsActions.setChannelLastSeenTimestamp({ channelId, timestamp: timestamp }));
	}, [channelId, dispatch]);
}

export default function ChannelMain() {
	const { draggingState, setDraggingState } = useDragAndDrop();

	const currentChannel = useSelector(selectCurrentChannel);
	const messagesContainerRef = useRef<HTMLDivElement>(null);
	const closeMenu = useSelector(selectCloseMenu);
	const statusMenu = useSelector(selectStatusMenu);
	const isShowMemberList = useSelector(selectIsShowMemberList);
	const { isShowCreateThread, setIsShowCreateThread } = useThreads();
	const { isSearchMessage } = useSearchMessages();

	useChannelSeen(currentChannel?.id || '');
	const showScreen = useSelector(selectShowScreen);
	const { statusCall } = useVoice();

	const startScreenShare = useCallback(() => {
		console.log('not implemented');
	}, []);

	const stopScreenShare = useCallback(() => {
		console.log('not implemented');
	}, []);

	const leaveVoiceChannel = useCallback(() => {
		console.log('not implemented');
	}, []);

	const handleDragEnter = (e: DragEvent<HTMLElement>) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.dataTransfer?.types.includes('Files')) {
			setDraggingState(true);
		}
	};

	useEffect(() => {
		if (isShowMemberList) {
			setIsShowCreateThread(false);
		}
	}, [isShowMemberList, setIsShowCreateThread]);

	return (
		<>
			{draggingState && <FileUploadByDnD currentId={currentChannel?.channel_id ?? ''} />}
			<div
				className="flex flex-col flex-1 shrink min-w-0 bg-transparent h-[100%] overflow-hidden z-0"
				id="mainChat"
				onDragEnter={handleDragEnter}
			>
				<div className={`flex flex-row ${closeMenu ? 'h-heightWithoutTopBarMobile' : 'h-heightWithoutTopBar'}`}>
					<div
						className={`flex flex-col flex-1 ${isShowMemberList ? 'w-widthMessageViewChat' : isShowCreateThread ? 'w-widthMessageViewChatThread' : isSearchMessage ? 'w-widthSearchMessage' : 'w-widthThumnailAttachment'} h-full ${closeMenu && !statusMenu && isShowMemberList && 'hidden'}`}
					>
						<div
							className={`overflow-y-auto dark:bg-bgPrimary max-w-widthMessageViewChat overflow-x-hidden max-h-heightMessageViewChat ${closeMenu ? 'h-heightMessageViewChatMobile' : 'h-heightMessageViewChat'}`}
							ref={messagesContainerRef}
						>
							<ChannelMedia currentChannel={currentChannel} statusCall={statusCall} key={currentChannel?.channel_id} />
						</div>
						{currentChannel?.type === ChannelType.CHANNEL_TYPE_VOICE ? (
							<div className="flex-1 bg-[#1E1E1E]">
								{!statusCall ? (
									<div></div>
								) : (
									<div className="relative hidden justify-center items-center gap-x-5 w-full bottom-5 group-hover:flex">
										<button
											className="size-[50px] rounded-full bg-black hover:bg-slate-700"
											onClick={showScreen ? stopScreenShare : startScreenShare}
										>
											<ShareScreen defaultFill={showScreen ? 'white' : '#AEAEAE'} />
										</button>
										<button className="size-[50px] rounded-full bg-red-500 hover:bg-red-950" onClick={leaveVoiceChannel}>
											<PhoneOff defaultSize="rotate-[138deg] m-auto" />
										</button>
									</div>
								)}
							</div>
						) : (
							<div
								className={`flex-shrink flex flex-col dark:bg-bgPrimary bg-bgLightPrimary h-auto relative ${isShowMemberList ? 'w-full' : 'w-full'}`}
							>
								{currentChannel && (
									<ChannelTyping
										channelId={currentChannel?.id}
										channelLabel={currentChannel?.channel_label || ''}
										mode={ChannelStreamMode.STREAM_MODE_CHANNEL}
									/>
								)}
								{currentChannel ? (
									<ChannelMessageBox
										clanId={currentChannel?.clan_id}
										channelId={currentChannel?.id}
										channelLabel={currentChannel?.channel_label || ''}
										mode={ChannelStreamMode.STREAM_MODE_CHANNEL}
									/>
								) : (
									<ChannelMessageBox.Skeleton />
								)}
							</div>
						)}
					</div>
					{isShowMemberList && (
						<div
							onContextMenu={(event) => event.preventDefault()}
							className={` dark:bg-bgSecondary bg-bgLightSecondary text-[#84ADFF] relative overflow-y-scroll hide-scrollbar ${currentChannel?.type === ChannelType.CHANNEL_TYPE_VOICE ? 'hidden' : 'flex'} ${closeMenu && !statusMenu && isShowMemberList ? 'w-full' : 'w-widthMemberList'}`}
							id="memberList"
						>
							<div className="w-1 h-full dark:bg-bgPrimary bg-bgLightPrimary"></div>
							<MemberList />
						</div>
					)}

					{isSearchMessage && <SearchMessageChannelRender />}
				</div>
			</div>
		</>
	);
}

export const PhoneOff = ({ defaultFill = 'white', defaultSize = 'w-5 h-5' }) => {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" className={defaultSize}>
			<path
				d="M16.5562 12.9062L16.1007 13.359C16.1007 13.359 15.0181 14.4355 12.0631 11.4972C9.10812 8.55901 10.1907 7.48257 10.1907 7.48257L10.4775 7.19738C11.1841 6.49484 11.2507 5.36691 10.6342 4.54348L9.37326 2.85908C8.61028 1.83992 7.13596 1.70529 6.26145 2.57483L4.69185 4.13552C4.25823 4.56668 3.96765 5.12559 4.00289 5.74561C4.09304 7.33182 4.81071 10.7447 8.81536 14.7266C13.0621 18.9492 17.0468 19.117 18.6763 18.9651C19.1917 18.9171 19.6399 18.6546 20.0011 18.2954L21.4217 16.883C22.3806 15.9295 22.1102 14.2949 20.8833 13.628L18.9728 12.5894C18.1672 12.1515 17.1858 12.2801 16.5562 12.9062Z"
				fill={defaultFill}
			/>
		</svg>
	);
};

export const ShareScreen = ({ defaultFill = 'white', defaultSize = 'w-5 h-5 m-auto' }) => {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" fill="none" className={defaultSize}>
			<g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
				<g fill={defaultFill} fillRule="nonzero">
					<path d="M23.75,4.99939 C24.9926,4.99939 26,6.00675 26,7.24939 L26,7.24939 L26,20.75 C26,21.9926 24.9926,23 23.75,23 L23.75,23 L4.25,23 C3.00736,23 2,21.9926 2,20.75 L2,20.75 L2,7.24939 C2,6.00675 3.00736,4.99939 4.25,4.99939 L4.25,4.99939 Z M13.9975,8.62108995 C13.7985,8.62108995 13.6077,8.70032 13.467,8.84113 L10.217,12.0956 C9.92435,12.3887 9.92468,12.8636 10.2178,13.1563 C10.5109,13.449 10.9858,13.4487 11.2784,13.1556 L13.2477,11.1835 L13.2477,18.6285 C13.2477,19.0427 13.5835,19.3785 13.9977,19.3785 C14.4119,19.3785 14.7477,19.0427 14.7477,18.6285 L14.7477,11.1818 L16.7219,13.1559 C17.0148,13.4488 17.4897,13.4488 17.7826,13.1559 C18.0755,12.863 18.0755,12.3882 17.7826,12.0953 L14.5281,8.84076 C14.3873,8.70005 14.1965,8.62108995 13.9975,8.62108995 Z"></path>
				</g>
			</g>
		</svg>
	);
};
