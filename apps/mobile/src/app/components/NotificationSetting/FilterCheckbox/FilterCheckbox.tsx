import { Block, size, useTheme } from '@mezon/mobile-ui';
import React from 'react';
import { Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { MezonRadioButton } from '../../../temp-ui';
import { ENotificationType } from '../../NotificationSetting';
import { style } from '../NotificationSetting.styles';

interface FilterCheckboxProps {
	id: number | string;
	isChecked: boolean;
	label: string;
	defaultNotifyName?: string;
	onCheckboxPress: (checked: boolean, id: number | string) => void;
	customStyles?: ViewStyle;
	leftIcon?: JSX.Element;
}

const FilterCheckbox: React.FC<FilterCheckboxProps> = React.memo(
	({ id, isChecked, label, defaultNotifyName, onCheckboxPress, customStyles = {}, leftIcon }) => {
		const { themeValue } = useTheme();
		const styles = style(themeValue);
		const handleCheckboxPress = () => {
			onCheckboxPress(!isChecked, id);
		};
		return (
			<TouchableOpacity activeOpacity={0.6} onPress={handleCheckboxPress} style={[styles.option, customStyles]}>
				<View >
					<Block style={[leftIcon ? styles.leftIcon : {}]}>
						{leftIcon && <Block width={20} height={20} marginRight={size.s_10} flexDirection='row' alignItems='center'>{leftIcon}</Block>}
						<Text style={styles.labelOption}>{label}</Text>
					</Block>
					{[ENotificationType.CATEGORY_DEFAULT].includes(label as ENotificationType) && (
						<Text style={styles.defaultNotifyName}>
							{defaultNotifyName?.charAt(0)?.toUpperCase() + defaultNotifyName?.slice(1)?.toLowerCase()}
						</Text>
					)}
				</View>

				<MezonRadioButton checked={isChecked} />
			</TouchableOpacity>
		);
	},
);

export default FilterCheckbox;
