import { Colors, size } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: size.s_20
  },
  headerTitle: {
    textAlign: 'center',
    color: Colors.white,
    fontSize: size.h6,
    fontWeight: '700',
    marginBottom: size.s_10
  },
  optionsSetting: {
    backgroundColor: Colors.bgDarkCharcoal,
    borderRadius: 8
  },
  option: {
    flexDirection: 'row',
    paddingVertical: size.s_10,
    paddingHorizontal: size.s_10,
    justifyContent: 'space-between',
  },
  labelOption: {
    color: Colors.white,
    fontSize: size.label,
    fontWeight: '600',
    fontFamily: "JosefinSans-Regular",
  },
  iconImageStyle: {},
  defaultNotifyName: {
    color: Colors.white,
    fontSize: size.s_14
  },
  checkbox: {
    width: 35,
    height: 35,
  },
});
