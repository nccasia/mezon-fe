import { handleUploadFile, handleUploadFileMobile } from '@mezon/transport';
import {
	differenceInDays,
	differenceInHours,
	differenceInMonths,
	differenceInSeconds,
	format,
	formatDistanceToNowStrict,
	fromUnixTime,
	isSameDay,
	startOfDay,
	subDays
} from 'date-fns';
import { Client, Session } from 'mezon-js';
import { ApiMessageAttachment, ApiMessageRef, ApiRole, ClanUserListClanUser } from 'mezon-js/api.gen';
import { RefObject } from 'react';
import Resizer from 'react-image-file-resizer';
import { ID_MENTION_HERE, TIME_COMBINE } from '../constant';
import {
	ChannelMembersEntity,
	EMarkdownType,
	EMimeTypes,
	ETokenMessage,
	EmojiDataOptionals,
	IEmojiOnMessage,
	IExtendedMessage,
	IHashtagOnMessage,
	ILinkOnMessage,
	ILinkVoiceRoomOnMessage,
	IMarkdownOnMessage,
	IMentionOnMessage,
	IMessageSendPayload,
	IMessageWithUser,
	MentionDataProps,
	SearchItemProps,
	SenderInfoOptionals
} from '../types';
export { mergeRefs } from './mergeRefs';

export const convertTimeString = (dateString: string) => {
	const codeTime = new Date(dateString);
	const today = startOfDay(new Date());
	const yesterday = startOfDay(subDays(new Date(), 1));
	if (isSameDay(codeTime, today)) {
		// Date is today
		const formattedTime = format(codeTime, 'HH:mm');
		return `Today at ${formattedTime}`;
	} else if (isSameDay(codeTime, yesterday)) {
		// Date is yesterday
		const formattedTime = format(codeTime, 'HH:mm');
		return `Yesterday at ${formattedTime}`;
	} else {
		// Date is neither today nor yesterday
		const formattedDate = format(codeTime, 'dd/MM/yyyy, HH:mm');
		return formattedDate;
	}
};

export const convertTimeHour = (dateString: string) => {
	const codeTime = new Date(dateString);
	const formattedTime = format(codeTime, 'HH:mm');
	return formattedTime;
};

export const convertDateString = (dateString: string) => {
	const codeTime = new Date(dateString);
	const formattedDate = format(codeTime, 'eee, dd MMMM yyyy');
	return formattedDate;
};

export const getTimeDifferenceInSeconds = (startTimeString: string, endTimeString: string) => {
	const startTime = new Date(startTimeString);
	const endTime = new Date(endTimeString);
	const timeDifferenceInSeconds = differenceInSeconds(endTime, startTime);
	return timeDifferenceInSeconds;
};

export const checkSameDay = (startTimeString: string, endTimeString: string) => {
	if (!startTimeString) return false;
	const startTime = new Date(startTimeString);
	const endTime = new Date(endTimeString);
	const sameDay = isSameDay(startTime, endTime);
	return sameDay;
};

export const focusToElement = (ref: RefObject<HTMLInputElement | HTMLDivElement | HTMLUListElement>) => {
	if (ref?.current) {
		ref.current.focus();
	}
};
export const uniqueUsers = (mentions: IMentionOnMessage[], userChannels: ChannelMembersEntity[] | null) => {
	const getListId = mentions
		.map((item) => item.user_id)
		.filter((user_id): user_id is string => user_id !== undefined && user_id !== ID_MENTION_HERE);
	const uniqueUserIds = Array.from(new Set(getListId));
	const memUserIds = userChannels?.map((member) => member?.user?.id);
	const userIdsNotInChannel = uniqueUserIds.filter((user_id) => !memUserIds?.includes(user_id));

	return userIdsNotInChannel;
};

export const convertTimeMessage = (timestamp: number) => {
	const textTime = formatDistanceToNowStrict(new Date(timestamp * 1000), { addSuffix: true });
	return textTime;
};

