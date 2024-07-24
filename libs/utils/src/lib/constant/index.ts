import { ThreadError } from '../types';

export const TIME_COMBINE = 120;
export const LIMIT_MESSAGE = 50;
export const LIMIT_CLAN_ITEM = 50;

export const KEY_KEYBOARD = { BACKSPACE: 8, TAB: 9, ENTER: 13, ESC: 27, UP: 38, DOWN: 40, RIGHT: 39, LEFT: 27 };
export const threadError: ThreadError = {
	name: 'Thread Name is required',
	message: 'Starter Message is required',
};

export const regexToDetectGifLink = /(^|\s)https?:\/\/\S+\.gif(?=\s|$)/g;

export const MIN_THRESHOLD_CHARS = 4096;

export type ITypeConvert = {
	type: string;
	typeConvert: string;
};

export const typeConverts: ITypeConvert[] = [
	{ type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', typeConvert: 'application/msword' },
	{ type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', typeConvert: 'application/vnd.ms-powerpoint' },
	{ type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', typeConvert: 'application/vnd.ms-excel' },
];

export const fileTypeVideo = ['video/mp4', 'video/webm', 'video/mpeg', 'video/x-msvideo'];

export const fileTypeImage = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export const neverMatchingRegex = /($a)/;
export const emojiRegex = /:[a-zA-Z0-9_]+:/g;
export const linkRegex = /https?:\/\/[^\s/$.?#].[^\s]*/gi;
export const mentionRegex = /@\[(.*?)\]/g;
export const hashtagRegex = /#\[(.*?)\]\((.*?)\)/g;

const headerRegex = /(?:^|\s)(#{1,6}\s.*)/;
const boldRegex = /\*\*(.*?)\*\*/;
const strikethroughRegex = /~~(.*?)~~/;
const codeBlockRegex = /```([\s\S]*?)```/;
const inlineCodeRegex = /`([^`]*)`/;
const hyperLink = /\[([^\[]+)\]\((http[s]?:\/\/[^\)]+)\)/;
const imageRegex = /!\[([^\[]*)\]\((http[s]?:\/\/[^\)]+)\)/;
const unorderedListRegex = /(?:\*.*\s)+/gm;
const orderedListRegex = /(?:^|\s)(\d+\.\s+.*?)(?:\n|$)/;
const blockquoteRegex = /(?:^|\s)>(.*?)(?:\n|$)/;

export const markdownRegex = new RegExp(
	[
		headerRegex.source,
		boldRegex.source,
		strikethroughRegex.source,
		codeBlockRegex.source,
		inlineCodeRegex.source,
		hyperLink.source,
		imageRegex.source,
		unorderedListRegex.source,
		orderedListRegex.source,
		blockquoteRegex.source,
		linkRegex.source,
	].join('|'),
	'g',
);
