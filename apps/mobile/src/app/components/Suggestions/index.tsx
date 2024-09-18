import { emojiSuggestionActions, selectAllChannels, selectAllEmojiSuggestion } from '@mezon/store';
import { selectAllHashtagDm, useAppDispatch } from '@mezon/store-mobile';
import { MentionDataProps } from '@mezon/utils';
import { ChannelStreamMode } from 'mezon-js';
import { FC, memo, useEffect, useMemo } from 'react';
import { FlatList, LayoutAnimation, Pressable } from 'react-native';
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
			LayoutAnimation.configureNext(LayoutAnimation.create(200, LayoutAnimation.Types['easeInEaseOut'], LayoutAnimation.Properties['opacity']));
			const mentionSearchText = keyword?.toLocaleLowerCase();

			const filterMatchedMentions = (mentionData: MentionDataProps) => {
				return mentionData?.display?.toLocaleLowerCase()?.includes(mentionSearchText);
			};

			return listMentions.filter(filterMatchedMentions).map((item) => ({
				...item,
				name: item?.display
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
	}
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
	directMessageId: string;
	mode: number;
}

const HashtagSuggestions: FC<MentionHashtagSuggestionsProps> = ({ keyword, onSelect, directMessageId, mode }) => {
	const channels = useSelector(selectAllChannels);
	const commonChannelDms = useSelector(selectAllHashtagDm);
	const listChannelsMention = useMemo(() => {
		let channelsMention = [];
		LayoutAnimation.configureNext(LayoutAnimation.create(200, LayoutAnimation.Types['easeInEaseOut'], LayoutAnimation.Properties['opacity']));
		if ([ChannelStreamMode.STREAM_MODE_DM].includes(mode)) {
			channelsMention = commonChannelDms;
		} else {
			channelsMention = channels;
		}
		return channelsMention?.map((item) => ({
			...item,
			id: item?.channel_id ?? '',
			display: item?.channel_label ?? '',
			subText: (item?.category_name || item?.clan_name) ?? '',
			name: item?.channel_label ?? ''
		}));
	}, [channels, commonChannelDms, mode]);
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
					<SuggestItem
						channelId={item?.id}
						channel={item}
						isDisplayDefaultAvatar={false}
						name={item?.display ?? ''}
						subText={(item as ChannelsMention).subText.toUpperCase()}
					/>
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
	onSelect: (emoji: any) => void;
}

const EmojiSuggestion: FC<IEmojiSuggestionProps> = ({ keyword, onSelect }) => {
	const emojiListPNG = useSelector(selectAllEmojiSuggestion);
	const dispatch = useAppDispatch();

	const formattedEmojiList = useMemo(() => {
		if (!keyword) {
			return [];
		}
		LayoutAnimation.configureNext(LayoutAnimation.create(200, LayoutAnimation.Types['easeInEaseOut'], LayoutAnimation.Properties['opacity']));
		return emojiListPNG?.filter((emoji) => emoji?.shortname && emoji?.shortname?.indexOf(keyword?.toLowerCase()) > -1)?.slice(0, 20);
	}, [keyword, emojiListPNG]);

	const handleEmojiSuggestionPress = (emoji: any) => {
		const emojiItemName = `:${emoji?.shortname?.split?.(':')?.join('')}:`;
		onSelect({
			...emoji,
			display: emojiItemName,
			name: emojiItemName
		});
		dispatch(
			emojiSuggestionActions.setSuggestionEmojiObjPicked({
				shortName: emojiItemName,
				id: emoji.id
			})
		);
	};

	return (
		<FlatList
			style={{ maxHeight: 200 }}
			data={formattedEmojiList}
			renderItem={({ item }) => (
				<Pressable onPress={() => handleEmojiSuggestionPress(item)}>
					<SuggestItem isDisplayDefaultAvatar={false} name={`:${item?.shortname?.split?.(':')?.join('')}:` ?? ''} emojiId={item?.id} />
				</Pressable>
			)}
			keyExtractor={(_, index) => index.toString()}
			onEndReachedThreshold={0.1}
			keyboardShouldPersistTaps="handled"
		/>
	);
};

export { EmojiSuggestion, HashtagSuggestions, Suggestions };
