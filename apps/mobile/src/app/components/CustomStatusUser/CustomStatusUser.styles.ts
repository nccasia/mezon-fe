import { Colors, size } from '@mezon/mobile-ui';
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  option: {
    backgroundColor: Colors.secondary,
    borderBottomColor: Colors.bgCharcoal,
    borderBottomWidth: 1
  },
  titleHeader: {
    fontSize: size.h6,
    color: Colors.white,
    fontWeight: '600',
    textAlign: 'center'
  },
  label: {
    fontSize: size.label,
    color: Colors.textGray,
    fontWeight: '600',
    marginTop: size.s_20,
    marginBottom: size.s_8
  },
  customStatusText: {
    fontSize: size.label,
    color: Colors.textGray,
    fontWeight: '400',
    flex: 1
  },
  setCustomStatusBtn: {
    alignItems:"center",
    gap: size.s_10,
    flexDirection: "row",
    justifyContent: 'space-between',
    padding: size.s_14,
    backgroundColor: Colors.secondary,
    borderRadius: size.s_16,
    marginTop: size.s_20},
},
)

