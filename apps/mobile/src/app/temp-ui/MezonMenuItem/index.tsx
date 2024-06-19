import { StyleProp, Text, TextStyle, TouchableOpacity, View } from "react-native";
import styles from "./styles";
import { ReactNode } from "react";
import { AngleRightIcon } from "@mezon/mobile-components";

export interface IMezonMenuItemProps {
    title: string,
    icon?: any,
    onPress?: () => void,
    expandable?: boolean,
    isLast?: boolean,
    component?: ReactNode,
    textStyle?: StyleProp<TextStyle>,
    disabled?: boolean,
    description?: string,
}
export default function MezonMenuItem({ isLast, title, expandable, icon, onPress, component, textStyle, disabled, description }: IMezonMenuItemProps) {
    return (
        <TouchableOpacity
            disabled={disabled}
            onPress={() => { onPress && onPress() }}
            style={styles.btn}>
            {icon}
            <View style={[styles.btnTitleWrapper, disabled && styles.disable, !isLast && styles.borderBottom]}>
                <View style={styles.btnTextWrapper}>
                    <Text style={[styles.btnTitle, textStyle]}>{title}</Text>
                    {description && <Text style={[styles.btnDescription]}>{description}</Text>}
                </View>
                {component}
                {expandable && <AngleRightIcon height={24} width={24} />}
            </View>
        </TouchableOpacity>
    )
}