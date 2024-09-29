import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useMemberStatus } from '@mezon/core';
import { Icons, OverflowMenuHorizontalIcon } from '@mezon/mobile-components';
import { baseColor, useTheme } from '@mezon/mobile-ui';
import { selectDmGroupCurrent } from '@mezon/store-mobile';
import { ChannelStatusEnum } from '@mezon/utils';
import { useNavigation } from '@react-navigation/native';
import { ChannelType } from 'mezon-js';
import { memo, useContext, useMemo, useRef } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import useTabletLandscape from '../../../hooks/useTabletLandscape';
import { APP_SCREEN } from '../../../navigation/ScreenTypes';
import { MezonAvatar, MezonBottomSheet } from '../../../temp-ui';
import MenuCustomDm from '../../MenuCustomDm';
import { threadDetailContext } from '../MenuThreadDetail';
import { style } from './styles';

export const ThreadHeader = memo(() => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const currentChannel = useContext(threadDetailContext);
	const currentDmGroup = useSelector(selectDmGroupCurrent(currentChannel?.id ?? ''));
	const bottomSheetMenuCustom = useRef<BottomSheetModal>(null);
	const isTabletLandscape = useTabletLandscape();

	const snapPointsMenuCustom = useMemo(() => {
		return [ChannelType.CHANNEL_TYPE_GROUP].includes(currentChannel?.type) ? ['30%'] : ['15%'];
	}, [currentChannel?.type]);
	const isDMThread = useMemo(() => {
		return [ChannelType.CHANNEL_TYPE_DM, ChannelType.CHANNEL_TYPE_GROUP].includes(currentChannel?.type);
	}, [currentChannel]);
	const userStatus = useMemberStatus(currentChannel?.user_id?.length === 1 ? currentChannel?.user_id[0] : '');
	const navigation = useNavigation<any>();
	const openMenu = () => {
		bottomSheetMenuCustom.current?.present();
	};
	const channelLabel = useMemo(() => {
		return currentDmGroup?.channel_label || currentChannel?.channel_label || currentChannel?.usernames;
	}, [currentDmGroup?.channel_label, currentChannel?.channel_label, currentChannel?.usernames]);

	const isChannel = useMemo(() => {
		return !!currentChannel?.channel_label && !Number(currentChannel?.parrent_id);
	}, [currentChannel?.channel_label, currentChannel?.parrent_id]);

	const handlebackMessageDetail = () => {
		if (isDMThread && !isTabletLandscape) {
			navigation.navigate(APP_SCREEN.MESSAGES.STACK, {
				screen: APP_SCREEN.MESSAGES.MESSAGE_DETAIL,
				params: { directMessageId: currentChannel?.id }
			});
		} else {
			navigation.goBack();
		}
	};

	return (
		<View style={styles.channelLabelWrapper}>
			<TouchableOpacity style={styles.iconBackHeader} onPress={handlebackMessageDetail}>
				<Icons.ArrowLargeLeftIcon color={themeValue.text} height={20} width={20} />
			</TouchableOpacity>

			{isDMThread ? (
				<View style={styles.avatarWrapper}>
					<View>
						{currentChannel?.type === ChannelType.CHANNEL_TYPE_GROUP ? (
							<View style={[styles.groupAvatar, styles.avatarSize]}>
								<Icons.GroupIcon color={baseColor.white} />
							</View>
						) : (
							<MezonAvatar
								avatarUrl={currentChannel?.channel_avatar?.[0]}
								username={currentChannel?.channel_label || currentChannel?.usernames}
								userStatus={userStatus}
							/>
						)}
					</View>
					<Text numberOfLines={5} style={styles.dmLabel}>
						{channelLabel}
					</Text>
				</View>
			) : (
				<View style={styles.channelText}>
					{currentChannel?.channel_private === ChannelStatusEnum.isPrivate && currentChannel?.type === ChannelType.CHANNEL_TYPE_TEXT ? (
						isChannel ? (
							<Icons.TextLockIcon width={20} height={20} color={themeValue.text} />
						) : (
							<Icons.ThreadLockIcon width={20} height={20} color={themeValue.text} />
						)
					) : isChannel ? (
						<Icons.TextIcon width={20} height={20} color={themeValue.text} />
					) : (
						<Icons.ThreadIcon width={20} height={20} color={themeValue.text} />
					)}
					<Text numberOfLines={1} style={styles.channelLabel}>
						{currentChannel?.channel_label || currentChannel?.usernames}
					</Text>
				</View>
			)}
			{isDMThread && (
				<TouchableOpacity onPress={openMenu} style={styles.iconMenuHeader}>
					<OverflowMenuHorizontalIcon color={themeValue.white} />
				</TouchableOpacity>
			)}
			<MezonBottomSheet snapPoints={snapPointsMenuCustom} ref={bottomSheetMenuCustom}>
				<MenuCustomDm currentChannel={currentChannel} channelLabel={channelLabel}></MenuCustomDm>
			</MezonBottomSheet>
		</View>
	);
});
