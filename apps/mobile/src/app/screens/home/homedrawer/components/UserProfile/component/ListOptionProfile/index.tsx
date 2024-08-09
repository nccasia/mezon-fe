import { useTheme } from '@mezon/mobile-ui';
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
	isCurrentUser: boolean;
	onClose: () => void;
	onFriendAction: () => void;
	onCancelAction: () => void;
	onCopyAction: () => void;
	pending: boolean;
}

const ListOptionProfile: React.FC<ListOptionProps> = memo(({ isCurrentUser, onClose, onFriendAction, onCancelAction, onCopyAction, pending }) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const { t } = useTranslation(['userProfile']);

	const profileOptions: Option[] = useMemo(() => {
		return [
			{
				title: t('pendingContent.block'),
				color: 'red',
				isShown: true,
				action: () => {
					Toast.show({ type: 'info', text1: 'Updating...' });
				},
			},
			{
				title: t('pendingContent.reportUserProfile'),
				color: 'red',
				isShown: true,
				action: () => {
					Toast.show({ type: 'info', text1: 'Updating...' });
				},
			},
			{ title: t('pendingContent.cancelFriendRequest'), color: '', isShown: pending, action: onCancelAction },
			{ title: t('userAction.addFriend'), color: '', isShown: !pending, action: onFriendAction },
			{ title: t('pendingContent.copyUsername'), color: '', isShown: true, action: onCopyAction },
		];
	}, [onCancelAction, onCopyAction, onFriendAction, pending, t]);

	const handleItemAction = (option: Option) => {
		option.action();
		onClose();
	};

	return (
		<View style={styles.optionContainer}>
			{!isCurrentUser ? (
				profileOptions.map(
					(option, index) =>
						option.isShown && (
							<Pressable key={`${option.title}_${index}`} onPress={() => handleItemAction(option)}>
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
