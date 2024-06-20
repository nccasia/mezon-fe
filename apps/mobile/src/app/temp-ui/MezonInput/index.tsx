import { StyleProp, Text, TextInput, View, ViewStyle } from "react-native";
import styles from "./styles";
import { TouchableOpacity } from "react-native-gesture-handler";
import { CloseIcon } from "@mezon/mobile-components";
import { useRef } from "react";
import { useState } from "react";

interface IMezonInputProps {
    placeHolder?: string;
    label?: string;
    textarea?: boolean;
    value: string;
    onTextChange?: (value: string) => void;
    maxCharacter?: number,
    inputWrapperStyle?: StyleProp<ViewStyle>,
    showBorderOnFocus?: boolean
}

export default function MezonInput({ placeHolder, label, textarea, value, onTextChange, maxCharacter = 60, inputWrapperStyle, showBorderOnFocus }: IMezonInputProps) {
    const ref = useRef<TextInput>(null)
    const [showCount, setShowCount] = useState<boolean>(false);
    const [isFocus, setFocus] = useState<boolean>(false);

    function handleClearBtn() {
        ref && ref.current && ref.current.clear();
        onTextChange && onTextChange("");
    }

    function handleFocus() {
        setShowCount(true);
        setFocus(true);
    }

    function handleBlur() {
        setShowCount(false);
        setFocus(false);
    }

    const renderBorder = (): StyleProp<ViewStyle> => {
        if (showBorderOnFocus) {
            return isFocus ? styles.fakeInputFocus : styles.fakeInputBlur;
        } else {
            return {}
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <View style={[styles.fakeInput, textarea && {paddingTop: 10}, renderBorder(), inputWrapperStyle]}>
                <View style={styles.inputBox}>
                    <TextInput
                        ref={ref}
                        value={value}
                        onChangeText={onTextChange}
                        multiline={textarea}
                        numberOfLines={textarea ? 4 : 1}
                        textAlignVertical={textarea ? 'top' : 'center'}
                        maxLength={maxCharacter}
                        style={[styles.input]}
                        placeholder={placeHolder}
                        placeholderTextColor="gray"
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                    />

                    {!textarea && value.length > 0 &&
                        <TouchableOpacity
                            onPress={handleClearBtn}
                            style={styles.clearBtn}>
                            <CloseIcon height={10} width={10} color="black" />
                        </TouchableOpacity>
                    }
                </View>
                
                {showCount && textarea &&
                    <View style={styles.lineCountWrapper}>
                        <Text style={styles.count}>{`${value?.length || '0'}/${maxCharacter}`}</Text>
                    </View>
                }
            </View>
        </View>

    )
}
