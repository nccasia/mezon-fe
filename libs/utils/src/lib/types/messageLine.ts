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
	channelLable: string | undefined;
}
export interface IEmoji {
	shortname: string | undefined;
}
export interface ILink {
	link: string | undefined;
}
export interface Imarkdown {
	markdown: string | undefined;
}

export interface IMentionOnMessage extends IMention, IStartEndIndex {}
export interface IHashtagOnMessage extends IHashtag, IStartEndIndex {}
export interface IEmojiOnMessage extends IEmoji, IStartEndIndex {}
export interface ILinkOnMessage extends ILink, IStartEndIndex {}
export interface ImarkdownOnMessage extends Imarkdown, IStartEndIndex {}
