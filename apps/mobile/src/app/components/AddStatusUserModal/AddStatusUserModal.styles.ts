import { Colors, size } from '@mezon/mobile-ui';
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  headerModal: { backgroundColor: Colors.transparent },
  titleHeader: {
    width: '76%',
    textAlign: 'center'
  },
  option: {
    backgroundColor: Colors.secondary,
  },
  durationText: {
    fontSize: size.label,
    color: Colors.textGray,
    fontWeight: '600',
    marginBottom: size.s_10,
    marginTop: size.s_30
  }
})

