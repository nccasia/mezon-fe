import { useReference, useThreads, useUserPermission } from '@mezon/core';
import { Icons } from '@mezon/mobile-components';
import { useTheme } from '@mezon/mobile-ui';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';
import { APP_SCREEN } from '../../../navigation/ScreenTypes';
import { style } from './EmptyThread.style';

const EmptyThread = () => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const { setValueThread } = useThreads();
	const { setOpenThreadMessageState } = useReference();
	const navigation = useNavigation<any>();
	const { t } = useTranslation(['createThread']);
	const { isCanManageThread } = useUserPermission();

	const handleNavigateCreateForm = () => {
		setOpenThreadMessageState(false);
		setValueThread(null);
		navigation.navigate(APP_SCREEN.MENU_THREAD.STACK, { screen: APP_SCREEN.MENU_THREAD.CREATE_THREAD_FORM_MODAL });
	};
	return (
		<View style={styles.emptyThreadContainer}>
			<View style={styles.emptyThreadContent}>
				<View style={styles.iconContainer}>
					<Icons.ThreadPlusIcon width={22} height={22} color={themeValue.textStrong} />
				</View>
				<Text style={styles.textNoThread}>{t('emptyThread.textNoThread')}</Text>
				<Text style={styles.textNotify}>{t('emptyThread.textNotify')}</Text>
				{isCanManageThread ? (
					<TouchableOpacity onPress={handleNavigateCreateForm} style={[styles.button]}>
						<Text style={[styles.buttonText]}>{t('emptyThread.createThreads')}</Text>
					</TouchableOpacity>
				) : (
					<View />
				)}
			</View>
		</View>
	);
};

export default EmptyThread;
