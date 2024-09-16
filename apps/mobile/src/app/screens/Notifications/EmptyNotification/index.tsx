import { BellIcon } from '@mezon/mobile-components';
import { Block, size, useTheme } from '@mezon/mobile-ui';
import { useTranslation } from 'react-i18next';
import { Text } from 'react-native';
import { style } from './EmptyNotification.styles';

const EmptyNotification = () => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const { t } = useTranslation(['notification']);

	return (
		<Block position="relative" width={'100%'} height={'100%'}>
			<Block position="absolute" left={size.s_10} right={size.s_10} top={'30%'} flexDirection="column" alignItems="center" gap={size.s_10}>
				<BellIcon width={size.s_100} height={size.s_100} color={themeValue.text} />
				<Text style={styles.title}>{t('nothingHere')}</Text>
				<Text style={styles.description}>{t('comeBackNotify')}</Text>
			</Block>
		</Block>
	);
};

export default EmptyNotification;
