import { Colors, size } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    reportMessageModalContainer: {
        gap: size.s_18,
        flex: 1,
        justifyContent: 'space-between',
    },
    cancelButtonWrapper: {
        borderTopWidth: 1,
        borderTopColor: Colors.borderNeutralDisable,
    },
    buttonWrapper: {
        borderTopWidth: 1,
        borderTopColor: Colors.borderNeutralDisable,
    },
    cannelText: {
        paddingVertical: size.s_18,
        color: Colors.white,
        textAlign: 'center',
    },
    SubmitButton: {
        margin: size.s_10,
        backgroundColor: Colors.red,
        borderRadius: size.s_4
    },
    SubmitText: {
        paddingVertical: size.s_10,
        color: Colors.white,
        textAlign: 'center',
    },
    messageBox: {
        paddingTop: size.s_10,
        borderRadius: size.s_4,
        borderWidth: 1,
        borderColor: Colors.borderNeutralDisable
    },
    selectedMessageText: {
        color: Colors.tertiary,
        marginBottom: size.s_10
    },
    contentWrapper: {
        marginHorizontal: size.s_10,
    },
    reportItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Colors.bgDarkSlate,
        padding: size.s_14,
        borderRadius: size.s_8
    },
    reportTitle: {
        color: Colors.white
    },
    reportList: {
        marginTop: size.s_10
    },
    title: {
        color: Colors.white,
        fontSize: size.h4,
        textAlign: 'center',
    },
    subTitle: {
        color: Colors.tertiary,
        textAlign: 'center',
        paddingHorizontal: size.s_14
    },
    reportCategory: {
        color: Colors.tertiary,
    },
    reportCategoryTitle: {
        color: Colors.white,
    },
    reportCategoryWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: size.s_8
    }
})