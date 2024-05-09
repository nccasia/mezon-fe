import { Colors, verticalScale, size } from '@mezon/mobile-ui';
import { Dimensions, StyleSheet } from 'react-native';

const inputWidth = Dimensions.get('window').width * 0.6;
export const styles = StyleSheet.create({
    header: {
        backgroundColor: Colors.primary,
        padding: 10, width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
    },
    viewReadMessage: { backgroundColor: 'red', width: 15, height: 15, position: 'absolute', bottom: -5, right: -8, borderRadius: 50, alignItems: 'center', justifyContent: 'center' },
    textRead: { color: 'white', fontWeight: 'bold', fontSize: 10 },
    nameUser: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.textGray
    },
    headerRight: {
        flexDirection: 'row',
        gap: 10
    },
    icon: { color: Colors.textGray },
    backgroundIcon: {
        width: 30,
        height: 30,
        backgroundColor: Colors.secondary,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center'
    }

});
