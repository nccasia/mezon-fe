import { useMemo } from "react";
import { IMezonMenuSectionProps, MezonMenu, MezonRadioButton } from "../../temp-ui";
import { View } from "react-native";
import { useState } from "react";

interface IMezonOptionProps {
    title: string;
    onChange?: (value: number) => void;
    data: {
        description?: string;
        title: string;
        value: number;
    }[]
}

export default function MezonOption({ data, title, onChange }: IMezonOptionProps) {
    const [currentValue, setCurrentValue] = useState<number>(data?.[0].value || 0);

    function handleChange(value: number) {
        setCurrentValue(value);
        onChange && onChange(value);
    }

    const menu = useMemo(() => ([
        {
            title: title,
            items: data.map((item) => ({
                ...item,
                component: (
                    <MezonRadioButton
                        checked={item.value === currentValue}
                        onChange={() => handleChange(item.value)}
                        noSwitchFalse
                    />
                ),
                onPress: () => handleChange(item.value)
            }))
        }
    ]) satisfies IMezonMenuSectionProps[], [data, currentValue]);

    return (
        <View>
            <MezonMenu menu={menu} />
        </View>
    )
}