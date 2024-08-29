import { useAuth } from '@mezon/core';
import { Icons } from '@mezon/mobile-components';
import { baseColor, Block, size, useTheme } from '@mezon/mobile-ui';
import { emojiSuggestionActions, selectCurrentClanId, selectMemberClanByUserId, useAppDispatch } from '@mezon/store-mobile';
import { getSrcEmoji } from '@mezon/utils';
import { ClanEmoji } from 'mezon-js';
import { MezonUpdateClanEmojiByIdBody } from 'mezon-js/api.gen';
import { forwardRef, Ref, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { Pressable } from 'react-native-gesture-handler';
import Swipeable, { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';
import { style } from './styles';

type ServerDetailProps = {
	item: ClanEmoji;
	onSwipeOpen?: () => void;
};

const EmojiDetail = forwardRef(({ item, onSwipeOpen }: ServerDetailProps, ref: Ref<SwipeableMethods>) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const { t } = useTranslation(['clanEmojiSetting']);
	const dispatch = useAppDispatch();
	const myUser = useAuth();
	const clanId = useSelector(selectCurrentClanId);
	const emojiSrc = item.id ? getSrcEmoji(item.id) : '';
	const dataAuthor = useSelector(selectMemberClanByUserId(item.creator_id ?? ''));
	const [emojiName, setEmojiName] = useState(item.shortname?.split(':')?.join(''));
	const [isFocused, setIsFocused] = useState(false);
	const textInputRef = useRef<TextInput>(null);

	const handleUpdateEmoji = async () => {
		const request: MezonUpdateClanEmojiByIdBody = {
			source: getSrcEmoji(item.id as string),
			shortname: emojiName,
			category: item.category,
			clan_id: clanId
		};
		await dispatch(emojiSuggestionActions.updateEmojiSetting({ request: request, emojiId: item.id || '' }));
	};

	const handleDeleteEmoji = async () => {
		dispatch(emojiSuggestionActions.deleteEmojiSetting({ emoji: item, clan_id: clanId as string }));
	};

	const focusTextInput = () => {
		if (myUser.userId !== item.creator_id) {
			return;
		}
		setIsFocused(true);
		if (textInputRef) {
			textInputRef.current.focus();
		}
	};

	const handleBlur = () => {
		setIsFocused(false);
		if (!emojiName) {
			setEmojiName(item.shortname?.split(':')?.join(''));
		} else if (myUser.userId !== item.creator_id && emojiName !== item.shortname?.split(':')?.join('')) {
			setEmojiName(item.shortname?.split(':')?.join(''));
			Toast.show({
				type: 'info',
				text1: t('toast.reject')
			});
		} else if (emojiName !== item.shortname?.split(':')?.join('')) {
			handleUpdateEmoji();
		}
	};

	const handleFocus = () => {
		setIsFocused(true);
	};

	const RightAction = () => {
		return (
			<View style={styles.rightItem}>
				<TouchableOpacity style={styles.deleteButton} onPress={handleDeleteEmoji}>
					<Icons.TrashIcon width={size.s_20} height={size.s_20} color={baseColor.white} />
					<Text style={styles.whiteText}>{t('emojiList.delete')}</Text>
				</TouchableOpacity>
			</View>
		);
	};

	return (
		<Swipeable ref={ref} onSwipeableWillOpen={onSwipeOpen} enabled={myUser.userId === item.creator_id} renderRightActions={RightAction}>
			<Pressable style={styles.container} onPress={focusTextInput}>
				<View style={styles.emojiItem}>
					<FastImage style={styles.emoji} resizeMode={'contain'} source={{ uri: emojiSrc }} />
					<View style={styles.emojiName}>
						{!isFocused && <Text style={styles.whiteText}>:</Text>}
						<TextInput
							editable={myUser.userId === item.creator_id}
							ref={textInputRef}
							onBlur={handleBlur}
							onFocus={handleFocus}
							numberOfLines={1}
							style={[styles.lightTitle]}
							value={emojiName}
							onChangeText={setEmojiName}
						/>
						{!isFocused && <Text style={styles.whiteText}>:</Text>}
					</View>
				</View>
				{dataAuthor?.user?.avatar_url && (
					<View style={styles.user}>
						<Text numberOfLines={1} style={styles.title}>
							{dataAuthor?.user?.username}
						</Text>
						{dataAuthor?.user?.avatar_url ? (
							<FastImage source={{ uri: dataAuthor?.user?.avatar_url }} style={styles.imgWrapper} />
						) : (
							<Block
								backgroundColor={themeValue.colorAvatarDefault}
								overflow={'hidden'}
								width={size.s_30}
								height={size.s_30}
								borderRadius={size.s_30}
								alignItems={'center'}
								justifyContent={'center'}
							>
								<Text style={styles.textAvatar}>{dataAuthor?.user?.username?.charAt?.(0)?.toUpperCase()}</Text>
							</Block>
						)}
					</View>
				)}
			</Pressable>
		</Swipeable>
	);
});

export default EmojiDetail;
