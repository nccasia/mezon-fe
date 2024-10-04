import { IMessageWithUser, convertDateString, convertTimeHour, convertTimeString, getTimeDifferenceDate } from '@mezon/utils';
import { useMemo } from 'react';

export function useMessageParser(message: IMessageWithUser) {
	const attachments = useMemo(() => {
		return message.attachments;
	}, [message]);

	const mentions = useMemo(() => {
		return message.mentions;
	}, [message]);

	const content = useMemo(() => {
		return message.content;
	}, [message]);

	const lines = useMemo(() => {
		const values = content?.t;
		return values;
	}, [content]);

	const messageTime = useMemo(() => {
		if (!message?.create_time) return '';
		return convertTimeString(message?.create_time as string);
	}, [message]);

	const messageDate = useMemo(() => {
		if (!message?.create_time) return '';
		return convertDateString(message?.create_time as string);
	}, [message]);

	const messageHour = useMemo(() => {
		if (!message?.create_time) return '';
		return convertTimeHour(message?.create_time || ('' as string));
	}, [message]);

	const messageTimeDifference = useMemo(() => {
		if (!message?.create_time) return '';
		return getTimeDifferenceDate(message?.create_time as string);
	}, [message]);

	return {
		content,
		messageTime,
		messageHour,
		attachments,
		mentions,
		lines,
		messageDate,
		messageTimeDifference
	};
}
