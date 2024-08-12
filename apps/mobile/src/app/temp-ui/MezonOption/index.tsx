import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { IMezonMenuItemProps, IMezonMenuSectionProps, MezonMenu, MezonRadioButton } from '../../temp-ui';
import { useEffect } from 'react';

export type IMezonOptionData = (Omit<IMezonMenuItemProps, 'onPress'> & {
	value: number | string;
})[];

interface IMezonOptionProps extends Omit<IMezonMenuSectionProps, 'items'> {
	onChange?: (value: number | string) => void;
	data: IMezonOptionData;
	value?: number | string;
}

export default function MezonOption({ data, onChange, value, ...menuProps }: IMezonOptionProps) {
	const [currentValue, setCurrentValue] = useState<number | string>(value || 0);
  useEffect(()=>{
    setCurrentValue(value)
  },[value])


	function handleChange(value: number | string) {
		setCurrentValue(value);
		onChange && onChange(value);
	}
	const menu = useMemo(
		() =>
			[
				{
					items: data.map(({ value, disabled, ...props }) => ({
						...props,
						component: <MezonRadioButton checked={value === currentValue} onChange={() => handleChange(value)} noSwitchFalse disabled={disabled} />,
						onPress: () => !disabled && handleChange(value),
					})),
					...menuProps,
				},
			] satisfies IMezonMenuSectionProps[],
		[data, currentValue],
	);

	return (
		<View>
			<MezonMenu menu={menu} />
		</View>
	);
}
