import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { Icons, getNearTime } from '@mezon/mobile-components';
import { ThemeModeBase, useTheme } from '@mezon/mobile-ui';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import DatePicker from 'react-native-date-picker';
import { TouchableOpacity } from 'react-native-gesture-handler';
import MezonBottomSheet from '../MezonBottomSheet';
import MezonFakeInputBox, { IMezonFakeBoxProps } from '../MezonFakeBox';
import { style } from './styles';

type IMezonDateTimePicker = Omit<IMezonFakeBoxProps, 'onPress' | 'postfixIcon' | 'value'> & {
	mode?: 'datetime' | 'date' | 'time';
	onChange?: (time: Date) => void;
	value?: Date;
	keepTime?: boolean;
	need24HourFormat?: { is24hourSource: 'locale' | 'device' };
	needLocale?: { locale: string };
};

export default memo(function MezonDateTimePicker({
	mode = 'date',
	onChange,
	value,
	keepTime,
	need24HourFormat,
	needLocale,
	...props
}: IMezonDateTimePicker) {
	const { themeValue, themeBasic } = useTheme();
	const styles = style(themeValue);
	const bottomSheetRef = useRef<BottomSheetModalMethods>();
	const [date, setDate] = useState(value || getNearTime(120));
	const isModeTime = useMemo(() => mode === 'time', [mode]);

	const [currentDate, setCurrentDate] = useState(value || getNearTime(120));

	useEffect(() => {
		setDate(value || getNearTime(120));
		setCurrentDate(value || getNearTime(120));
	}, [value]);
	const handleChange = useCallback(() => {
		if (keepTime && !isModeTime && value) {
			const new_date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), value.getHours(), value.getMinutes(), value.getSeconds());

			setCurrentDate(new_date);
			onChange && onChange(new_date);
		} else {
			setCurrentDate(date);
			onChange && onChange(date);
		}
		bottomSheetRef?.current?.dismiss();
	}, [keepTime, mode, value, date]);

	function handleClose() {
		bottomSheetRef?.current?.dismiss();
	}

	function handlePress() {
		bottomSheetRef?.current?.present();
	}

	return (
		<View>
			<MezonFakeInputBox
				{...props}
				value={
					isModeTime
						? currentDate.toLocaleTimeString([], {
								hour: '2-digit',
								minute: '2-digit',
								hour12: !need24HourFormat
							})
						: currentDate.toLocaleDateString([], {
								year: 'numeric',
								month: 'short',
								day: 'numeric'
							})
				}
				onPress={handlePress}
			/>

			<MezonBottomSheet
				ref={bottomSheetRef}
				index={0}
				snapPoints={['40%']}
				title={props.title}
				headerLeft={
					<TouchableOpacity style={styles.btnHeaderBS} onPress={handleClose}>
						<Icons.CloseIcon height={16} width={16} color={themeValue.text} />
					</TouchableOpacity>
				}
				headerRight={
					<TouchableOpacity style={styles.btnHeaderBS} onPress={handleChange}>
						<Text style={styles.textApply}>Apply</Text>
					</TouchableOpacity>
				}
			>
				<View style={styles.bsContainer}>
					<DatePicker
						{...(need24HourFormat && isModeTime ? need24HourFormat : {})}
						{...(needLocale && isModeTime ? needLocale : {})}
						date={date}
						onDateChange={setDate}
						mode={mode}
						theme={themeBasic === ThemeModeBase.DARK ? 'dark' : 'light'}
					/>
				</View>
			</MezonBottomSheet>
		</View>
	);
});
