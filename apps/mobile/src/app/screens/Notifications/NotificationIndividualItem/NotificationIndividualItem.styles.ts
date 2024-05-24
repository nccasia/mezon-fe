import { horizontalScale, size, verticalScale, Colors } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';
export const styles = StyleSheet.create({
  notifyContainer: {
    paddingHorizontal: 20
  },
  notifyHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10
  },
  notifyContent: {
    flex: 1,
  },
  notifyHeaderTitle: {
    color: Colors.textGray,
    fontSize: size.label,
    fontWeight: '400',
    marginBottom: 5
  },
  notifyDuration: {
    color: Colors.textGray,
  },
  boxImage: {
    width: horizontalScale(60),
    height: verticalScale(60),
    borderRadius: 50,
    marginBottom: 10
  },
  image: {
    width: '90%',
    height: '90%',
    borderRadius: 50
  },
  boxImageChar: {
    width: horizontalScale(60),
    height: verticalScale(60),
    borderRadius: 50,
    backgroundColor: Colors.bgDarkCharcoal,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },
  contentMessage: {
    marginBottom: 10,
    borderLeftColor: Colors.borderNeutralDisable,
    borderLeftWidth: 2,
    paddingLeft: 8
  }
})
