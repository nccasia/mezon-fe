import { IMessageWithUser, TIME_COMBINE, checkSameDay, convertTimeHour, convertTimeString, getTimeDifferenceInSeconds } from "@mezon/utils";
import { useMemo } from "react";
import { ApiMessageAttachment, ApiMessageMention } from "vendors/mezon-js/packages/mezon-js/dist/api.gen";

export type IParsedMessage = {
    content: string;
    messageTime: string;
    messageHour: string;
    references?: any;
    attachments?: any;
    mentions?: any;
    lines: string[]
    isSameDay: boolean;
    isCombine: boolean;
}

export function useMessageParser( message: IMessageWithUser, preMessage?: IMessageWithUser): IParsedMessage {
    const attachments = useMemo(() => {
		return message.attachments || null;
	}, [message])

    const references = useMemo(() => {
		return message.references as any;
	}, [message.references]);

    const mentions = useMemo(() => {
		return message.mentions as any;
	}, [message])

	const content = useMemo(() => {
		return message.content as any;
	}, [message]);

    const lines =   useMemo(() => {
        const values = content.t?.split('\n') || [];
		return values
	}, [content]);    

    const messageTime = useMemo(() => {
        return convertTimeString(message?.create_time as string)
    }, [message])

    const messageHour = useMemo(() => {
        return convertTimeHour(message?.create_time || '' as string)
    }, [message])

    const isSameDay =  useMemo(() => {
        return checkSameDay(preMessage?.create_time as string, message?.create_time as string)
    }, [message, preMessage])

    	// TODO: optimize more
	const isCombine = useMemo(() => {
		const timeDiff = getTimeDifferenceInSeconds(preMessage?.create_time as string, message?.create_time as string);
		return (
			timeDiff < TIME_COMBINE &&
			preMessage?.user?.id === message?.user?.id &&
			checkSameDay(preMessage?.create_time as string, message?.create_time as string)
		);
	}, [message, preMessage]);

    return {
        content,
        messageTime,
        messageHour,
        attachments,
        mentions,
        lines,
        references,
        isSameDay,
        isCombine
    }
}