import { Colors, verticalScale, size } from '@mezon/mobile-ui';
import { Dimensions, StyleSheet } from 'react-native';
import { HEIGHT, WIDTH } from '../../constants/config';

const inputWidth = Dimensions.get('window').width * 0.6;
export const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.tertiaryWeight,
        width: WIDTH,
        height: HEIGHT,
        paddingHorizontal: 20
    },
    headerContainer: {
        width: '100%',
        paddingVertical: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',

    },
    textHeader: { fontSize: size.s_18, color: Colors.textGray, fontWeight: 'bold' },
    containerAddFriend: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.secondary,
        borderRadius: 40,
        paddingHorizontal: 15,
        gap: 8,
        height: 35,
    },
    iconFriends: {
        color: Colors.textGray
    },
    textAddFriend: {
        color: Colors.textGray,
        fontWeight: 'bold'
    },
    containerSearchInput: {
        width: '100%',
        backgroundColor: Colors.primary,
        paddingHorizontal: 20,
        alignItems: 'center',
        flexDirection: 'row',
        borderRadius: 30,
        marginBottom: 10
    },
    iconSearch: {
        color: Colors.textGray
    },
    inputSearch: {
        color: Colors.textGray,
    },
    body: { width: '100%', gap: 10 },
    contentContainerStyle: {
        paddingBottom: 40, flex: 1,
        backgroundColor: Colors.tertiaryWeight
    },
    dotOnline: {
        position: 'absolute',
        width: 16,
        height: 16,
        borderRadius: 10,
        backgroundColor: 'green',
        bottom: 4,
        right: 6,
        borderWidth: 2,
        borderColor: Colors.tertiaryWeight,
    },
    dotOffline: {
        position: 'absolute',
        width: 16,
        height: 16,
        borderRadius: 10,
        backgroundColor: Colors.gray72,
        bottom: 4,
        right: 6,
        borderWidth: 2,
        borderColor: Colors.tertiaryWeight,
    },
    ChatContainer: { flexDirection: 'row', width: '100%', height: 60 },
    imageChat: { width: 60, height: 60 },
    imageFriend: { width: '90%', height: '90%', borderRadius: 50 },
    headerChatList: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    textChatName: { fontWeight: 'bold', color: Colors.textGray },
    textChatMessage: { fontSize: 16, color: 'gray' },
    textDay: {
        color: 'gray',
        fontSize: 12,
        fontWeight: 'bold'
    },
    helloImage: { width: 80, height: 80, borderRadius: 50 },
    textHelloBold: { fontWeight: 'bold', fontSize: 35, color: Colors.textGray },
    textHello: { fontSize: 33, color: Colors.textGray },
    ChatMessageContainer: { flexDirection: 'row', width: '100%', height: 60, gap: 10, alignItems: 'center' },
    headerChatMessage: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    imageMessage: { width: 35, height: 35, borderRadius: 50 },
    buttonContainer: {
        flexDirection: 'row',
        backgroundColor: Colors.primary,
        shadowColor: Colors.black,
        // shadowOffset: { height: -8 },
        shadowOpacity: 0.05,
        height: 60,
        alignItems: 'center'
    }
});
