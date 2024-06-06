import { Text, View } from "react-native";
import { MezonButton } from "../../../../temp-ui";
import styles from "./styles";

interface SettingBtnProps {
    title: string,
    icon?: any,
    onPress?: () => void,
    expandable?: boolean,
    isLast?: boolean
}

export default function SettingBtn({ isLast: lastItem, title, expandable, icon, onPress }: SettingBtnProps) {
    return (
        <MezonButton
            onPress={() => onPress()}
            viewContainerStyle={styles.btn}>
            {icon}
            <View style={[styles.btnTitleWrapper, !lastItem && styles.borderBottom]}>
                <Text style={styles.btnTitle}>{title}</Text>
            </View>
        </MezonButton>
    )
}