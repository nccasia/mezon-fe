import { useGetPriorityNameFromUserClan, useJumpToMessage } from '@mezon/core';
import { messagesActions, notificationActions } from '@mezon/store';
import { IMessageWithUser, INotification } from '@mezon/utils';
import { ChannelStreamMode } from 'mezon-js';
import { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { AvatarImage } from '../AvatarImage/AvatarImage';
import MessageAttachment from '../MessageWithUser/MessageAttachment';
import MessageHead from '../MessageWithUser/MessageHead';
import MessageLine from '../MessageWithUser/MessageLine';
import MessageReply from '../MessageWithUser/MessageReply/MessageReply';
import { useMessageParser } from '../MessageWithUser/useMessageParser';
export type NotifyMentionProps = {
	readonly notify: INotification;
	readonly isUnreadTab?: boolean;
};
function convertContentToObject(notify: any) {
	if (notify && notify.content && typeof notify.content === 'object') {
		try {
			const parsedContent = {
				...notify.content,
				content: notify.content.content ? JSON.parse(notify.content.content) : null,
				mentions: notify.content.mentions ? JSON.parse(notify.content.mentions) : null,
				reactions: notify.content.reactions ? JSON.parse(notify.content.reactions) : null,
				references: notify.content.references ? JSON.parse(notify.content.references) : null,
				attachments: notify.content.attachments ? JSON.parse(notify.content.attachments) : null
			};

			return {
				...notify,
				content: parsedContent
			};
		} catch (error) {
			return notify;
		}
	}
	return notify;
}
function NotifyMentionItem({ notify, isUnreadTab }: NotifyMentionProps) {
	const parseNotify = convertContentToObject(notify);
	const dispatch = useDispatch();
	const messageId = useMemo(() => {
		if (parseNotify.content) {
			return parseNotify.content.message_id;
		}
	}, [parseNotify.content.message_id]);

	const channelId = useMemo(() => {
		if (parseNotify.content) {
			return parseNotify.content.channel_id;
		}
	}, [parseNotify.content.channel_id]);

	const clanId = useMemo(() => {
		if (parseNotify.content) {
			return parseNotify.content.clan_id;
		}
	}, [parseNotify.content.clan_id]);

	const { directToMessageById } = useJumpToMessage({ channelId: channelId, messageID: messageId, clanId: clanId });

	const handleClickJump = useCallback(() => {
		// dispatch(notificationActions.setReadNotiStatus([notify.id]));
		// dispatch(notificationActions.setStatusNoti());
		dispatch(messagesActions.setIdMessageToJump(messageId));
		directToMessageById();
		dispatch(notificationActions.setIsShowInbox(false));
	}, [directToMessageById, dispatch, messageId, notify.id]);

	return (
		<div className="dark:bg-bgTertiary bg-transparent rounded-[8px] relative group">
			<button
				className="absolute py-1 px-2 dark:bg-bgSecondary bg-bgLightTertiary top-[10px] z-50 right-3 text-[10px] rounded-[6px] transition-all duration-300 group-hover:block hidden"
				onClick={handleClickJump}
			>
				Jump
			</button>
			{<MentionTabContent message={parseNotify.content} />}
		</div>
	);
}

export default NotifyMentionItem;

interface IMentionTabContent {
	message: IMessageWithUser;
}

function MentionTabContent({ message }: IMentionTabContent) {
	const { username, contentUpdatedMention } = useMessageParser(message);
	const { priorityAvatar } = useGetPriorityNameFromUserClan(message.sender_id);
	const checkMessageHasReply = useMemo(() => {
		return message.references && message.references?.length > 0;
	}, [message.references]);

	return (
		<div className="flex flex-col p-2 bg-[#FFFFFF] dark:bg-[#313338] rounded-lg ">
			{checkMessageHasReply && (
				<div className="max-w-full overflow-hidden">
					<MessageReply message={message} />
				</div>
			)}

			<div className="flex flex-row p-1 w-full gap-4  rounded-lg bg-[#FFFFFF] dark:bg-[#313338]">
				<AvatarImage
					alt="user avatar"
					className="w-10 h-10 min-w-10"
					userName={username}
					src={priorityAvatar ? priorityAvatar : message.avatar}
				/>

				<div className="h-full">
					<MessageHead message={message} isCombine={true} isShowFull={true} mode={ChannelStreamMode.STREAM_MODE_CHANNEL} />
					<MessageLine isEditted={false} content={contentUpdatedMention} isTokenClickAble={false} isJumMessageEnabled={false} />
					{Array.isArray(message.attachments) && <MessageAttachment mode={ChannelStreamMode.STREAM_MODE_CHANNEL} message={message} />}
				</div>
			</div>
		</div>
	);
}
