import { size } from "@mezon/mobile-ui"
import { View } from "react-native"
import { styles } from "./styles"

export const SeparatorWithSpace = () => {
	return (
		<View style={{height: size.s_8}} />
	)
}

export const SeparatorWithLine = () => {
	return (
		<View style={styles.line} />
	)
}