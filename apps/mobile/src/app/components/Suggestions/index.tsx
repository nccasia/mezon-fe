import { useChannels } from '@mezon/core';
import { selectAllEmojiSuggestion } from '@mezon/store';
import { MentionDataProps } from '@mezon/utils';
import { FC, memo, useEffect, useMemo } from 'react';
import { FlatList, Pressable } from 'react-native';
import { useSelector } from 'react-redux';
import UseMentionList from '../../hooks/useUserMentionList';
import { EMessageActionType } from '../../screens/home/homedrawer/enums';
import { IMessageActionNeedToResolve } from '../../screens/home/homedrawer/types';
import SuggestItem from './SuggestItem';

export interface MentionSuggestionsProps {
	channelId: string;
	keyword?: string;
	onSelect: (user: MentionDataProps) => void;
	messageActionNeedToResolve: IMessageActionNeedToResolve | null;
	onAddMentionMessageAction?: (mentionData: MentionDataProps[]) => void;
	mentionTextValue?: string;
	channelMode?: number;
}

const Suggestions: FC<MentionSuggestionsProps> = memo(
	({ keyword, onSelect, channelId, messageActionNeedToResolve, onAddMentionMessageAction, mentionTextValue, channelMode }) => {
		const listMentions = UseMentionList(channelId || '', channelMode);

		useEffect(() => {
			if (messageActionNeedToResolve?.type === EMessageActionType.Mention) {
				onAddMentionMessageAction(listMentions);
			}
		}, [messageActionNeedToResolve]);

		const formattedMentionList = useMemo(() => {
			if (keyword === null || !listMentions.length) {
				return [];
			}

			const mentionSearchText = keyword?.toLocaleLowerCase();

			const filterMatchedMentions = (mentionData: MentionDataProps) => {
				return mentionData?.display?.toLocaleLowerCase()?.includes(mentionSearchText);
			};

			return listMentions.filter(filterMatchedMentions).map((item) => ({
				...item,
				name: item?.display,
			}));
		}, [keyword, listMentions]);

		if (keyword == null) {
			return null;
		}

		const handleSuggestionPress = (user: MentionDataProps) => {
			onSelect(user as MentionDataProps);
		};
		return (
			<FlatList
				style={{ maxHeight: 200 }}
				data={formattedMentionList}
				renderItem={({ item }) => (
					<Pressable onPress={() => handleSuggestionPress(item)}>
						<SuggestItem
							isRoleUser={item?.isRoleUser}
							isDisplayDefaultAvatar={true}
							name={item?.display ?? ''}
							avatarUrl={item.avatarUrl}
							subText={item?.username}
						/>
					</Pressable>
				)}
				keyExtractor={(_, index) => index.toString()}
				onEndReachedThreshold={0.1}
				keyboardShouldPersistTaps="handled"
			/>
		);
	},
);

export type ChannelsMention = {
	id: string;
	display: string;
	subText: string;
	name?: string;
};

export interface MentionHashtagSuggestionsProps {
	// readonly listChannelsMention?: ChannelsMention[];
	// channelId: string;
	keyword?: string;
	onSelect: (user: MentionDataProps) => void;
}

const HashtagSuggestions: FC<MentionHashtagSuggestionsProps> = ({ keyword, onSelect }) => {
	const { listChannels } = useChannels();

	const listChannelsMention = useMemo(() => {
		return listChannels.map((item) => ({
			id: item?.channel_id ?? '',
			display: item?.channel_label ?? '',
			subText: item?.category_name ?? '',
			name: item?.channel_label ?? '',
		}));
	}, [listChannels]);
	if (keyword == null) {
		return null;
	}

	const handleSuggestionPress = (channel: ChannelsMention) => {
		onSelect(channel);
	};

	return (
		<FlatList
			style={{ maxHeight: 200 }}
			data={listChannelsMention?.filter((item) => item?.name?.toLocaleLowerCase().includes(keyword?.toLocaleLowerCase()))}
			renderItem={({ item }) => (
				<Pressable onPress={() => handleSuggestionPress(item)}>
					<SuggestItem isDisplayDefaultAvatar={false} name={item?.display ?? ''} symbol="#" subText={(item as ChannelsMention).subText} />
				</Pressable>
			)}
			keyExtractor={(_, index) => index.toString()}
			onEndReachedThreshold={0.1}
			keyboardShouldPersistTaps="handled"
		/>
	);
};

export interface IEmojiSuggestionProps {
	keyword?: string;
	onSelect: (emoji: IEmoji) => void;
}

export type IEmoji = {
	src: string;
	shortname: string;
	category: string;
	id: string;
	name: string;
};

const EmojiSuggestion: FC<IEmojiSuggestionProps> = ({ keyword, onSelect }) => {
	const emojiListPNG = useSelector(selectAllEmojiSuggestion);

	let emojiData = [];
	if (!keyword) {
		return;
	}
	emojiData = emojiListPNG?.map?.((emoji) => ({
		...emoji,
		name: emoji?.shortname,
		id: emoji?.shortname,
		display: emoji?.shortname,
	}));

	const handleEmojiSuggestionPress = (emoji: IEmoji) => {
		onSelect(emoji);
	};

	return (
		<FlatList
			style={{ maxHeight: 200 }}
			data={emojiData?.filter((emoji) => emoji?.shortname && emoji?.shortname?.indexOf(keyword?.toLowerCase()) > -1)?.slice(0, 20)}
			renderItem={({ item }) => (
				<Pressable onPress={() => handleEmojiSuggestionPress(item)}>
					<SuggestItem isDisplayDefaultAvatar={false} name={item?.display ?? ''} />
				</Pressable>
			)}
			keyExtractor={(_, index) => index.toString()}
			onEndReachedThreshold={0.1}
			keyboardShouldPersistTaps="handled"
		/>
	);
};

export { EmojiSuggestion, HashtagSuggestions, Suggestions };
