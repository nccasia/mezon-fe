import { Block, Text, useTheme } from '@mezon/mobile-ui';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { APP_SCREEN, MenuChannelScreenProps } from '../../../navigation/ScreenTypes';
import PinMessage from '../../PinMessage';
import { style } from './styles';

type ScreenChannelPinMessageSetting = typeof APP_SCREEN.MENU_CHANNEL.CHANNEL_PINNED_MESSAGE;
export default function ChannelPinnedMessageSetting({ navigation, route }: MenuChannelScreenProps<ScreenChannelPinMessageSetting>) {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const { t } = useTranslation(['channelSetting']);
	const { channelId } = route.params;

	navigation.setOptions({
		headerTitle: () => (
			<Block>
				<Text bold h3 color={themeValue?.white}>
					{t('fields.channelNotifications.pinned')}
				</Text>
			</Block>
		)
	});

	return (
		<SafeAreaView style={styles.container}>
			<PinMessage currentChannelId={channelId} />
		</SafeAreaView>
	);
}
