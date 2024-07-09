import { MentionReactInput, UserMentionList } from '@mezon/components';
import { useThreadMessage, useThreads } from '@mezon/core';
import {
	RootState,
	clansActions,
	createNewChannel,
	selectCurrentChannel,
	selectCurrentChannelId,
	selectCurrentClanId,
	useAppDispatch,
} from '@mezon/store';
import { ETypeMessage, IMessageSendPayload, ThreadValue } from '@mezon/utils';
import { ChannelStreamMode, ChannelType } from 'mezon-js';
import { ApiChannelDescription, ApiCreateChannelDescRequest, ApiMessageAttachment, ApiMessageMention, ApiMessageRef } from 'mezon-js/api.gen';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useThrottledCallback } from 'use-debounce';
import ChannelMessages from '../channel/ChannelMessages';

const ThreadBox = () => {
	const dispatch = useAppDispatch();
	const currentChannelId = useSelector(selectCurrentChannelId);
	const currentChannel = useSelector(selectCurrentChannel);
	const currentClanId = useSelector(selectCurrentClanId);
	const sessionUser = useSelector((state: RootState) => state.auth.session);

	const { threadCurrentChannel } = useThreads();
	const { sendMessageThread, sendMessageTyping } = useThreadMessage({
		channelId: threadCurrentChannel?.id as string,
		channelLabel: threadCurrentChannel?.channel_label as string,
		mode: ChannelStreamMode.STREAM_MODE_CHANNEL,
	});

	const createThread = useCallback(
		async (value: ThreadValue) => {
			const body: ApiCreateChannelDescRequest = {
				clan_id: currentClanId?.toString(),
				channel_label: value.nameValueThread,
				channel_private: value.isPrivate,
				parrent_id: currentChannelId as string,
				category_id: currentChannel?.category_id,
				type: ChannelType.CHANNEL_TYPE_TEXT,
			};
			const thread = await dispatch(createNewChannel(body));
			return thread.payload;
		},
		[currentChannel, currentChannelId, currentClanId, dispatch],
	);

	const handleSend = useCallback(
		async (
			content: IMessageSendPayload,
			mentions?: Array<ApiMessageMention>,
			attachments?: Array<ApiMessageAttachment>,
			references?: Array<ApiMessageRef>,
			value?: ThreadValue,
		) => {
			if (sessionUser) {
				if (value?.nameValueThread) {
					const thread = await createThread(value);
					if (thread) {
						await dispatch(clansActions.joinClan({ clanId: currentClanId as string }));
						await sendMessageThread(content, mentions, attachments, references, thread as ApiChannelDescription);
					}
				}
			} else {
				console.error('Session is not available');
			}
		},
		[createThread, currentClanId, dispatch, sendMessageThread, sessionUser],
	);

	const handleTyping = useCallback(() => {
		sendMessageTyping();
	}, [sendMessageTyping]);

	const handleTypingDebounced = useThrottledCallback(handleTyping, 1000);

	return (
		<div className="flex flex-col flex-1 justify-end">
			<div>
				{threadCurrentChannel && (
					<div className="overflow-y-auto bg-[#1E1E1E] max-w-widthMessageViewChat overflow-x-hidden max-h-heightMessageViewChatThread h-heightMessageViewChatThread">
						<ChannelMessages
							channelId={threadCurrentChannel.channel_id as string}
							channelLabel={threadCurrentChannel.channel_label}
							type={ETypeMessage.THREAD}
							mode={ChannelStreamMode.STREAM_MODE_CHANNEL}
						/>
					</div>
				)}
			</div>
			<div className="flex-shrink-0 flex flex-col pb-4 px-4 dark:bg-bgPrimary bg-bgLightModeSecond h-auto relative h-full">
				<MentionReactInput
					onSend={handleSend}
					onTyping={handleTypingDebounced}
					listMentions={UserMentionList({channelID: threadCurrentChannel?.channel_id as string})}
					isThread
				/>
			</div>
		</div>
	);
};

export default ThreadBox;
