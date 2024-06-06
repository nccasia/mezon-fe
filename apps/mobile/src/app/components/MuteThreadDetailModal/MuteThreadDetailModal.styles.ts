import { Colors, size } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: size.s_18,
    paddingHorizontal: size.s_10,
    width: '100%',
    height: '100%',
  },
  optionsBox: {
    borderRadius: 8,
    overflow: 'hidden',
    paddingHorizontal: size.s_10,
    backgroundColor: Colors.bgDarkCharcoal,
  },
  wrapperItem: {
    paddingVertical: size.s_20,
    paddingHorizontal: size.s_10,
    backgroundColor: Colors.bgDarkCharcoal,
    borderBottomColor: Colors.gray48,
    borderBottomWidth: 0.5
  },
  wrapperUnmuteBox: {
    paddingVertical: size.s_20,
    paddingHorizontal: size.s_10,
    backgroundColor: Colors.bgDarkCharcoal,
    borderBottomColor: Colors.gray48,
    borderBottomWidth: 0.5,
    flexDirection: 'row',
    alignItems: 'center'
  },
  wrapperItemNotification: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: size.s_20,
    paddingHorizontal: size.s_10,
    backgroundColor: Colors.bgDarkCharcoal,
    borderBottomColor: Colors.gray48,
    borderRadius: 8,
    marginTop: size.s_20
  },
  option: {
    color: Colors.white,
    fontSize: size.label,
    fontWeight: '500',
  },
  InfoTitle: {
    color: Colors.textGray,
    fontSize: size.medium,
    fontWeight: '500',
    marginTop: size.s_10
  }
})
