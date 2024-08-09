import { baseColor, useTheme } from '@mezon/mobile-ui';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import Toast from 'react-native-toast-message';
import OptionProfile from '../OptionProfile';
import { style } from './ListOptionProfile.styles';

type Option = {
	title: string;
	color: string;
	isShown: boolean;
	action: () => void;
};

interface ListOptionProps {
	isMe: boolean;
	onClose: () => void;
	onFriendAction: () => void;
	onCancelAction: () => void;
	onCopyAction: () => void;
	pending: boolean;
}

const ListOptionProfile: React.FC<ListOptionProps> = memo(({ isMe, onClose, onFriendAction, onCancelAction, onCopyAction, pending }) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const { t } = useTranslation(['userProfile']);

	const profileOptions: Option[] = useMemo(() => {
		return [
			{
				title: t('pendingContent.block'),
				color: baseColor.red,
				isShown: true,
				action: () => {
					Toast.show({ type: 'info', text1: 'Updating...' });
					onClose();
				},
			},
			{
				title: t('pendingContent.reportUserProfile'),
				color: baseColor.red,
				isShown: true,
				action: () => {
					Toast.show({ type: 'info', text1: 'Updating...' });
				},
			},
			{
				title: t('pendingContent.cancelFriendRequest'),
				color: themeValue.channelNormal,
				isShown: pending,
				action: () => {
					onCancelAction();
					onClose();
				},
			},
			{
				title: t('userAction.addFriend'),
				color: themeValue.channelNormal,
				isShown: !pending,
				action: () => {
					onFriendAction();
					onClose();
				},
			},
			{
				title: t('pendingContent.copyUsername'),
				color: themeValue.channelNormal,
				isShown: true,
				action: () => {
					onCopyAction();
					onClose();
				},
			},
		];
	}, [onCancelAction, onClose, onCopyAction, onFriendAction, pending, t, themeValue.channelNormal]);

	return (
		<View style={styles.optionContainer}>
			{!isMe ? (
				profileOptions.map(
					(option, index) =>
						option.isShown && (
							<Pressable key={`${option.title}_${index}`} onPress={option.action}>
								<OptionProfile option={option}></OptionProfile>
								{index < profileOptions.length - 1 && <View style={styles.separatedItem} />}
							</Pressable>
						),
				)
			) : (
				<OptionProfile option={profileOptions[3]}></OptionProfile>
			)}
		</View>
	);
});

export default ListOptionProfile;