export const isGreaterOneMonth = (timestamp: number) => {
	const date = new Date(timestamp * 1000);
	const now = new Date();
	const result = differenceInDays(now, date);
	return result;
};

export const calculateTotalCount = (senders: SenderInfoOptionals[]) => {
	return senders.reduce((sum: number, item: SenderInfoOptionals) => sum + (item.count ?? 0), 0);
};

export const notImplementForGifOrStickerSendFromPanel = (data: ApiMessageAttachment) => {
	if (data.url?.includes('tenor.com') || data.filetype === 'image/gif') {
		return true;
	} else {
		return false;
	}
};

export const getVoiceChannelName = (clanName?: string, channelLabel?: string) => {
	return clanName?.replace(' ', '-') + '-' + channelLabel?.replace(' ', '-');
};

export const removeDuplicatesById = (array: any) => {
	return array.reduce((acc: any, current: any) => {
		const isDuplicate = acc.some((item: any) => item.id === current.id);
		if (!isDuplicate) {
			acc.push(current);
		}
		return acc;
	}, []);
};

export const getTimeDifferenceDate = (dateString: string) => {
	const now = new Date();
	const codeTime = new Date(dateString);
	const hoursDifference = differenceInHours(now, codeTime);
	const daysDifference = differenceInDays(now, codeTime);
	const monthsDifference = differenceInMonths(now, codeTime);
	if (hoursDifference < 24) {
		return `${hoursDifference}h`;
	} else if (daysDifference < 30) {
		return `${daysDifference}d`;
	} else {
		return `${monthsDifference}mo`;
	}
};

export const convertMarkdown = (markdown: string): string => {
	return markdown
		.split('```')
		.map((part, index) => {
			if (part.length === 0) {
				return '```';
			}
			const start = part.startsWith('\n');
			const end = part.endsWith('\n');

			if (start && end) {
				return part;
			}
			if (start) {
				return part + '\n';
			}
			if (end) {
				return '\n' + part;
			}
			return '\n' + part + '\n';
		})
		.join('');
};

export const getSrcEmoji = (id: string) => {
	return process.env.NX_BASE_IMG_URL + 'emojis/' + id + '.webp';
};

export const convertReactionDataFromMessage = (message: IMessageWithUser) => {
	const emojiDataItems: Record<string, EmojiDataOptionals> = {};
	message.reactions!.forEach((reaction) => {
		const key = `${message.id}_${reaction.sender_id}_${reaction.emoji}`;

		if (!emojiDataItems[key]) {
			emojiDataItems[key] = {
				id: reaction.id,
				emoji: reaction.emoji,
				emojiId: reaction.emoji_id,
				senders: [
					{
						sender_id: reaction.sender_id,
						count: reaction.count
					}
				],
				channel_id: message.channel_id,
				message_id: message.id
			};
		} else {
			const existingItem = emojiDataItems[key];

			if (existingItem.senders.length > 0) {
				existingItem.senders[0].count = reaction.count;
			}
		}
	});
	return Object.values(emojiDataItems);
};

export const checkLastChar = (text: string) => {
	if (
		text.charAt(text.length - 1) === ';' ||
		text.charAt(text.length - 1) === ',' ||
		text.charAt(text.length - 1) === '.' ||
		text.charAt(text.length - 1) === ':'
	) {
		return true;
	} else {
		return false;
	}
};

export const getNameForPrioritize = (clanNickname: string | undefined, displayName: string | undefined, username: string | undefined) => {
	if (clanNickname && clanNickname !== '') {
		return clanNickname;
	} else if (displayName && displayName !== '') {
		return displayName;
	} else {
		return username;
	}
};

export const getAvatarForPrioritize = (clanAvatar: string | undefined, userAvatar: string | undefined) => {
	if (clanAvatar && clanAvatar !== userAvatar) return clanAvatar;
	return userAvatar;
};

