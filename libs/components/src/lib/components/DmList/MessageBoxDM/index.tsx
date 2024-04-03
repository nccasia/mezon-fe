import { useChannelMembers, useDirectMessages } from '@mezon/core';
import { ChannelMembersEntity, RootState } from '@mezon/store';
import { IMessageSendPayload } from '@mezon/utils';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import {MessageBox, UserMentionList} from '@mezon/components';
import { ApiMessageMention, ApiMessageAttachment, ApiMessageRef } from 'vendors/mezon-js/packages/mezon-js/dist/api.gen';
import { useThrottledCallback } from 'use-debounce';

interface DirectIdProps {
	directParamId: string;
	mode: number;
}
export function DirectMessageBox({ directParamId, mode }: DirectIdProps) {
	const { sendDirectMessage, sendMessageTyping } = useDirectMessages({ channelId: directParamId, mode: mode });
	// TODO: move selector to store
	const sessionUser = useSelector((state: RootState) => state.auth.session);
	const handleSend = useCallback(
		(content: IMessageSendPayload,
			mentions?: Array<ApiMessageMention>, 
			attachments?: Array<ApiMessageAttachment>,
			references?: Array<ApiMessageRef>) => {
			if (sessionUser) {
				sendDirectMessage(content, mentions, attachments, references);
			} else {
				console.error('Session is not available');
			}
		},
		[sendDirectMessage, sessionUser],
	);

	const handleTyping = useCallback(() => {
		sendMessageTyping();
	}, [sendMessageTyping]);

	const handleTypingDebounced = useThrottledCallback(handleTyping, 1000);

	return (
		<div>
			<MessageBox 
				onSend={handleSend} 
				currentChannelId={directParamId} 
				onTyping={handleTypingDebounced}
				listMentions={UserMentionList(directParamId)}
			/>
		</div>
	);
}

DirectMessageBox.Skeleton = () => {
	return (
		<div>
			<MessageBox.Skeleton />
		</div>
	);
};

export default DirectMessageBox;
