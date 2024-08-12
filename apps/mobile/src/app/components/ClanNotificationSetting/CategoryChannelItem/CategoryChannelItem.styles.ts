import { Attributes, size } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

export const style = (colors: Attributes) => StyleSheet.create({
  categoryItem: {
    backgroundColor: colors.secondary,
    paddingHorizontal: size.s_10,
    paddingVertical: size.s_8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomColor: colors.border,
    borderBottomWidth: 1
  },
  categoryLabel: {
    fontSize: size.label,
    color: colors.white,
    fontWeight: '600',
  },
  categorySubtext: {
    fontSize: size.label,
    color: colors.textDisabled,
    fontWeight: '400',
  },
  customStatus: {
    fontSize: size.label,
    color: colors.textDisabled,
    fontWeight: '600',
  }
});
