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
	subDays,
} from 'date-fns';
import { ApiMessageAttachment } from 'mezon-js/api.gen';
import { RefObject } from 'react';
import { TIME_COMBINE } from '../constant';
import { ChannelMembersEntity, EmojiDataOptionals, ILineMention, IMessageWithUser, SenderInfoOptionals, UsersClanEntity } from '../types/index';

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

export const uniqueUsers = (mentions: ILineMention[], userClans: UsersClanEntity[], userChannels: ChannelMembersEntity[]) => {
	const userMentions = Array.from(new Set(mentions.map((user) => user.matchedText)));

	const userMentionsFormat = userMentions.map((user) => user.substring(1));

	const usersNotInChannels = userMentionsFormat.filter(
		(username) => !userChannels.map((user) => user.user).some((user) => user?.username === username),
	);

	const userInClans = userClans.map((clan) => clan.user);

	const userIds = userInClans.filter((user) => usersNotInChannels.includes(user?.username as string)).map((user) => user?.id as string);

	return userIds;
};

export const convertTimeMessage = (timestamp: string) => {
	const textTime = formatDistanceToNowStrict(new Date(parseInt(timestamp) * 1000), { addSuffix: true });
	return textTime;
};

export const isGreaterOneMonth = (timestamp: string) => {
	const date = new Date(parseInt(timestamp) * 1000);
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

export const getSrcEmoji = (shortname: string, emojiListPNG: any[]) => {
	const emoji = emojiListPNG.find((emoji) => emoji.shortname === shortname);
	return emoji ? emoji.src : undefined;
};

export const updateEmojiReactionData = (data: any[]) => {
	const dataItemReaction: Record<string, EmojiDataOptionals> = {};

	data &&
		data.forEach((item) => {
			const key = `${item.emoji}_${item.channel_id}_${item.message_id}`;
			if (!dataItemReaction[key]) {
				dataItemReaction[key] = {
					id: item.id,
					emoji: item.emoji,
					senders: [
						{
							sender_id: item.senders[0]?.sender_id ?? '',
							count: item.senders[0]?.count ?? 0,
						},
					],
					channel_id: item.channel_id,
					message_id: item.message_id,
				};
			} else {
				const existingItem = dataItemReaction[key];
				const senderIndex = existingItem.senders.findIndex((sender) => sender.sender_id === item.senders[0]?.sender_id);

				if (senderIndex !== -1) {
					existingItem.senders[senderIndex].count += item.senders[0]?.count ?? 0;
				} else {
					existingItem.senders.push({
						sender_id: item.senders[0]?.sender_id ?? '',
						count: item.senders[0]?.count ?? 0,
					});
				}
			}
		});
	return Object.values(dataItemReaction);
};

export const convertReactionDataFromMessage = (message: IMessageWithUser) => {
	const emojiDataItems: Record<string, EmojiDataOptionals> = {};
	message.reactions!.forEach((reaction) => {
		const key = `${message.id}_${reaction.sender_id}_${reaction.emoji}`;

		if (!emojiDataItems[key]) {
			emojiDataItems[key] = {
				id: reaction.id,
				emoji: reaction.emoji,
				senders: [
					{
						sender_id: reaction.sender_id,
						count: reaction.count,
					},
				],
				channel_id: message.channel_id,
				message_id: message.id,
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

export function searchMentionsHashtag(searchValue: any, list: any[]) {
	if (!searchValue) return list;
	const lowerCaseSearchValue = searchValue.toLowerCase();
	return list
		.filter((mention) => mention.display.toLowerCase().includes(lowerCaseSearchValue))
		.sort((a, b) => {
			const displayA = a.display.toLowerCase();
			const displayB = b.display.toLowerCase();
			const indexA = displayA.indexOf(lowerCaseSearchValue);
			const indexB = displayB.indexOf(lowerCaseSearchValue);

			if (indexA !== -1 && indexB !== -1) {
				return indexA - indexB;
			} else if (indexA !== -1) {
				return -1;
			} else if (indexB !== -1) {
				return 1;
			} else {
				return displayA.localeCompare(displayB);
			}
		});
}

export const ValidateSpecialCharacters = () => {
	return /^(?![_\-\s])[a-zA-Z0-9\p{L}\p{N}\p{Emoji_Presentation}_\-\s]{1,64}$/u;
};

export const checkSameDayByCreateTimeMs = (unixTime1: number, unixTime2: number) => {
	const date1 = fromUnixTime(unixTime1 / 1000);
	const date2 = fromUnixTime(unixTime2 / 1000);

	return isSameDay(date1, date2);
};

export const checkContinuousMessagesByCreateTimeMs = (unixTime1: number, unixTime2: number) => {
	return Math.abs(unixTime1 - unixTime2) <= TIME_COMBINE * 1000;
};

export const checkSameDayByCreateTime = (createTime1: string | Date, createTime2: string | Date) => {
	const ct1 = typeof createTime1 === 'string' ? createTime1 : createTime1.toISOString();
	const ct2 = typeof createTime2 === 'string' ? createTime2 : createTime2.toISOString();

	return Boolean(ct1 && ct2 && ct1.startsWith(ct2.substring(0, 10)));
};
