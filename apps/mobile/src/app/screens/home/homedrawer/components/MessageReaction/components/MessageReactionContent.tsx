import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { TrashIcon } from '@mezon/mobile-components';
import { Block, useTheme } from '@mezon/mobile-ui';
import { EmojiDataOptionals, calculateTotalCount, getSrcEmoji } from '@mezon/utils';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { style } from '../styles';
import { ReactionMember } from './ReactionMember';

interface IMessageReactionContentProps {
	allReactionDataOnOneMessage: EmojiDataOptionals[];
	emojiSelectedId: string | null;
	userId: string | null;
	removeEmoji?: (emoji: EmojiDataOptionals) => void;
	onShowUserInformation?: (userId: string) => void;
	channelId?: string;
}

export const MessageReactionContent = memo((props: IMessageReactionContentProps) => {
	const { allReactionDataOnOneMessage, emojiSelectedId, channelId, userId, onShowUserInformation, removeEmoji } = props;
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const { t } = useTranslation('message');

	const [selectedTabId, setSelectedTabId] = useState<string | null>(null);
	const [showConfirmDeleteEmoji, setShowConfirmDeleteEmoji] = useState<boolean>(false);

	const selectEmoji = (emojiId: string) => {
		setSelectedTabId(emojiId);
		setShowConfirmDeleteEmoji(false);
	};

	useEffect(() => {
		if (emojiSelectedId) {
			setSelectedTabId(emojiSelectedId);
		}
	}, [emojiSelectedId]);

	const emojiKeyList = useMemo(() => {
		return allReactionDataOnOneMessage?.map?.((emojiData) => emojiData.id);
	}, [allReactionDataOnOneMessage]);

	const currentEmojiSelected = useMemo(() => {
		if (selectedTabId) {
			return allReactionDataOnOneMessage.find((emoji) => emoji.id === selectedTabId);
		}
		return null;
	}, [selectedTabId, allReactionDataOnOneMessage]);

	const isExistingMyEmoji = useMemo(() => {
		return currentEmojiSelected?.senders?.find((sender) => sender?.sender_id === userId)?.count > 0;
	}, [currentEmojiSelected, userId]);

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

	const getTabHeader = () => {
		return (
			<BottomSheetScrollView horizontal showsHorizontalScrollIndicator={false}>
				{allReactionDataOnOneMessage.map((emojiItem) => {
					return (
						<Pressable
							key={emojiItem.id}
							onPress={() => selectEmoji(emojiItem.id)}
							style={[styles.tabHeaderItem, selectedTabId === emojiItem.id && styles.activeTab]}
						>
							<FastImage
								source={{
									uri: getSrcEmoji(emojiItem.emojiId)
								}}
								resizeMode={'contain'}
								style={styles.iconEmojiReactionDetail}
							/>
							<Text style={[styles.reactCount, styles.headerTabCount]}>{calculateTotalCount(emojiItem.senders)}</Text>
						</Pressable>
					);
				})}
			</BottomSheetScrollView>
		);
	};

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
								<ReactionMember userId={sender.sender_id} channelId={channelId} onSelectUserId={onShowUserInformation} />
							</View>
						);
					})}
			</View>
		);
	};
	return (
		<Block flex={1}>
			{allReactionDataOnOneMessage?.length ? (
				<View>
					<View style={styles.contentHeader}>{getTabHeader()}</View>
					<View>{getContent()}</View>
				</View>
			) : (
				<View style={styles.noActionsWrapper}>
					<Text style={styles.noActionTitle}>{t('reactions.noActionTitle')}</Text>
					<Text style={styles.noActionContent}>{t('reactions.noActionDescription')}</Text>
				</View>
			)}
		</Block>
	);
});
