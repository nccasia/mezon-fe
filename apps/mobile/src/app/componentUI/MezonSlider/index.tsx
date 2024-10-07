import { useTheme } from '@mezon/mobile-ui';
import { Slider } from '@miblanchard/react-native-slider';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { style } from './styles';

export type IMezonSliderData = {
	value: number;
	name: string;
}[];

interface IMezonSliderProps {
	title: string;
	minimumValue?: number;
	maximumValue?: number;
	data?: IMezonSliderData;
}

export default function MezonSlider({ title, maximumValue, minimumValue, data }: IMezonSliderProps) {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const [value, setValue] = useState<number>(minimumValue || 0);

	function handleValueChange(arr: Array<number>, index: number) {
		setValue(arr[index]);
	}

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>{title}</Text>
				<Text style={styles.value}>{data ? data?.[value]?.name : value}</Text>
			</View>
			<Slider
				animateTransitions={true}
				minimumValue={data ? 0 : maximumValue || 0}
				maximumValue={data ? data.length - 1 : minimumValue || 10}
				value={value}
				step={1}
				onValueChange={handleValueChange}
				thumbStyle={styles.thumb}
				trackStyle={styles.track}
				minimumTrackStyle={styles.miniTrack}
			/>
		</View>
	);
}
