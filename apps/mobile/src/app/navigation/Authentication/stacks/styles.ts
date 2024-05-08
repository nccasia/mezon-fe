import { Colors, verticalScale, size } from '@mezon/mobile-ui';
import { Dimensions, StyleSheet } from 'react-native';

const inputWidth = Dimensions.get('window').width * 0.6;
export const styles = StyleSheet.create({
    header: { backgroundColor: 'white', padding: 10, width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    headerRight: { flexDirection: 'row', gap: 10 },
    backgroundIcon: { width: 30, height: 30, backgroundColor: 'gray', borderRadius: 50, alignItems: 'center', justifyContent: 'center' }

});
