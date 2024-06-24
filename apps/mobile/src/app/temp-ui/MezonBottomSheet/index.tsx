import { BottomSheetScrollView, BottomSheetModal as OriginalBottomSheet } from "@gorhom/bottom-sheet";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { Ref } from "react";
import { forwardRef } from "react";
import styles from "./styles";
import { ReactNode } from "react";
import Backdrop from "./backdrop";
import { Text, View } from "react-native";

export interface IMezonBottomSheetProps {
    children: ReactNode,
    title?: string,
    headerLeft?: ReactNode,
    headerRight?: ReactNode,
    heightFitContent?: boolean
}

export default forwardRef(function MezonBottomSheet(
    { children, title, headerLeft, headerRight, heightFitContent }: IMezonBottomSheetProps,
    ref: Ref<BottomSheetModalMethods>) {

    return (
        <OriginalBottomSheet
            ref={ref}
            snapPoints={['90%']}
            index={0}
            animateOnMount
            backgroundStyle={styles.backgroundStyle}
            backdropComponent={Backdrop}
            enableDynamicSizing={heightFitContent}
        >
            <BottomSheetScrollView >
                {(title || headerLeft || headerRight) &&
                    <View style={styles.header}>
                        <View style={[styles.section, styles.sectionLeft]}>{headerLeft}</View>
                        <Text style={[styles.section, styles.sectionTitle]}>{title}</Text>
                        <View style={[styles.section, styles.sectionRight]}>{headerRight}</View>
                    </View>
                }

                {children}
            </BottomSheetScrollView>
        </OriginalBottomSheet >
    )
})