export function compareObjects(a: any, b: any, searchText: string, prioritizeProp: string, nameProp?: string) {
	const normalizedSearchText = searchText.toUpperCase();

	const aIndex = a[prioritizeProp]?.toUpperCase().indexOf(normalizedSearchText) ?? -1;
	const bIndex = b[prioritizeProp]?.toUpperCase().indexOf(normalizedSearchText) ?? -1;

	if (nameProp) {
		const aNameIndex = a[nameProp]?.toUpperCase().indexOf(normalizedSearchText) ?? -1;
		const bNameIndex = b[nameProp]?.toUpperCase().indexOf(normalizedSearchText) ?? -1;

		if (aIndex === -1 && bIndex === -1) {
			return aNameIndex - bNameIndex;
		}

		if (aIndex !== bIndex) {
			if (aIndex === -1) return 1;
			if (bIndex === -1) return -1;
			return aIndex - bIndex;
		}

		return aNameIndex - bNameIndex;
	} else {
		if (aIndex === -1 && bIndex === -1) {
			return 0;
		}

		if (aIndex !== bIndex) {
			if (aIndex === -1) return 1;
			if (bIndex === -1) return -1;
			return aIndex - bIndex;
		}
		return (a[prioritizeProp]?.toUpperCase() ?? '').localeCompare(b[prioritizeProp]?.toUpperCase() ?? '');
	}
}

export function normalizeString(str: string): string {
	if (str?.length)
		return str
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.toUpperCase();

	return '';
}

export function searchMentionsHashtag(searchValue: string, list: MentionDataProps[]) {
	if (!searchValue) return list;

	// Normalize and remove diacritical marks from the search value
	const normalizedSearchValue = normalizeString(searchValue).toUpperCase();
	const filteredList: MentionDataProps[] = list.filter((mention) => {
		const displayNormalized = normalizeString(mention.display ?? '').toUpperCase();
		const usernameNormalized = normalizeString(mention.username ?? '').toUpperCase();
		return displayNormalized.includes(normalizedSearchValue) || usernameNormalized.includes(normalizedSearchValue);
	});
	// Sort the filtered list
	const sortedList = filteredList.sort((a, b) => compareObjects(a, b, normalizedSearchValue, 'display', 'display'));
	return sortedList;
}

