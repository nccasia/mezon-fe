import { Attributes, Colors, Metrics, size, verticalScale } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

export const style = (colors: Attributes) => StyleSheet.create({
    imageMessageRender: {
        borderRadius: verticalScale(5),
        marginVertical: size.s_6,
        borderWidth: 0.5,
        borderColor: Colors.borderPrimary,
    },
    fileViewer: {
        gap: size.s_6,
        marginTop: size.s_6,
        paddingHorizontal: size.s_10,
        width: '80%',
        minHeight: verticalScale(50),
        alignItems: 'center',
        borderRadius: size.s_6,
        flexDirection: 'row',
        backgroundColor: Colors.bgPrimary,
    },
    fileName: {
        fontSize: size.small,
        color: Colors.white,
    },
    messageWrapper: {
        flexDirection: 'column',
        marginTop: size.s_10,
    },
    highlightMessageMention: {
        backgroundColor: Colors.bgMessageHighlight,
        borderLeftColor: Colors.borderMessageHighlight,
        borderLeftWidth: 2,
        paddingTop: size.s_2,
    },
    highlightMessageReply: {
        backgroundColor: Colors.bgReply,
        borderLeftColor: Colors.borderMessageReply,
        borderLeftWidth: 2,
        paddingTop: size.s_2,
    },
    newMessageLine: {
        height: 1,
        width: "100%",
        backgroundColor: Colors.red,
        marginVertical: Metrics.size.xl,
        position: "relative"
    },
    newMessageContainer: {
        position: "absolute",
        top: -15,
        left: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%"
    },
    newMessageText: {
        color: Colors.red,
        backgroundColor: Colors.secondary,
        paddingHorizontal: Metrics.size.s,
    },
    aboveMessage: {
        flexDirection: 'row',
        marginTop: size.s_6,
        paddingLeft: size.s_10,
        gap: 15,
    },
    iconReply: {
        width: size.s_34,
        height: '100%',
        alignItems: 'center',
        paddingLeft: size.s_30,
        marginTop: size.s_4,
    },
    repliedMessageWrapper: {
        flexDirection: 'row',
        gap: 8,
        marginRight: 0,
        marginTop: size.s_4
    },
    replyAvatar: {
        width: size.s_20,
        height: size.s_20,
        borderRadius: size.s_50,
        backgroundColor: Colors.gray48,
        overflow: 'hidden',
    },
    avatarMessageBoxDefault: {
        width: '100%',
        height: '100%',
        borderRadius: size.s_50,
        backgroundColor: Colors.titleReset,
        justifyContent: 'center',
        alignItems: 'center',
    },
    repliedTextAvatar: {
        fontSize: size.s_16,
        color: Colors.white,
    },
    replyContentWrapper: {
        width: '85%',
        flexDirection: 'row',
        alignItems: 'center',
        top: -size.s_8,
        gap: 4
    },
    replyDisplayName: {
        color: Colors.caribbeanGreen,
        fontSize: size.small
    },
    aboveMessageDeleteReply: {
        flexDirection: 'row',
        paddingLeft: size.s_10,
        gap: 5,
        marginTop: size.s_6,
        alignItems: 'center'
    },
    deletedMessageReplyIcon: {
        top: size.s_4
    },
    iconMessageDeleteReply: {
        backgroundColor: Colors.bgCharcoal,
        width: size.s_20,
        height: size.s_20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingRight: size.s_6,
        borderRadius: 50,
        marginLeft: size.s_6
    },
    messageDeleteReplyText: {
        fontSize: size.small,
        color: Colors.tertiary,
        overflow: 'hidden',
        width: '80%',
        fontStyle: 'italic'
    },
    wrapperMessageBox: {
        flexDirection: 'row',
        paddingLeft: size.s_10,
        marginBottom: size.s_2,
        paddingRight: size.s_50,
    },
    wrapperMessageBoxCombine: {
        // marginBottom: size.s_10,
    },
    wrapperAvatar: {
        width: size.s_40,
        height: size.s_40,
        borderRadius: size.s_40,
        overflow: 'hidden',
    },
    logoUser: {
        width: '100%',
        height: '100%',
    },
    textAvatarMessageBoxDefault: {
        fontSize: size.s_22,
        color: Colors.white,
    },
    wrapperAvatarCombine: {
        width: size.s_40,
    },
    rowMessageBox: {
        marginLeft: 15,
        justifyContent: 'space-between',
        width: '90%',
    },
    messageBoxTop: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: size.s_6,
    },
    userNameMessageBox: {
        fontSize: size.medium,
        marginRight: size.s_10,
        fontWeight: '700',
        color: Colors.caribbeanGreen,
    },
    dateMessageBox: {
        fontSize: size.small,
        color: Colors.gray72,
    },
})