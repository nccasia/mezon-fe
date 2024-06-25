import { Colors, size } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  optionSearchContainer: {
    backgroundColor: Colors.bgCharcoal
  },
  headerTitle: {
    color: Colors.white,
    fontSize: size.label,
    fontWeight: '600',
    height: size.s_50,
    borderBottomColor: '#3b3d44',
    borderBottomWidth: 4,
    paddingHorizontal: size.s_10,
    paddingVertical: size.s_10
  }
})
