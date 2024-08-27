import { useChannels } from '@mezon/core';
import { emojiSuggestionActions, selectAllEmojiSuggestion } from '@mezon/store';
import { selectHashtagDMByDirectId, useAppDispatch } from '@mezon/store-mobile';
import { MentionDataProps } from '@mezon/utils';
import { ChannelStreamMode } from 'mezon-js';
import React, { FC, memo, useEffect, useMemo } from 'react';
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
	directMessageId: string;
	mode: number;
}

const HashtagSuggestions: FC<MentionHashtagSuggestionsProps> = React.memo(({ keyword, onSelect, directMessageId, mode }) => {
	const { channels } = useChannels();
	const commonChannelDms = useSelector(selectHashtagDMByDirectId(directMessageId || ''));

	const listChannelsMention = useMemo(() => {
		let channelsMention = [];
		if ([ChannelStreamMode.STREAM_MODE_DM].includes(mode)) {
			channelsMention = commonChannelDms;
		} else {
			channelsMention = channels;
		}
		return channelsMention?.map((item) => ({
			...item,
			id: item?.channel_id ?? '',
			display: item?.channel_label ?? '',
			subText: item?.category_name ?? '',
			name: item?.channel_label ?? '',
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
						channel={item}
						channelId={item?.id}
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
});

export interface IEmojiSuggestionProps {
	keyword?: string;
	onSelect: (emoji: any) => void;
}

const EmojiSuggestion: FC<IEmojiSuggestionProps> = ({ keyword, onSelect }) => {
	const emojiListPNG = useSelector(selectAllEmojiSuggestion);
	const dispatch = useAppDispatch();

	if (!keyword) {
		return;
	}
	const handleEmojiSuggestionPress = (emoji: ApiClanEmojiListResponse) => {
		onSelect({
			...emoji,
			display: emoji.shortname,
			name: emoji.shortname,
		});
		dispatch(
			emojiSuggestionActions.setSuggestionEmojiObjPicked({
				shortName: emoji.shortname,
				id: emoji.id,
			}),
		);
	};

	return (
		<FlatList
			style={{ maxHeight: 200 }}
			data={emojiListPNG?.filter((emoji) => emoji?.shortname && emoji?.shortname?.indexOf(keyword?.toLowerCase()) > -1)?.slice(0, 20)}
			renderItem={({ item }) => (
				<Pressable onPress={() => handleEmojiSuggestionPress(item)}>
					<SuggestItem isDisplayDefaultAvatar={false} name={item?.shortname ?? ''} emojiId={item?.id} />
				</Pressable>
			)}
			keyExtractor={(_, index) => index.toString()}
			onEndReachedThreshold={0.1}
			keyboardShouldPersistTaps="handled"
		/>
	);
};

export { EmojiSuggestion, HashtagSuggestions, Suggestions };

