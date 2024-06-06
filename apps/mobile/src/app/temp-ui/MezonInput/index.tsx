import { Text, TextInput, View } from "react-native";
import styles from "./styles";
import { TouchableOpacity } from "react-native-gesture-handler";
import { CloseIcon } from "@mezon/mobile-components";
import { useRef } from "react";
import { useState } from "react";
import { size } from "@mezon/mobile-ui";

interface IMezonInputProps {
    placeHolder?: string;
    label?: string;
    textarea?: boolean;
    value: string;
    onTextChange?: (value: string) => void;
    maxCharacter?: number
}

export default function MezonInput({ placeHolder, label, textarea, value, onTextChange, maxCharacter = 60 }: IMezonInputProps) {
    const ref = useRef<TextInput>(null)
    const [showCount, setShowCount] = useState<boolean>(false);

    function handleClearBtn() {
        ref && ref.current && ref.current.clear();
        onTextChange && onTextChange("");
    }

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.fakeInput}>
                <View style={styles.inputBox}>
                    <TextInput
                        ref={ref}
                        value={value}
                        onChangeText={onTextChange}
                        multiline={textarea}
                        numberOfLines={textarea ? 4 : 1}
                        textAlignVertical={textarea ? 'top' : 'center'}
                        maxLength={maxCharacter}
                        style={[styles.input, textarea && {height: size.s_100}]}
                        placeholder={placeHolder}
                        placeholderTextColor="gray"
                        onFocus={() => setShowCount(true)}
                        onBlur={() => setShowCount(false)}
                    />

                    {!textarea &&
                        <TouchableOpacity
                            onPress={handleClearBtn}
                            style={styles.clearBtn}>
                            <CloseIcon height={10} width={10} color="black" />
                        </TouchableOpacity>
                    }
                </View>
                {showCount && textarea &&
                    <View style={styles.lineCountWrapper}>
                        <Text style={styles.count}>{`${value?.length || 1}/${maxCharacter}`}</Text>
                    </View>
                }
            </View>
        </View>

    )
}
