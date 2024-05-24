import { Colors } from '@mezon/mobile-ui';
import {StyleSheet} from 'react-native'
const SWITCH_BUTTON_PADDING = 4;
export const styles = StyleSheet.create({
  containerStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.bgButton,
    borderRadius: 500,
  },
  switchButton: {
    position: 'absolute',
    left: SWITCH_BUTTON_PADDING,
    borderRadius: 100,
  },
});
