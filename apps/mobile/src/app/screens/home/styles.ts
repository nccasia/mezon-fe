import { Colors, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  drawerHeaderLeft: {
    marginLeft: 14,
    marginRight: 8
  },
  drawerHeaderTitle: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  drawerHeaderTitleTxt: {
    color: 'black',
    fontWeight: 'bold',
    marginLeft: 10,
    fontSize: 16
  },
  drawerHeaderRight: {
    flexDirection: 'row',
    paddingRight: 20,
    gap: 20,
  },
  userVoiceWrapper: {flexDirection: 'row', alignItems: 'center', gap: size.s_10, marginLeft: size.s_30, paddingVertical: size.s_6},
  userVoiceName: { color: Colors.textGray, fontSize: size.medium, fontWeight: '400' }
});
