import { VerifyIcon } from "@mezon/mobile-components";
import { Text, View } from "react-native";
import styles from "./styles";

interface MezonBadgeProps {
    title: string,
    type: "success" | "warning" | "danger",
}

export default function MezonBadge({ title, type }: MezonBadgeProps) {
    function renderContainerStyle() {
        if (type === "success") return styles.containerSuccess;
        else if (type === "warning") return styles.containerWarning;
        else if (type === "danger") return styles.containerDanger;
        else { }
    }

    return (
        <View style={[styles.container, renderContainerStyle()]}>
            <VerifyIcon height={16} width={16} />
            <Text style={styles.title}>{title}</Text>
        </View>
    )
}