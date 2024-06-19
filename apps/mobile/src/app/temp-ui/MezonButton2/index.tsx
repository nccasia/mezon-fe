import { Pressable, Text } from "react-native";
import styles from "./styles";

interface IMezonButton {
    icon?: any,
    title?: string,
    fluid?: boolean,
    border?: boolean,
    type?: "success" | "warning" | "danger";
    onPress?: () => void;
}

export default function MezonButton({ icon, title, fluid, border, type, onPress }: IMezonButton) {
    function renderContainerStyle() {
        if (type === "success") return styles.containerSuccess;
        if (type === "warning") return styles.containerWarning;
        if (type === "danger") return styles.containerDanger;
        return {};
    }

    return (
        <Pressable
            style={[styles.container, fluid && styles.fluid, border && styles.border, renderContainerStyle()]}
            onPress={onPress}
        >
            {icon}
            {title && <Text style={styles.title}>{title}</Text>}
        </Pressable>
    )
}