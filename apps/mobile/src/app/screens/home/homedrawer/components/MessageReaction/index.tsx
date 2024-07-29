import { useChatReaction } from '@mezon/core';
import { FaceIcon, TrashIcon } from '@mezon/mobile-components';
import { Colors, useTheme } from '@mezon/mobile-ui';
import { selectAllEmojiSuggestion, selectComputedReactionsByMessageId, selectCurrentChannel, selectMemberByUserId } from '@mezon/store-mobile';
import { EmojiDataOptionals, SenderInfoOptionals, calculateTotalCount, getSrcEmoji } from '@mezon/utils';
import { ChannelStreamMode } from 'mezon-js';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, Text, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { ScrollView } from 'react-native-gesture-handler';
import BottomSheet from 'react-native-raw-bottom-sheet';
import { useSelector } from 'react-redux';
import { UserInformationBottomSheet } from '../../../../../../app/components/UserInformationBottomSheet';
import { IDetailReactionBottomSheet, IMessageReactionProps } from '../../types';
import { style } from './styles';

export const MessageAction = React.memo((props: IMessageReactionProps) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const { message, openEmojiPicker, mode, preventAction = false, userProfile } = props || {};
	const [currentEmojiSelectedId, setCurrentEmojiSelectedId] = useState<string | null>(null);
	const { reactionMessageDispatch } = useChatReaction();
	const currentChannel = useSelector(selectCurrentChannel);
	const messageReactions = useSelector(selectComputedReactionsByMessageId(message.id));
	const emojiListPNG = useSelector(selectAllEmojiSuggestion);

	const userId = useMemo(() => userProfile?.user?.id, [userProfile?.user?.id]);

	const reactOnExistEmoji = async (
		id: string,
		mode: number,
		messageId: string,
		emoji: string,
		count: number,
		message_sender_id: string,
		action_delete?: boolean,
	) => {
		await reactionMessageDispatch(
			id,
			mode ?? ChannelStreamMode.STREAM_MODE_CHANNEL,
			currentChannel?.clan_id ?? '',
			currentChannel?.id ?? '',
			messageId ?? '',
			emoji?.trim() ?? '',
			1,
			message_sender_id ?? '',
			false,
		);
	};

	const removeEmoji = async (emojiData: EmojiDataOptionals) => {
		const { id, emoji, senders } = emojiData;
		const countToRemove = senders.find((sender) => sender.sender_id === userId)?.count;
		await reactionMessageDispatch(
			id,
			mode ?? ChannelStreamMode.STREAM_MODE_CHANNEL,
			currentChannel?.clan_id ?? '',
			currentChannel?.id ?? '',
			message.id ?? '',
			emoji,
			countToRemove,
			userId ?? '',
			true,
		);
	};

	const allReactionDataOnOneMessage = useMemo(() => {
		return messageReactions
			?.filter?.((emoji: EmojiDataOptionals) => emoji.message_id === message.id && emoji.senders.some((sender) => sender.count > 0))
			.map((emoji) => {
				if (Number(emoji.id) === 0) {
					const tempId = `${emoji.message_id}-${emoji.emoji}`;
					return { ...emoji, id: tempId };
				}
				return emoji;
			});
	}, [messageReactions, message]);

	return (
		<View style={styles.reactionWrapper}>
			{allReactionDataOnOneMessage?.map((emojiItemData: EmojiDataOptionals, index) => {
				const userSender = emojiItemData.senders.find((sender: SenderInfoOptionals) => sender.sender_id === userId);
				const isMyReaction = userSender?.count && userSender.count > 0;

				if (calculateTotalCount(emojiItemData.senders) === 0) {
					return null;
				}

				return (
					<Pressable
						onLongPress={() => !preventAction && setCurrentEmojiSelectedId(emojiItemData.id)}
						onPress={() => {
							if (preventAction) return;
							reactOnExistEmoji(
								emojiItemData.id ?? '',
								ChannelStreamMode.STREAM_MODE_CHANNEL,
								message.id ?? '',
								emojiItemData.emoji ?? '',
								1,
								userId ?? '',
								false,
							);
						}}
						key={index + emojiItemData.id}
						style={[styles.reactItem, isMyReaction ? styles.myReaction : styles.otherReaction]}
					>
						<FastImage
							source={{ uri: getSrcEmoji(emojiItemData.emoji ?? '', emojiListPNG || []) }}
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

			<ReactionDetail
				allReactionDataOnOneMessage={allReactionDataOnOneMessage}
				emojiSelectedId={currentEmojiSelectedId}
				onClose={() => setCurrentEmojiSelectedId(null)}
				emojiListPNG={emojiListPNG}
				removeEmoji={removeEmoji}
				userId={userId}
			/>
		</View>
	);
});

const ReactionDetail = React.memo((props: IDetailReactionBottomSheet) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const { emojiSelectedId, onClose, allReactionDataOnOneMessage, emojiListPNG, removeEmoji, userId } = props;
	const [selectedTabId, setSelectedTabId] = useState<string | null>(null);
	const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
	const [showConfirmDeleteEmoji, setShowConfirmDeleteEmoji] = useState<boolean>(false);
	const { t } = useTranslation('message');
	const ref = useRef(null);

	const getTabHeader = () => {
		return allReactionDataOnOneMessage.map((emojiItem) => {
			return (
				<Pressable
					key={emojiItem.id}
					onPress={() => selectEmoji(emojiItem.id)}
					style={[styles.tabHeaderItem, selectedTabId === emojiItem.id && styles.activeTab]}
				>
					<FastImage
						source={{
							uri: getSrcEmoji(emojiItem.emoji, emojiListPNG || []),
						}}
						resizeMode={'contain'}
						style={styles.iconEmojiReactionDetail}
					/>
					<Text style={[styles.reactCount, styles.headerTabCount]}>{calculateTotalCount(emojiItem.senders)}</Text>
				</Pressable>
			);
		});
	};

	const selectEmoji = (emojiId: string) => {
		setSelectedTabId(emojiId);
		setShowConfirmDeleteEmoji(false);
	};

	const currentEmojiSelected = useMemo(() => {
		if (selectedTabId) {
			return allReactionDataOnOneMessage.find((emoji) => emoji.id === selectedTabId);
		}
		return null;
	}, [selectedTabId, allReactionDataOnOneMessage]);

	const onSelectUserId = (userId: string) => {
		onClose();
		setSelectedUserId(userId);
	};

	const checkToFocusOtherEmoji = useCallback(() => {
		const areStillEmoji = currentEmojiSelected.senders.filter((sender) => sender.sender_id !== userId).some((sender) => sender.count !== 0);
		if (areStillEmoji) return;

		const emojiDeletedIndex = allReactionDataOnOneMessage.findIndex((emoji) => emoji.id === currentEmojiSelected.id);

		let nextFocusEmoji = allReactionDataOnOneMessage[emojiDeletedIndex + 1];
		if (!nextFocusEmoji) {
			nextFocusEmoji = allReactionDataOnOneMessage[emojiDeletedIndex - 1];
		}
		setSelectedTabId(nextFocusEmoji?.id || null);
	}, [allReactionDataOnOneMessage, currentEmojiSelected, userId]);

	const onRemoveEmoji = useCallback(async () => {
		await removeEmoji(currentEmojiSelected);
		checkToFocusOtherEmoji();
		setShowConfirmDeleteEmoji(false);
	}, [removeEmoji, checkToFocusOtherEmoji, currentEmojiSelected]);

	const emojiKeyList = useMemo(() => {
		return allReactionDataOnOneMessage?.map?.((emojiData) => emojiData.id);
	}, [allReactionDataOnOneMessage]);

	const isExistingMyEmoji = useMemo(() => {
		return currentEmojiSelected?.senders?.find((sender) => sender?.sender_id === userId)?.count > 0;
	}, [currentEmojiSelected, userId]);

	const getContent = () => {
		return (
			<View style={styles.contentWrapper}>
				<View style={styles.removeEmojiContainer}>
					<Text style={styles.emojiText}>{currentEmojiSelected?.emoji}</Text>
					{isExistingMyEmoji ? (
						<View>
							{showConfirmDeleteEmoji ? (
								<Pressable style={styles.confirmDeleteEmoji} onPress={() => onRemoveEmoji()}>
									<TrashIcon />
									<Text style={styles.confirmText}>{t('reactions.removeActions')}</Text>
								</Pressable>
							) : (
								<Pressable onPress={() => setShowConfirmDeleteEmoji(true)}>
									<TrashIcon />
								</Pressable>
							)}
						</View>
					) : null}
				</View>

				{allReactionDataOnOneMessage
					.filter((item) => item.id === selectedTabId)
					.map((data) => data.senders)
					.flat(1)
					.map((sender, index) => {
						if (sender.count === 0) {
							return null;
						}
						return (
							<View key={`${emojiKeyList[index]}`}>
								<MemberReact userId={sender.sender_id} onSelectUserId={onSelectUserId} />
							</View>
						);
					})}
			</View>
		);
	};

	useEffect(() => {
		if (ref) {
			if (emojiSelectedId !== null) {
				ref.current?.open();
				setSelectedTabId(emojiSelectedId);
			} else {
				ref.current?.close();
				setSelectedTabId(null);
			}
		}
	}, [emojiSelectedId]);

	return (
		<View>
			<BottomSheet
				ref={ref}
				height={500}
				onClose={() => onClose()}
				draggable
				customStyles={{
					container: {
						backgroundColor: 'transparent',
					},
				}}
			>
				<View style={styles.bottomSheetWrapper}>
					{allReactionDataOnOneMessage?.length ? (
						<View>
							<View style={styles.contentHeader}>
								<ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabHeaderWrapper}>
									{getTabHeader()}
								</ScrollView>
							</View>
							<View>{getContent()}</View>
						</View>
					) : (
						<View style={styles.noActionsWrapper}>
							<Text style={styles.noActionTitle}>{t('reactions.noActionTitle')}</Text>
							<Text style={styles.noActionContent}>{t('reactions.noActionDescription')}</Text>
						</View>
					)}
				</View>
			</BottomSheet>
			<UserInformationBottomSheet userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
		</View>
	);
});

const MemberReact = React.memo((props: { userId: string; onSelectUserId: (userId: string) => void }) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const { userId, onSelectUserId } = props;
	const user = useSelector(selectMemberByUserId(userId || ''));
	const showUserInformation = () => {
		onSelectUserId(user.user?.id);
	};

	return (
		<Pressable style={styles.memberWrapper} onPress={() => showUserInformation()}>
			<View style={styles.imageWrapper}>
				{user?.user?.avatar_url ? (
					<View>
						<Image source={{ uri: user?.user?.avatar_url }} resizeMode="cover" style={styles.image} />
					</View>
				) : (
					<View style={styles.avatarBoxDefault}>
						<Text style={styles.textAvatarBoxDefault}>{user?.user?.username?.charAt(0)?.toUpperCase()}</Text>
					</View>
				)}
			</View>
			<Text style={styles.memberName}>{user.user.display_name}</Text>
			<Text style={styles.mentionText}>@{user.user.username}</Text>
		</Pressable>
	);
});