export const ValidateSpecialCharacters = () => {
	return /^(?![_\-\s])(?:(?!')[a-zA-Z0-9\p{L}\p{N}\p{Emoji_Presentation}_\-\s]){1,64}$/u;
};

export const checkSameDayByCreateTimeMs = (unixTime1: number, unixTime2: number) => {
	const date1 = fromUnixTime(unixTime1 / 1000);
	const date2 = fromUnixTime(unixTime2 / 1000);

	return isSameDay(date1, date2);
};

export const checkContinuousMessagesByCreateTimeMs = (unixTime1: number, unixTime2: number) => {
	return Math.abs(unixTime1 - unixTime2) <= TIME_COMBINE;
};

export const checkSameDayByCreateTime = (createTime1: string | Date, createTime2: string | Date) => {
	const ct1 = typeof createTime1 === 'string' ? createTime1 : createTime1.toISOString();
	const ct2 = typeof createTime2 === 'string' ? createTime2 : createTime2.toISOString();

	return Boolean(ct1 && ct2 && ct1.startsWith(ct2.substring(0, 10)));
};

export const formatTimeToMMSS = (duration: number): string => {
	const minutes = Math.floor(duration / 60);
	const seconds = Math.floor(duration % 60);
	return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

export const resizeFileImage = (file: File, maxWidth: number, maxHeight: number, type: string, minWidth?: number, minHeight?: number) =>
	new Promise((resolve) => {
		Resizer.imageFileResizer(
			file,
			maxWidth,
			maxHeight,
			'WEBP',
			100,
			0,
			(uri) => {
				resolve(uri);
			},
			type,
			minWidth,
			minHeight
		);
	});

export function findClanAvatarByUserId(userId: string, data: ClanUserListClanUser[]) {
	for (const item of data) {
		if (item?.user?.id === userId) {
			return item.clan_avatar;
		}
	}
	return '';
}

export function findClanNickByUserId(userId: string, data: ClanUserListClanUser[]) {
	for (const item of data) {
		if (item?.user?.id === userId) {
			return item.clan_nick;
		}
	}
	return '';
}

export function findDisplayNameByUserId(userId: string, data: ClanUserListClanUser[]) {
	for (const item of data) {
		if (item?.user?.id === userId) {
			return item.user.display_name;
		}
	}
	return '';
}

export function addAttributesSearchList(data: SearchItemProps[], dataUserClan: ClanUserListClanUser[]): SearchItemProps[] {
	return data.map((item) => {
		const avatarClanFinding = findClanAvatarByUserId(item.id ?? '', dataUserClan);
		const clanNickFinding = item?.clanNick;
		const prioritizeName = getNameForPrioritize(clanNickFinding ?? '', item.displayName ?? '', item.name ?? '');
		return {
			...item,
			clanAvatar: avatarClanFinding,
			clanNick: clanNickFinding,
			prioritizeName: prioritizeName
		};
	});
}

export function filterListByName(listSearch: SearchItemProps[], searchText: string, isSearchByUsername: boolean): SearchItemProps[] {
	const result = listSearch.filter((item: SearchItemProps) => {
		if (isSearchByUsername) {
			const searchName = normalizeString(searchText.slice(1));
			const itemDisplayName = item.displayName ? normalizeString(item.displayName) : '';
			const itemName = item.name ? normalizeString(item.name) : '';
			const itemPrioritizeName = item.prioritizeName ? normalizeString(item.prioritizeName) : '';

			return itemName.includes(searchName) || itemDisplayName.includes(searchName) || itemPrioritizeName.includes(searchName);
		} else {
			const searchUpper = normalizeString(searchText.startsWith('#') ? searchText.substring(1) : searchText);
			const prioritizeName = item.prioritizeName ? normalizeString(item.prioritizeName) : '';
			const itemName = item.name ? normalizeString(item.name) : '';
			const itemDisplayName = item.displayName ? normalizeString(item.displayName) : '';

			return prioritizeName.includes(searchUpper) || itemName.includes(searchUpper) || itemDisplayName.includes(searchUpper);
		}
	});

	return result;
}

export function sortFilteredList(filteredList: SearchItemProps[], searchText: string, isSearchByUsername: boolean): SearchItemProps[] {
	return filteredList.sort((a: SearchItemProps, b: SearchItemProps) => {
		if (searchText === '' || searchText.startsWith('@' || searchText.startsWith('#'))) {
			return (b.lastSentTimeStamp || 0) - (a.lastSentTimeStamp || 0);
		} else if (searchText.startsWith('#')) {
			return compareObjects(a, b, searchText.substring(1), 'prioritizeName');
		} else if (isSearchByUsername) {
			const searchWithoutAt = searchText.slice(1);
			return compareObjects(a, b, searchWithoutAt, 'name', 'prioritizeName');
		} else {
			return compareObjects(a, b, searchText, 'prioritizeName', 'name');
		}
	});
}
export const getRoleList = (rolesInClan: ApiRole[]) => {
	return rolesInClan.map((item) => ({
		roleId: item.id ?? '',
		roleName: item.title ?? ''
	}));
};

type ElementToken =
	| (IMentionOnMessage & { kindOf: ETokenMessage.MENTIONS })
	| (IHashtagOnMessage & { kindOf: ETokenMessage.HASHTAGS })
	| (IEmojiOnMessage & { kindOf: ETokenMessage.EMOJIS })
	| (ILinkOnMessage & { kindOf: ETokenMessage.LINKS })
	| (IMarkdownOnMessage & { kindOf: ETokenMessage.MARKDOWNS })
	| (ILinkVoiceRoomOnMessage & { kindOf: ETokenMessage.VOICE_LINKS });

export const createFormattedString = (data: IExtendedMessage): string => {
	const { t = '' } = data;
	const elements: ElementToken[] = [];
	(Object.keys(data) as (keyof IExtendedMessage)[]).forEach((key) => {
		const itemArray = data[key];

		if (Array.isArray(itemArray)) {
			itemArray.forEach((item) => {
				if (item) {
					const typedItem: ElementToken = { ...item, kindOf: key as any }; // Casting key as any
					elements.push(typedItem);
				}
			});
		}
	});

	elements.sort((a, b) => {
		const startA = a.s ?? 0;
		const startB = b.s ?? 0;
		return startA - startB;
	});
	let result = '';
	let lastIndex = 0;

	elements.forEach((element) => {
		const startindex = element.s ?? lastIndex;
		const endindex = element.e ?? startindex;
		result += t.slice(lastIndex, startindex);
		const contentInElement = t?.substring(startindex, endindex);
		switch (element.kindOf) {
			case ETokenMessage.MENTIONS: {
				if (element.user_id) {
					result += `@[${contentInElement.slice(1)}](${element.user_id})`;
				} else if (element.role_id) {
					result += `@[${contentInElement.slice(1)}](${element.role_id})`;
				}
				break;
			}
			case ETokenMessage.HASHTAGS:
				result += `#[${contentInElement.slice(1)}](${element.channelid})`;
				break;
			case ETokenMessage.EMOJIS:
				result += `::[${contentInElement}](${element.emojiid})`;
				break;
			case ETokenMessage.LINKS:
				result += `${contentInElement}`;
				break;
			case ETokenMessage.MARKDOWNS:
				result += `${contentInElement}`;
				break;
			case ETokenMessage.VOICE_LINKS:
				result += `${contentInElement}`;
				break;
			default:
				break;
		}
		lastIndex = endindex;
	});

	result += t.slice(lastIndex);

	return result;
};

export const processText = (inputString: string) => {
	const links: ILinkOnMessage[] = [];
	const markdowns: IMarkdownOnMessage[] = [];
	const voiceRooms: ILinkVoiceRoomOnMessage[] = [];

	const singleBacktick = '`';
	const tripleBacktick = '```';
	const httpPrefix = 'http';
	const googleMeetPrefix = 'https://meet.google.com/';

	let i = 0;
	while (i < inputString?.length) {
		if (inputString.startsWith(httpPrefix, i)) {
			// Link processing
			const startindex = i;
			i += httpPrefix.length;
			while (i < inputString?.length && ![' ', '\n', '\r', '\t'].includes(inputString[i])) {
				i++;
			}
			const endindex = i;
			const link = inputString.substring(startindex, endindex);

			if (link.startsWith(googleMeetPrefix)) {
				voiceRooms.push({
					s: startindex,
					e: endindex
				});
			} else {
				links.push({
					s: startindex,
					e: endindex
				});
			}
		} else if (inputString.substring(i, i + tripleBacktick.length) === tripleBacktick) {
			// Triple backtick markdown processing
			const startindex = i;
			i += tripleBacktick.length;
			let markdown = '';
			while (i < inputString?.length && inputString.substring(i, i + tripleBacktick.length) !== tripleBacktick) {
				markdown += inputString[i];
				i++;
			}
			if (i < inputString?.length && inputString.substring(i, i + tripleBacktick.length) === tripleBacktick) {
				i += tripleBacktick.length;
				const endindex = i;
				if (markdown.trim().length > 0) {
					markdowns.push({ type: EMarkdownType.TRIPLE, s: startindex, e: endindex });
				}
			}
		} else if (inputString[i] === singleBacktick) {
			// Single backtick markdown processing
			const startindex = i;
			i++;
			let markdown = '';
			while (i < inputString?.length && inputString[i] !== singleBacktick) {
				markdown += inputString[i];
				i++;
			}
			if (i < inputString?.length && inputString[i] === singleBacktick) {
				const endindex = i + 1;
				const nextChar = inputString[endindex];
				if (!markdown.includes('``') && markdown.trim().length > 0 && nextChar !== singleBacktick) {
					markdowns.push({ type: EMarkdownType.SINGLE, s: startindex, e: endindex });
				}
				i++;
			}
		} else {
			i++;
		}
	}
	return { links, markdowns, voiceRooms };
};

export function addMention(obj: IMessageSendPayload, mentionValue: IMentionOnMessage[]): IExtendedMessage {
	const updatedObj: IExtendedMessage = {
		...obj,
		mentions: mentionValue
	};

	return updatedObj;
}

export function isValidEmojiData(data: IExtendedMessage): boolean | undefined {
	if (data?.mentions && data.mentions.length !== 0) {
		return false;
	}

	const validShortnames = data?.ej?.map((emoji: IEmojiOnMessage) => data.t?.substring(emoji.s ?? 0, emoji.e));

	const text = typeof data?.t === 'string' ? data?.t : '';
	const shortnamesInT = text
		?.split(' ')
		?.map((shortname: string) => shortname.trim())
		?.filter((shortname: string) => shortname);

	return shortnamesInT?.every((name: string) => validShortnames?.includes(name)) && shortnamesInT.join(' ') === text?.trim();
}
export const buildLPSArray = (pattern: string): number[] => {
	const lps = Array(pattern.length).fill(0);
	let len = 0;
	let i = 1;

	while (i < pattern.length) {
		if (pattern[i] === pattern[len]) {
			len++;
			lps[i] = len;
			i++;
		} else {
			if (len !== 0) {
				len = lps[len - 1];
			} else {
				lps[i] = 0;
				i++;
			}
		}
	}
	return lps;
};

export const KMPHighlight = (text: string, pattern: string): number[] => {
	const lps = buildLPSArray(pattern);
	const matchPositions: number[] = [];
	let i = 0;
	let j = 0;

	while (i < text.length) {
		if (pattern[j] === text[i]) {
			i++;
			j++;
		}

		if (j === pattern.length) {
			matchPositions.push(i - j);
			j = lps[j - 1];
		} else if (i < text.length && pattern[j] !== text[i]) {
			if (j !== 0) {
				j = lps[j - 1];
			} else {
				i++;
			}
		}
	}

	return matchPositions;
};

export function filterEmptyArrays<T extends Record<string, any>>(payload: T): T {
	return Object.entries(payload)
		.filter(([_, value]) => !(Array.isArray(value) && value.length === 0))
		.reduce((acc, [key, value]) => {
			return { ...acc, [key]: value };
		}, {} as T);
}

export async function fetchAndCreateFiles(fileData: ApiMessageAttachment[] | null): Promise<File[]> {
	if (!fileData || fileData.length === 0) {
		throw new Error('No file data provided.');
	}

	const createdFiles = await Promise.all(
		fileData.map(async (file) => {
			if (!file.url) {
				throw new Error(`File URL is missing for file: ${file.filename}`);
			}

			const response = await fetch(file.url);
			const blob = await response.blob();
			const createdFile = new File([blob], file.filename ?? 'untitled', { type: file.filetype || 'application/octet-stream' });
			return createdFile;
		})
	);

	return createdFiles;
}

export async function getWebUploadedAttachments(payload: {
	attachments: ApiMessageAttachment[];
	client: Client;
	session: Session;
	clanId: string;
	channelId: string;
}): Promise<ApiMessageAttachment[]> {
	const { attachments, client, session, clanId, channelId } = payload;
	if (!attachments || attachments?.length === 0) {
		return [];
	}
	const directLinks = attachments.filter((att) => att.url?.includes(EMimeTypes.tenor) || att.url?.includes(EMimeTypes.cdnmezon));
	const nonDirectAttachments = attachments.filter((att) => !att.url?.includes(EMimeTypes.tenor) && !att.url?.includes(EMimeTypes.cdnmezon));

	if (nonDirectAttachments.length > 0) {
		const createdFiles = await fetchAndCreateFiles(nonDirectAttachments);
		const uploadPromises = createdFiles.map((file, index) => {
			return handleUploadFile(client, session, clanId, channelId, file.name, file, index);
		});

		return await Promise.all(uploadPromises);
	}

	return directLinks.map((link) => ({ url: link.url, filetype: link.filetype, filename: link.filename }));
}

export async function getMobileUploadedAttachments(payload: {
	attachments: ApiMessageAttachment[];
	client: Client;
	session: Session;
	clanId: string;
	channelId: string;
}): Promise<ApiMessageAttachment[]> {
	const { attachments, client, session, clanId, channelId } = payload;
	if (!attachments || attachments?.length === 0) {
		return [];
	}
	const directLinks = attachments.filter((att) => att.url?.includes(EMimeTypes.tenor) || att.url?.includes(EMimeTypes.cdnmezon));
	const nonDirectAttachments = attachments.filter((att) => !att.url?.includes(EMimeTypes.tenor) && !att.url?.includes(EMimeTypes.cdnmezon));

	if (nonDirectAttachments.length > 0) {
		const uploadPromises = nonDirectAttachments.map(async (att) => {
			// const fileData = await RNFS.readFile(att?.url || '', 'base64');
			const fileData = att;
			const formattedFile = {
				type: att?.filetype,
				uri: att?.url,
				size: att?.size,
				fileData
			};
			return await handleUploadFileMobile(client, session, clanId, channelId, att?.filename || '', formattedFile);
		});
		return await Promise.all(uploadPromises);
	}
	return directLinks.map((link) => ({ url: link.url, filetype: link.filetype }));
}

export const blankReferenceObj: ApiMessageRef = {
	message_id: '',
	message_ref_id: '',
	ref_type: 0,
	message_sender_id: '',
	message_sender_username: '',
	mesages_sender_avatar: '',
	message_sender_clan_nick: '',
	message_sender_display_name: '',
	content: '',
	has_attachment: false,
	channel_id: '',
	mode: 0,
	channel_label: ''
};

export const handleShowShortProfile = (
	ref: React.RefObject<HTMLElement>,
	WIDTH_PANEL_PROFILE: number,
	HEIGHT_PANEL_PROFILE: number,
	setIsShowPanelChannel: (show: boolean) => void,
	setPosShortProfile: (position: { top: number | string; bottom: number | string; left: number | string; right: number | string }) => void
) => {
	setIsShowPanelChannel(true);

	const rect = ref.current?.getBoundingClientRect() || { height: 0, left: 0, right: 0, top: 0, bottom: 0 };

	const heightOfMention = rect.height;
	const offSetLeftMention = rect.left;
	const offSetRightMention = rect.right;
	const offSetTopMention = rect.top;
	const offSetBottomMention = rect.bottom;

	// Window dimensions
	const windowHeight = window.innerHeight;
	const windowWidth = window.innerWidth;

	let topComputed: number | string;
	let bottomComputed: number | string;
	let rightComputed: number | string;
	let leftComputed: number | string;

	// Determine left position
	if (windowWidth - offSetRightMention > WIDTH_PANEL_PROFILE) {
		leftComputed = offSetRightMention + 10;
		rightComputed = 'auto';
	} else {
		leftComputed = 'auto';
		rightComputed = windowWidth - offSetLeftMention + 10;
	}

	// Determine top position
	if (windowHeight - offSetBottomMention > HEIGHT_PANEL_PROFILE) {
		topComputed = offSetTopMention - heightOfMention + 3;
		bottomComputed = 'auto';
	} else {
		topComputed = offSetBottomMention - HEIGHT_PANEL_PROFILE + 3;
		bottomComputed = 'auto';
	}

	// Update panel position
	setPosShortProfile({
		top: topComputed,
		bottom: bottomComputed,
		left: leftComputed,
		right: rightComputed
	});
};
