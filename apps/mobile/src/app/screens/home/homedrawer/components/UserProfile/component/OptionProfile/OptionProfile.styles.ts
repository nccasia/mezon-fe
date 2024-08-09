import { Attributes, size } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

export const style = (colors: Attributes) => StyleSheet.create({
  wrapperOption: {
    paddingHorizontal: size.s_16,
    paddingVertical: size.s_12,
  },
  textOption: {
    color: colors.channelNormal,
    fontSize: size.label,
    fontWeight: '500',
  },
})

