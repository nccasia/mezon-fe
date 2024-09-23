import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useChatReaction } from '@mezon/core';
import { FaceIcon } from '@mezon/mobile-components';
import { Colors, useTheme } from '@mezon/mobile-ui';
import { selectChannelById, selectComputedReactionsByMessageId, selectCurrentChannel } from '@mezon/store-mobile';
import { EmojiDataOptionals, SenderInfoOptionals, calculateTotalCount, getSrcEmoji } from '@mezon/utils';
import { ChannelStreamMode } from 'mezon-js';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useSelector } from 'react-redux';
import { UserInformationBottomSheet } from '../../../../../../app/components/UserInformationBottomSheet';
import { IMessageReactionProps } from '../../types';
import { MessageReactionBS } from './components/MessageReactionBS';
import { style } from './styles';

export const MessageAction = React.memo((props: IMessageReactionProps) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const { message, openEmojiPicker, mode, preventAction = false, userProfile } = props || {};
	const [currentEmojiSelectedId, setCurrentEmojiSelectedId] = useState<string | null>(null);
	const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
	const { reactionMessageDispatch } = useChatReaction({ isMobile: true });
	const currentChannel = useSelector(selectCurrentChannel);
	const messageReactions = useSelector(selectComputedReactionsByMessageId(message.id));
	const parent = useSelector(selectChannelById(currentChannel?.parrent_id || ''));
	const bottomSheetRef = useRef<BottomSheetModal>(null);

	const userId = useMemo(() => userProfile?.user?.id, [userProfile?.user?.id]);

	const reactOnExistEmoji = async (
		id: string,
		mode: number,
		messageId: string,
		emoji_id: string,
		emoji: string,
		count: number,
		message_sender_id: string,
		action_delete?: boolean
	) => {
		await reactionMessageDispatch(
			id,
			mode ?? ChannelStreamMode.STREAM_MODE_CHANNEL,
			currentChannel?.parrent_id || '',
			currentChannel?.clan_id ?? '',
			currentChannel?.id ?? '',
			messageId ?? '',
			emoji_id,
			emoji?.trim() ?? '',
			1,
			message_sender_id ?? '',
			false,
			mode !== ChannelStreamMode?.STREAM_MODE_CHANNEL ? false : currentChannel ? !currentChannel.channel_private : false,
			parent ? !parent.channel_private : false
		);
	};

	const removeEmoji = async (emojiData: EmojiDataOptionals) => {
		const { id, emoji, senders, emojiId } = emojiData;
		const countToRemove = senders.find((sender) => sender.sender_id === userId)?.count;
		await reactionMessageDispatch(
			id,
			mode ?? ChannelStreamMode.STREAM_MODE_CHANNEL,
			currentChannel?.parrent_id || '',
			currentChannel?.clan_id ?? '',
			currentChannel?.id ?? '',
			message.id ?? '',
			emojiId,
			emoji,
			countToRemove,
			userId ?? '',
			true,
			mode !== ChannelStreamMode?.STREAM_MODE_CHANNEL ? false : currentChannel ? !currentChannel.channel_private : false,
			parent ? !parent.channel_private : false
		);
	};

	const allReactionDataOnOneMessage = useMemo(() => {
		return messageReactions
			?.filter?.((emoji: EmojiDataOptionals) => emoji.message_id === message.id && emoji.senders.some((sender) => sender.count > 0))
			.map((emoji) => {
				if (Number(emoji.id) === 0) {
					const tempId = `${emoji.emojiId}`;
					return { ...emoji, id: tempId };
				}
				return emoji;
			});
	}, [messageReactions, message]);

	const onReactItemLongPress = (emojiId: string) => {
		bottomSheetRef.current?.present();
		setCurrentEmojiSelectedId(emojiId);
	};

	const onShowUserInformation = useCallback((userId: string) => {
		bottomSheetRef.current?.close();
		setSelectedUserId(userId);
	}, []);

	const onCloseUserInformationBottomSheet = useCallback(() => {
		setSelectedUserId(null);
	}, []);

	return (
		<View style={[styles.reactionWrapper, allReactionDataOnOneMessage.length > 0 && styles.reactionSpace]}>
			{allReactionDataOnOneMessage?.map((emojiItemData: EmojiDataOptionals, index) => {
				const userSender = emojiItemData.senders.find((sender: SenderInfoOptionals) => sender.sender_id === userId);
				const isMyReaction = userSender?.count && userSender.count > 0;

				if (calculateTotalCount(emojiItemData.senders) === 0) {
					return null;
				}
				if (!emojiItemData?.emojiId) return null;
				return (
					<Pressable
						onLongPress={() => !preventAction && onReactItemLongPress(emojiItemData.id)}
						onPress={() => {
							if (preventAction) return;
							reactOnExistEmoji(
								emojiItemData.id ?? '',
								ChannelStreamMode.STREAM_MODE_CHANNEL,
								message.id ?? '',
								emojiItemData.emojiId ?? '',
								emojiItemData.emoji ?? '',
								1,
								userId ?? '',
								false
							);
						}}
						key={index + emojiItemData.emojiId}
						style={[styles.reactItem, isMyReaction ? styles.myReaction : styles.otherReaction]}
					>
						<FastImage
							source={{ uri: getSrcEmoji(emojiItemData.emojiId ?? '') }}
							style={styles.iconEmojiReaction}
							resizeMode={'contain'}
						/>
						<Text style={styles.reactCount}>{calculateTotalCount(emojiItemData.senders)}</Text>
					</Pressable>
				);
			})}

			{allReactionDataOnOneMessage?.length ? (
				<Pressable onPress={() => !preventAction && openEmojiPicker?.()} style={styles.addEmojiIcon}>
					<FaceIcon color={Colors.gray72} />
				</Pressable>
			) : null}

			<MessageReactionBS
				bottomSheetRef={bottomSheetRef}
				allReactionDataOnOneMessage={allReactionDataOnOneMessage}
				emojiSelectedId={currentEmojiSelectedId}
				onClose={() => setCurrentEmojiSelectedId(null)}
				removeEmoji={removeEmoji}
				onShowUserInformation={onShowUserInformation}
				userId={userId}
				channelId={message?.channel_id}
			/>

			<UserInformationBottomSheet userId={selectedUserId} onClose={onCloseUserInformationBottomSheet} />
		</View>
	);
});
