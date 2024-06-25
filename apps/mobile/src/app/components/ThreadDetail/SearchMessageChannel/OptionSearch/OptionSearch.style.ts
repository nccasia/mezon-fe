import { Colors, size } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  wrapperOption: {
    flexDirection: 'row',
    paddingHorizontal: size.s_10,
    paddingVertical: size.s_16,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopColor: '#3b3d44',
    borderTopWidth: 0.2,
  },
  textOption: {
    color: Colors.white,
    fontSize: size.label,
    fontWeight: '500',
    maxWidth: 200
  },
  content:{
    flexDirection: "row",
    alignItems: "center"
  }
})
