import { EmojiDataOptionals, IChannelMember, IEmojiImage, IMessageSendPayload, IMessageWithUser } from '@mezon/utils';
import { ApiMessageAttachment, ApiMessageMention, ApiMessageRef } from 'mezon-js/api.gen';
import { EMessageActionType, EMessageBSToShow } from '../enums';

export interface IReplyBottomSheet {
	message: IMessageWithUser;
	onClose: () => void;
	type: EMessageBSToShow | null;
	onConfirmDeleteMessage: () => void;
	mode?: number;
	isOnlyEmojiPicker?: boolean;
	user?: IChannelMember | null;
}

export interface IMessageAction {
	id: number;
	title: string;
	type: EMessageActionType;
}

export interface IMessageActionNeedToResolve {
	type: EMessageActionType;
	targetMessage: IMessageWithUser;
}

export interface IMessageReactionProps {
	message: IMessageWithUser;
	mode: number;
	dataReactionCombine?: EmojiDataOptionals[];
	emojiListPNG?: IEmojiImage[];
	openEmojiPicker?: () => void;
}

export interface IDetailReactionBottomSheet {
	allReactionDataOnOneMessage: EmojiDataOptionals[];
	emojiSelectedId: string | null;
	onClose: () => void;
	emojiListPNG?: IEmojiImage[];
}
export interface IPayloadThreadSendMessage {
	content: IMessageSendPayload;
	mentions?: Array<ApiMessageMention>;
	attachments?: Array<ApiMessageAttachment>;
	references?: Array<ApiMessageRef>;
}
