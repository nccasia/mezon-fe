import { TextInput, View } from "react-native";
import styles from "./styles";
import { SearchIcon } from "@mezon/mobile-components";

interface MezonInputProps {
    onChangeText?: (text: string) => void
}

export default function MezonSearch({ onChangeText }: MezonInputProps) {
    return (
        <View style={styles.inputWrapper}>
            <SearchIcon height={24} width={24}/>
            <TextInput
                style={styles.input}
                onChangeText={onChangeText}
                placeholderTextColor={"white"}
                placeholder="Search"
            />
        </View>
    )
}