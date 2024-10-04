import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Images from '../../../../assets/Images';
import { darkColor } from '../../../constants/Colors';
const ServerDetail = () => {
	return (
		<View style={styles.serverDetailsContainer}>
			<Image source={Images.ANH} style={{ width: '100%', height: 120, borderTopLeftRadius: 20 }} />
			<View style={{ marginTop: 10, paddingLeft: 10, marginBottom: 10, marginRight: 10 }}>
				<Pressable>
					<View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
						<Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700' }}>KOMU</Text>
						<Feather size={18} name="chevron-right" style={{ color: '#FFFFFF' }} />
					</View>
					<View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
						<Text style={{ color: darkColor.Content_Tertiary, fontSize: 13 }}>300 member</Text>
						<Text style={{ color: darkColor.Content_Tertiary, fontSize: 13 }}>Community</Text>
					</View>
				</Pressable>
				<View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
					<Pressable
						style={{
							display: 'flex',
							flex: 1,
							flexDirection: 'row',
							alignItems: 'center',
							justifyContent: 'center',
							borderRadius: 50,
							backgroundColor: darkColor.Border_Focus,
							gap: 5
						}}
					>
						<Feather size={20} name="search" style={{ color: darkColor.Backgound_Subtle }} />
						<Text style={{ color: darkColor.Backgound_Subtle }}>Search</Text>
					</Pressable>
					<View
						style={{
							alignItems: 'center',
							justifyContent: 'center',
							display: 'flex',
							borderRadius: 50,
							backgroundColor: darkColor.Border_Focus,
							width: 30,
							height: 30
						}}
					>
						<Feather size={20} name="user-plus" style={{ color: darkColor.Backgound_Subtle }} />
					</View>
					<View
						style={{
							alignItems: 'center',
							justifyContent: 'center',
							display: 'flex',
							borderRadius: 50,
							backgroundColor: darkColor.Border_Focus,
							width: 30,
							height: 30
						}}
					>
						<Feather size={20} name="calendar" style={{ color: darkColor.Backgound_Subtle }} />
					</View>
				</View>
				<View style={{ width: '100%', backgroundColor: darkColor.Border_Focus, height: 1, marginTop: 12, marginBottom: 12 }} />
				<>
					<ScrollView>
						<View style={{ flexDirection: 'row', alignItems: 'center' }}>
							<Feather name="align-justify" size={23} style={{ color: darkColor.Backgound_Subtle }} />
							<Text style={{ color: darkColor.Backgound_Subtle }}>Browse Channels</Text>
						</View>
						<View style={{ width: '100%', backgroundColor: darkColor.Border_Focus, height: 1, marginTop: 12, marginBottom: 12 }} />
						<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
							<Feather name="chevron-down" style={{ color: darkColor.Backgound_Subtle }} />
							<Text style={{ color: darkColor.Backgound_Subtle }}>METTING ROOM</Text>
						</View>
						<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
							<Feather name="chevron-right" style={{ color: darkColor.Backgound_Subtle }} />
							<Text style={{ color: darkColor.Backgound_Subtle }}>Kênh đàm thoại</Text>
						</View>
					</ScrollView>
				</>
			</View>
		</View>
	);
};

export default ServerDetail;

const styles = StyleSheet.create({
	serverDetailsContainer: {
		width: '64%',
		height: '98%',
		alignSelf: 'flex-end',
		borderTopLeftRadius: 20,
		backgroundColor: darkColor.Backgound_Disabled
	}
});
