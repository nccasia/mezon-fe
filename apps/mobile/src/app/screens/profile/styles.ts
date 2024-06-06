import { Colors, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.secondary,
        flex: 1,
        alignItems: 'center'
    },
    containerBackground: {
        width: '100%',
        height: "20%",
    },
    backgroundListIcon: {
        flexDirection: 'row',
        gap: 10, paddingTop: 15,
        justifyContent: 'flex-end',
        paddingRight: 15
    },
    backgroundSetting: {
        backgroundColor: Colors.gray48,
        height: size.s_30,
        width: size.s_30,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        flexDirection: 'row'
    },
    iconColor: {
        color: Colors.textGray
    },
    text: {
        color: Colors.textGray
    },
    textBold: {
        color: Colors.textGray,
        fontWeight: 'bold'
    },
    whiteText: {
        color: Colors.white
    },
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: size.s_4,
        backgroundColor: Colors.bgViolet,
        borderRadius: 50,
        flex: 1,
        paddingVertical: size.s_10,
        
        flexDirection: 'row',
    },
    viewImageProfile: {
        position: 'absolute',
        width: size.s_100,
        height: size.s_100,
        borderRadius: 50,
        backgroundColor: 'gray',
        left: size.s_18,
        bottom: -size.s_50,
        borderWidth: 5,
        borderColor: Colors.secondary,
    },
    textAvatar: {
        backgroundColor: Colors.bgGrayDark,
        width: '100%',
        height: '100%',
        textAlign: 'center',
        textAlignVertical: 'center',
        borderRadius: 50,
        fontSize: size.h5,
        color: Colors.white
    },
    dotOnline: {
        position: 'absolute',
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: Colors.green,
        bottom: size.s_2,
        right: size.s_2,
        borderWidth: 2,
        borderColor: Colors.secondary
    },
    contentContainer: {
        backgroundColor: Colors.tertiaryWeight,
        borderRadius: 20,
        padding: size.s_18,
        marginTop: size.s_20,
    },
    viewInfo: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    textName: {
        fontSize: size.h5,
        fontWeight: 'bold',
        color: Colors.textGray
    },
    buttonList: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: size.s_20,
        gap: size.s_10,
        flex: 1
    },
    contentWrapper: {
        paddingHorizontal: size.s_18,
        width: '100%',
        marginTop: size.s_60,
    },
    imageContainer: {
        position: 'absolute',

    },
    listImageFriend: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        flex: 1,
        justifyContent: 'flex-end'
    },
    imgWrapper: {
        width: '100%',
        height: '100%',
        borderRadius: 50
    },
    imgList: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flex: 1
    },
    imageFriend: {
        width: size.s_30,
        height: size.s_30,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: Colors.tertiaryWeight
    },
});
