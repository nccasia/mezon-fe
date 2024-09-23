import { EmptySearchIcon } from '@mezon/mobile-components';
import { useTheme } from '@mezon/mobile-ui';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { style } from './EmptySearchPage.styles';

const EmptySearchPage = ({ emptyDescription }: { emptyDescription?: string }) => {
	const { t } = useTranslation('media');
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	return (
		<View style={styles.emptyBox}>
			<EmptySearchIcon width={100} height={100} />
			<Text style={styles.textEmpty}>{emptyDescription ? emptyDescription : t('emptyDescription')}</Text>
		</View>
	);
};

export default EmptySearchPage;
