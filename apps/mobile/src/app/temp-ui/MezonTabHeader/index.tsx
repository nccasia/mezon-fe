import { Text, TouchableOpacity, View } from "react-native";
import styles from "./styles";
import { useState } from "react";
import { useEffect } from "react";

interface IMezonTabHeaderProps {
    tabIndex: number;
    tabs: string[];
    onChange?: (tabIndex: number) => void;
}

export default function MezonTabHeader({ tabIndex, tabs, onChange }: IMezonTabHeaderProps) {
    const [tab, setTab] = useState<number>(tabIndex);

    useEffect(() => {
        if (tab !== tabIndex) setTab(tabIndex);
    }, [tabIndex])

    function handleTabHeaderPress(index: number) {
        if (tab !== index) {
            onChange && onChange(index);
        }
    }

    return (
        <View style={styles.switchContainer}>
            {tabs.map((tabItem, index) => (
                <View
                    key={index.toString()}
                    style={styles.switchWrapper}>
                    <TouchableOpacity
                        style={[styles.switchButton, tab === index && styles.switchButtonActive]}
                        onPress={() => handleTabHeaderPress(index)}
                    >
                        <Text style={styles.switchText}>
                            {tabItem}
                        </Text>
                    </TouchableOpacity>
                </View>
            ))}
        </View>
    )
}