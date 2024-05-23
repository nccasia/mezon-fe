import { Colors, horizontalScale, size, verticalScale } from "@mezon/mobile-ui"
import { StyleSheet } from "react-native"
import { HEIGHT, WIDTH } from "../../../constants/config"

export const styles = StyleSheet.create({
  wrapperOption:{
    width: WIDTH,
    height: HEIGHT,
    paddingHorizontal: horizontalScale(10)
  },
  optionContainer: {
    backgroundColor: Colors.bgPrimary,
    borderRadius: 8,
  },
  headerTitle: {
    color: Colors.white,
    textAlign: 'center',
    fontWeight: '600',
    fontSize: size.h5,
    marginBottom: verticalScale(10)
  },
  optionContent: {

  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    gap: 20
  },
  textOption: {
    color: Colors.white,
    fontSize: size.label,
    flex: 1,
    fontWeight: '500'
  },
  notifySetting: {
    backgroundColor: Colors.bgGrayLight,
    borderRadius: 8,
    marginTop: verticalScale(20)
  },
  icon: {color: 'white', fontWeight: '600', fontSize: 20}
})
