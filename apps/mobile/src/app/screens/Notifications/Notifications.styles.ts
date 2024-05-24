import { Colors } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';
import { HEIGHT, WIDTH } from '../../constants/config';
export const styles = StyleSheet.create({
notifications :{
  width: WIDTH,
  height: HEIGHT,
  backgroundColor: Colors.secondary
},
notificationsHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: 10
},
notificationHeaderTitle: {
  fontSize: 18,
  fontWeight: '600',
  color: Colors.white
},
notificationHeaderIcon: { alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.black, borderRadius: 50, height: 35, width: 35 },
notificationsList: {},
container: {
  flex: 1,
  padding: 24,
},
contentContainer: {
  flex: 1,
  alignItems: 'center',
},
})
