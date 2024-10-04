import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { darkColor } from '../../../constants/Colors';
const ServerNavbar = () => {
	return (
		<View style={styles.serverNavbarContainer}>
			{/* here will be the list of servers */}

			<View style={styles.commonIconStyle}>
				<Text
					style={{
						color: darkColor.Content_Subtle
					}}
				>
					1st
				</Text>
			</View>
			<View style={styles.commonIconStyle}>
				<Text
					style={{
						color: darkColor.Content_Subtle
					}}
				>
					2nd
				</Text>
			</View>
			<View style={styles.commonIconStyle}>
				<Text
					style={{
						color: darkColor.Content_Subtle
					}}
				>
					3nd
				</Text>
			</View>

			<View style={styles.commonIconStyle}>
				<Feather name="plus" size={28} style={{ color: darkColor.Foundation_Possitive }} />
			</View>
			<View style={styles.commonIconStyle}>
				<Feather name="git-branch" size={28} style={{ color: darkColor.Foundation_Possitive }} />
			</View>
		</View>
	);
};

export default ServerNavbar;

const styles = StyleSheet.create({
	serverNavbarContainer: {
		width: '18%',
		height: '98%',
		alignSelf: 'flex-end',
		alignItems: 'center'
	},
	commonIconStyle: {
		justifyContent: 'center',
		alignItems: 'center',
		height: 50,
		width: 50,
		borderRadius: 50,
		marginBottom: 10,
		backgroundColor: darkColor.Backgound_Tertiary
	}
});
