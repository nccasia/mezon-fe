import { ThreadError } from '../types';

export const TIME_COMBINE = 120;
export const TIME_OFFSET = 3;
export const LIMIT_MESSAGE = 50;
export const LIMIT_CLAN_ITEM = 50;
export const SIZE_PAGE_SEARCH = 25;
export const LIMIT_SIZE_UPLOAD_IMG = 1000000;
export const MAX_FILE_NAME_EMOJI = 62;
export const DEBOUNCE_TYPING_TIME = 700;
export const TIME_OF_SHOWING_FIRST_POPUP = 1000 * 60 * 5;
export const KEY_KEYBOARD = { BACKSPACE: 8, TAB: 9, ENTER: 13, ESC: 27, UP: 38, DOWN: 40, RIGHT: 39, LEFT: 27 };
export const GROUP_CHAT_MAXIMUM_MEMBERS = 9;
export const EVERYONE_ROLE_ID = '1825450696619593728';

export const threadError: ThreadError = {
	name: 'Thread Name is required',
	message: 'Starter Message is required'
};

export const MIN_THRESHOLD_CHARS = 4000;

export type ITypeConvert = {
	type: string;
	typeConvert: string;
};

export const typeConverts: ITypeConvert[] = [
	{ type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', typeConvert: 'application/msword' },
	{ type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', typeConvert: 'application/vnd.ms-powerpoint' },
	{ type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', typeConvert: 'application/vnd.ms-excel' }
];

export const fileTypeVideo = ['video/mp4', 'video/webm', 'video/mpeg', 'video/x-msvideo'];

export const fileTypeImage = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];

export const failAttachment = {
	filename: 'failAttachment',
	url: '',
	filetype: 'unknown',
	size: 0,
	width: 0,
	height: 0,
};
