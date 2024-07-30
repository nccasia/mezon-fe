export interface IStartEndIndex {
	startIndex?: number | undefined;
	endIndex?: number | undefined;
}

export interface IMention {
	userId: string | undefined;
	username: string | undefined;
}

export interface IHashtag {
	channelId: string | undefined;
	channelLabel: string | undefined;
}
export interface IEmoji {
	shortname: string | undefined;
}
export interface ILink {
	link: string | undefined;
}
export interface IMarkdown {
	type?: string;
	markdown: string | undefined;
}

export interface ILinkVoiceRoom {
	voiceLink: string | undefined;
}

export interface IMentionOnMessage extends IMention, IStartEndIndex {}
export interface IHashtagOnMessage extends IHashtag, IStartEndIndex {}
export interface IEmojiOnMessage extends IEmoji, IStartEndIndex {}
export interface ILinkOnMessage extends ILink, IStartEndIndex {}
export interface IMarkdownOnMessage extends IMarkdown, IStartEndIndex {}
export interface ILinkVoiceRoomOnMessage extends ILinkVoiceRoom, IStartEndIndex {}
