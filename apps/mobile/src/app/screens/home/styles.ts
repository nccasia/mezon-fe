import { StyleSheet, Dimensions } from 'react-native';

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
});
