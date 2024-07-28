import { IMessageWithUser, convertDateString, convertTimeHour, convertTimeString } from '@mezon/utils';
import { useEffect, useMemo, useState } from 'react';

export function useMessageParser(message: IMessageWithUser) {
	const attachments = useMemo(() => {
		return message?.attachments;
	}, [message?.attachments]);

	const mentions = useMemo(() => {
		return message?.mentions;
	}, [message?.mentions]);

	const content = useMemo(() => {
		return message?.content;
	}, [message?.content]);

	const lines = useMemo(() => {
		const values = content?.t;
		return values;
	}, [content?.t]);

	const messageTime = useMemo(() => {
		return convertTimeString(message?.create_time as string);
	}, [message?.create_time]);

	const messageDate = useMemo(() => {
		return convertDateString(message?.create_time as string);
	}, [message?.create_time]);

	const messageHour = useMemo(() => {
		return convertTimeHour(message?.create_time || ('' as string));
	}, [message?.create_time]);

	const [isEdited, setIsEdited] = useState(false);

	useEffect(() => {
		setIsEdited(message.create_time < (message.update_time || '') || false);
	}, [message.update_time, message.create_time]);

	const hasAttachments = attachments && attachments.length > 0;

	const userClanNickname = useMemo(() => {
		return message?.clan_nick;
	}, [message?.clan_nick]);
	const userDisplayName = useMemo(() => {
		return message?.display_name;
	}, [message?.display_name]);
	const username = useMemo(() => {
		return message?.username;
	}, [message?.username]);

	const senderId = useMemo(() => {
		return message?.sender_id;
	}, [message?.sender_id]);

	const avatarSender = useMemo(() => {
		return message?.avatar;
	}, [message?.avatar]);

	/// References message
	const senderIdMessageRef = useMemo(() => {
		if (message.references) {
			return message?.references[0]?.message_sender_id;
		}
	}, [message.references]);

	const messageIdRef = useMemo(() => {
		if (message.references) {
			return message?.references[0]?.message_ref_id;
		}
	}, [message.references]);

	const hasAttachmentInMessageRef = useMemo(() => {
		if (message.references) {
			return message.references[0]?.has_attachment;
		}
	}, [message.references]);

	const messageContentRef = useMemo(() => {
		if (message.references) {
			return JSON.parse(message?.references[0]?.content ?? '{}');
		}
	}, [message.references]);

	const messageUsernameSenderRef = useMemo(() => {
		if (message.references) {
			return message?.references[0]?.message_sender_username ?? '';
		}
	}, [message.references]);

	const messageAvatarSenderRef = useMemo(() => {
		if (message.references) {
			return message?.references[0]?.mesages_sender_avatar ?? '';
		}
	}, [message.references]);

	const messageClanNicknameSenderRef = useMemo(() => {
		if (message.references) {
			return message?.references[0]?.message_sender_clan_nick ?? '';
		}
	}, [message.references]);

	const messageDisplayNameSenderRef = useMemo(() => {
		if (message.references) {
			return message?.references[0]?.message_sender_display_name ?? '';
		}
	}, [message.references]);

	return {
		content,
		messageTime,
		messageHour,
		attachments,
		mentions,
		lines,
		messageDate,
		hasAttachments,
		isEdited,
		userClanNickname,
		userDisplayName,
		username,
		senderId,
		avatarSender,
		senderIdMessageRef,
		messageIdRef,
		hasAttachmentInMessageRef,
		messageContentRef,
		messageUsernameSenderRef,
		messageAvatarSenderRef,
		messageClanNicknameSenderRef,
		messageDisplayNameSenderRef,
	};
}
