import { Colors, verticalScale, size } from '@mezon/mobile-ui';
import { Dimensions, StyleSheet } from 'react-native';

const inputWidth = Dimensions.get('window').width * 0.6;
const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height
export const styles = StyleSheet.create({
    container: { backgroundColor: Colors.secondary, width: WIDTH, height: HEIGHT, alignItems: 'center' },
    containerBackground: { width: '100%', height: "15%", backgroundColor: Colors.Content_Secondary },
    backgroundListIcon: { flexDirection: 'row', gap: 10, paddingTop: 15, justifyContent: 'flex-end', paddingRight: 15 },
    backgroundNitro: { backgroundColor: Colors.gray48, paddingHorizontal: 10, height: 30, borderRadius: 50, alignItems: 'center', justifyContent: 'center', gap: 5, flexDirection: 'row' },
    backgroundSetting: { backgroundColor: Colors.gray48, height: 30, width: 30, borderRadius: 50, alignItems: 'center', justifyContent: 'center', gap: 5, flexDirection: 'row' },
    icon: { color: Colors.textGray },
    text: { color: Colors.textGray },
    textBold: { color: Colors.textGray, fontWeight: 'bold' },
    viewImageProfile: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: 'gray', bottom: -50, left: 30, borderWidth: 5, borderColor: Colors.secondary, },
    textAvatar: {backgroundColor: Colors.bgGrayDark, width: '100%', height: '100%', textAlign: 'center', textAlignVertical: 'center', borderRadius: 50, fontSize: size.h5, color: Colors.white},
    imageProfile: { width: '100%', height: '100%', borderRadius: 50 },
    dotOnline: { position: 'absolute', width: 20, height: 20, borderRadius: 10, backgroundColor: 'green', bottom: 2, right: 0, borderWidth: 2, borderColor: Colors.secondary },
    contentContainer: { marginTop: 60, width: '90%', height: '20%', backgroundColor: Colors.tertiaryWeight, justifyContent: 'center', borderRadius: 20, paddingLeft: 20, paddingRight: 20 },
    viewInfo: { flexDirection: 'row', alignItems: 'center' },
    textName: { fontSize: 20, fontWeight: 'bold', color: Colors.textGray },
    buttonList: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
    viewButton: { width: "48%", height: 40, flexDirection: 'row', backgroundColor: Colors.blue, alignItems: 'center', justifyContent: 'center', borderRadius: 20, gap: 5 },
    memberView: { marginTop: 20, width: '90%', height: '10%', backgroundColor: Colors.tertiaryWeight, justifyContent: 'center', borderRadius: 20, paddingLeft: 20, paddingRight: 20 },
    viewFriend: { marginTop: 20, width: '90%', height: '8%', backgroundColor: Colors.tertiaryWeight, justifyContent: 'space-between', borderRadius: 20, paddingLeft: 20, paddingRight: 20, flexDirection: 'row', alignItems: 'center' },
    listImageFriend: { flexDirection: 'row', alignItems: 'center' },
    imageFriend: { width: 30, height: 30, borderRadius: 50, borderWidth: 2, borderColor: Colors.tertiaryWeight },
    container_customBottomSheet: { backgroundColor: Colors.secondary, flexDirection: 'row', height: 50, alignItems: 'center', justifyContent: 'space-between' },
    containerListFriend: {
        backgroundColor: Colors.secondary, width: WIDTH, height: HEIGHT, paddingHorizontal: 20
    },
    boxFriendContainer: { width: '100%', padding: 10, backgroundColor: Colors.gray48 },
    listFriendGroup: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    boxFriend: { borderRadius: 50, backgroundColor: Colors.gray48, flexDirection: 'row', alignItems: 'center', gap: 10 },
    ViewImagefriend: { width: 30, height: 30 },
    friendImage: { width: '100%', height: '100%', borderRadius: 50 },
    dotOnlineFriend: { position: 'absolute', bottom: -1, backgroundColor: 'green', borderRadius: 50, height: 10, width: 10, right: 0 },
    dotOfflineFriend: { position: 'absolute', bottom: -1, backgroundColor: 'gray', borderRadius: 50, height: 10, width: 10, right: 0 }
});
