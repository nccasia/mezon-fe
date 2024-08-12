import { IMessageSendPayload } from '.';

export interface IStartEndIndex {
	s?: number | undefined;
	e?: number | undefined;
}

export interface IMention {
	user_id?: string | undefined;
	username?: string | undefined;
	role_id?: string | undefined;
	rolename?: string | undefined;
}

export interface IHashtag {
	channelid: string | undefined;
	channellabel: string | undefined;
}
export interface IEmoji {
	emojiid: string | undefined;
	shortname: string | undefined;
}
export interface ILink {
	tp: string | undefined;
	lk: string | undefined;
}
export interface IMarkdown {
	type?: string;
	mk: string | undefined;
}

export interface ILinkVoiceRoom {
	vk: string | undefined;
}

export interface IMentionOnMessage extends IMention, IStartEndIndex {}
export interface IExtendedMessage extends IMessageSendPayload {
	mentions?: IMentionOnMessage[];
}
export interface IHashtagOnMessage extends IHashtag, IStartEndIndex {}
export interface IEmojiOnMessage extends IEmoji, IStartEndIndex {}
export interface ILinkOnMessage extends ILink, IStartEndIndex {}
export interface IMarkdownOnMessage extends IMarkdown, IStartEndIndex {}
export interface ILinkVoiceRoomOnMessage extends ILinkVoiceRoom, IStartEndIndex {}
