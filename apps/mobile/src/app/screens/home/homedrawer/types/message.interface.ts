import { EmojiDataOptionals, IMessageWithUser, IMessageSendPayload } from "@mezon/utils";
import { EMessageActionType, EMessageBSToShow } from "../enums";
import { ApiMessageAttachment, ApiMessageMention, ApiMessageRef } from "mezon-js/api.gen";

export interface IReplyBottomSheet {
    message: IMessageWithUser;
    onClose: () => void;
    type: EMessageBSToShow | null;
    onConfirmDeleteMessage: () => void;
    mode?: number;
}

export interface IMessageAction {
    id: number;
    title: string;
    type: EMessageActionType;
}

export interface IMessageActionNeedToResolve {
    type: EMessageActionType,
    targetMessage: IMessageWithUser,
}

export interface IMessageReactionProps {
	message: IMessageWithUser;
	mode: number;
    dataReactionCombine?: EmojiDataOptionals[]
}

export interface IDetailReactionBottomSheet {
    allReactionDataOnOneMessage: EmojiDataOptionals[];
    emojiSelectedId: string | null;
    onClose: () => void;
}
export interface IPayloadThreadSendMessage {
  content: IMessageSendPayload,
  mentions?: Array<ApiMessageMention>,
  attachments?: Array<ApiMessageAttachment>,
  references?: Array<ApiMessageRef>,
}
