import { SearchMessageEntity } from '@mezon/store-mobile';

export interface IOption {
	title: string;
	content: string;
	value: string;
}
export interface IOptionSearchProps {
	option: IOption;
	onSelect: (option: IOption) => void;
}

export enum ACTIVE_TAB {
	MEMBER = 0,
	CHANNEL = 1,
	MESSAGES = 2
}

export interface ITabList {
	title: string;
	quantitySearch: number;
}

export interface IUserMention {
	id: string | number;
	display: string;
	avatarUrl: string;
	subDisplay: string;
}

export enum ITypeOptionSearch {
	FROM = 'from:',
	MENTIONS = 'mentions:',
	HAS = 'has:',
	BEFORE = 'before',
	DURING = 'during',
	AFTER = 'after',
	PINED = 'pinned'
}
export const searchOptions = [
	{ title: ITypeOptionSearch.FROM, content: 'user', value: 'username' },
	{ title: ITypeOptionSearch.MENTIONS, content: 'user', value: 'username' },
	{ title: ITypeOptionSearch.HAS, content: 'link, embed or file', value: 'attachment' },
	{ title: ITypeOptionSearch.BEFORE, content: 'specific data', value: 'username' },
	{ title: ITypeOptionSearch.DURING, content: 'specific data', value: 'username' },
	{ title: ITypeOptionSearch.AFTER, content: 'specific data', value: 'username' },
	{ title: ITypeOptionSearch.PINED, content: 'true or false', value: 'username' }
];

export type GroupedMessages = {
	label: string;
	messages: SearchMessageEntity[];
}[];

export const ChannelTypeHeader = 'HEADER';

export interface IUerMention {
	avatarUrl: string;
	display: string;
	id: string;
	subDisplay: string;
}
