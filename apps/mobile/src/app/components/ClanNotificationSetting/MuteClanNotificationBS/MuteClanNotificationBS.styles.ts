import { Attributes, size } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

export const style = (colors: Attributes) => StyleSheet.create({
  optionsBox: {
    borderRadius: 8,
    overflow: 'hidden',
    paddingHorizontal: size.s_10,
    backgroundColor: colors.secondary,
  },
  wrapperUnmuteBox: {
    paddingVertical: size.s_20,
    paddingHorizontal: size.s_10,
    backgroundColor: colors.secondary,
    flexDirection: 'row',
    alignItems: 'center'
  },
  option: {
    color: colors.text,
    fontSize: size.label,
    fontWeight: '500',
  },
  headerBS: {
    color: colors.white,
    fontSize: size.label,
    fontWeight: '600',
    textAlign: 'center'
  },
  subTitle: {
    color: colors.textDisabled,
    fontSize: size.s_12,
    fontWeight: '500',
    marginTop: size.s_10
  },
});
