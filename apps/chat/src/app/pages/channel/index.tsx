import { MemberList } from '@mezon/components';
import { useChatMessages } from '@mezon/core';
import { RootState, selectCurrentChannel, selectIsShowMemberList } from '@mezon/store';
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import ChannelMessages from './ChanneMessages';
import { ChannelMessageBox } from './ChannelMessageBox';
import { ChannelTyping } from './ChannelTyping';

export default function ChannelLayout() {
	const isShow = useSelector(selectIsShowMemberList);

	// TODO: move selector to store
	const isSending = useSelector((state: RootState) => state.messages.isSending);
	const currentChanel = useSelector(selectCurrentChannel);

	// New message always display in bottomn
	const messagesContainerRef = useRef<HTMLDivElement>(null);
	const { messages } = useChatMessages({ channelId: currentChanel?.id || '' });

	useEffect(() => {
		if (messagesContainerRef.current) {
			messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
		}
	}, [isSending, [], messages]);
	// TODO: move clan related component to clan page
	return (
		<div className="flex flex-col flex-1 shrink min-w-0 bg-bgSecondary h-[100%] overflow-hidden">
			<div className="flex h-heightWithoutTopBar flex-row ">
				<div className="flex flex-col flex-1 w-full h-full">
					<div
						className="overflow-y-auto bg-[#1E1E1E] max-w-widthMessageViewChat overflow-x-hidden max-h-heightMessageViewChat h-heightMessageViewChat"
						ref={messagesContainerRef}
					>
						{currentChanel ? <ChannelMessages channelId={currentChanel?.id} /> : <ChannelMessages.Skeleton />}
					</div>
					<div className="flex-shrink-0 flex flex-col bg-[#1E1E1E] h-auto">
						{currentChanel && <ChannelTyping channelId={currentChanel?.id} />}
						{currentChanel ? <ChannelMessageBox channelId={currentChanel?.id} /> : <ChannelMessageBox.Skeleton />}
					</div>
				</div>
				{isShow && (
					<div className="w-[245px] bg-bgSurface  lg:flex hidden text-[#84ADFF]">
						<MemberList />
					</div>
				)}
			</div>
		</div>
	);
}
