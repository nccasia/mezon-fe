export interface IStartEndIndex {
	startindex?: number | undefined;
	endindex?: number | undefined;
}

export interface IMention {
	userid: string | undefined;
	username: string | undefined;
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
	link: string | undefined;
}
export interface IMarkdown {
	type?: string;
	markdown: string | undefined;
}

export interface ILinkVoiceRoom {
	voicelink: string | undefined;
}

export interface IMentionOnMessage extends IMention, IStartEndIndex {}
export interface IHashtagOnMessage extends IHashtag, IStartEndIndex {}
export interface IEmojiOnMessage extends IEmoji, IStartEndIndex {}
export interface ILinkOnMessage extends ILink, IStartEndIndex {}
export interface IMarkdownOnMessage extends IMarkdown, IStartEndIndex {}
export interface ILinkVoiceRoomOnMessage extends ILinkVoiceRoom, IStartEndIndex {}
