import { Colors } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
	closeIcon: {
		color: Colors.white,
	},
    container: {
        flex: 1,
        backgroundColor: Colors.bgCharcoal
    },
    headerWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 40,
        paddingBottom: 15,
        paddingHorizontal: 8,
        backgroundColor: Colors.bgDarkSlate
    },
    headerContent: {
        flexDirection: 'row'
    },
    textTitle: {
        color: Colors.white,
        fontSize: 20,
        marginLeft: 10,
    },
    confirm: {
        color: Colors.white,
        fontSize: 18,
        marginLeft: 10,
    }
})