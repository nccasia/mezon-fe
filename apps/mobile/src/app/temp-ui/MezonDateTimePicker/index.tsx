import { Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import MezonBottomSheet from "../MezonBottomSheet";
import { useRef } from "react";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import styles from "./styles";
import DatePicker from 'react-native-date-picker'
import { useState } from "react";
import { CloseIcon, getNearTime } from "@mezon/mobile-components";
import MezonFakeInputBox from "../MezonFakeBox";
import { useEffect } from "react";
import { memo } from "react";
import { useCallback } from "react";

interface IMezonDateTimePicker {
    mode?: "datetime" | "date" | "time",
    title?: string;
    onChange?: (time: Date) => void;
    value?: Date,
    keepTime?: boolean
}

export default memo(function MezonDateTimePicker({ mode = "date", title, onChange, value, keepTime }: IMezonDateTimePicker) {
    const bottomSheetRef = useRef<BottomSheetModalMethods>();
    const [date, setDate] = useState(value || getNearTime(120))
    const [currentDate, setCurrentDate] = useState(value || getNearTime(120));

    useEffect(() => {
        setDate(value || getNearTime(120));
        setCurrentDate(value || getNearTime(120));
    }, [value])

    const handleChange = useCallback(() => {
        if (keepTime && mode !== "time" && value) {
            const new_date = new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
                value.getHours(),
                value.getMinutes(),
                value.getSeconds()
            );

            setCurrentDate(new_date);
            onChange && onChange(new_date);
        } else {
            setCurrentDate(date);
            onChange && onChange(date);
        }
        bottomSheetRef?.current?.dismiss();
    }, [keepTime, mode, value, date]);

    function handleClose() {
        bottomSheetRef?.current?.dismiss();
    }

    function handlePress() {
        bottomSheetRef?.current?.present();
    }

    return (
        <View>
            <MezonFakeInputBox
                title={title}
                value={mode === "time"
                    ? currentDate.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                    })
                    : currentDate.toLocaleDateString([], {
                        year: 'numeric',
                        month: "short",
                        day: 'numeric'
                    })}
                onPress={handlePress}
            />

            <MezonBottomSheet
                ref={bottomSheetRef}
                heightFitContent
                title={title}
                headerLeft={
                    <TouchableOpacity onPress={handleClose}>
                        <CloseIcon height={16} width={16} />
                    </TouchableOpacity>
                }
                headerRight={
                    <TouchableOpacity onPress={handleChange}>
                        <Text style={styles.textApply}>Apply</Text>
                    </TouchableOpacity>
                }
            >
                <View style={styles.bsContainer}>
                    <DatePicker date={date} onDateChange={setDate} mode={mode} />
                </View>
            </MezonBottomSheet>
        </View>
    )
});