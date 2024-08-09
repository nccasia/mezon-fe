import { Attributes } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

export const style = (colors: Attributes) => StyleSheet.create({
  optionContainer: {
    backgroundColor: colors.secondaryLight,
    marginRight: 0,
  },
  separatedItem: {
    height: 0.5,
    backgroundColor: colors.border,
  }
})
