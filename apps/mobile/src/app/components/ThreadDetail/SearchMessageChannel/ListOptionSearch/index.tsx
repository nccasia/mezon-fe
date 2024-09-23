import { IOption, searchOptions } from '@mezon/mobile-components';
import { useTheme } from '@mezon/mobile-ui';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import OptionSearch from '../OptionSearch';
import { style } from './ListOptionSearch.styles';

interface IListOptionSearchProps {
	onPressOption: (option: IOption) => void;
}
const ListOptionSearch = ({ onPressOption }: IListOptionSearchProps) => {
	const { t } = useTranslation(['searchMessageChannel']);
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const handleSelectOption = (option) => {
		onPressOption(option);
	};

	return (
		<View style={styles.optionSearchContainer}>
			<Text style={styles.headerTitle}>{t('filterResults')}</Text>
			{searchOptions.map((option, index) => (
				<OptionSearch onSelect={handleSelectOption} option={option} key={`${option.value}_${index}`}></OptionSearch>
			))}
		</View>
	);
};

export default ListOptionSearch;
