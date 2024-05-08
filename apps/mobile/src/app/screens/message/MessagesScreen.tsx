import moment from 'moment';
import React, { useState } from 'react';
import { FlatList, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { darkColor } from '../../constants/Colors';
import { styles } from './styles';
import { Colors } from '@mezon/mobile-ui';
import { useFriends } from '@mezon/core';
import { APP_SCREEN } from '../../navigation/ScreenTypes';
import { useNavigation } from "@react-navigation/native";

const chats = [
	{
		id: '9a1b0bf5-6cac-4ea6-a0fb-bf139df9a2cf',
		from: 'Aguilar',
		date: 'Wed Sep 10 2008 01:23:35 GMT+0200 (Central European Summer Time)',
		img: 'https://i.pravatar.cc/150?u=aguilarduke@marketoid.com',
		msg: 'OKE',
		read: true,
		unreadCount: 2,
		online: true,
	},
	{
		id: '16d121b0-bad3-475a-a1d3-57060a25e3c2',
		from: 'Baxter',
		date: 'Wed May 20 1998 08:53:35 GMT+0200 (Central European Summer Time)',
		img: 'https://i.pravatar.cc/150?u=baxterduke@marketoid.com',
		msg: 'Commodo tempor consequat elit in sit sint cillum magna laborum laborum veniam ea exercitation quis.',
		read: false,
		unreadCount: 2,
		online: true,
	},
	{
		id: '594d6cfc-5f69-4e63-ba2b-6eb318fc5d7d',
		from: 'Bonnie',
		date: 'Tue Dec 30 2003 17:58:09 GMT+0100 (Central European Standard Time)',
		img: 'https://i.pravatar.cc/150?u=bonnieduke@marketoid.com',
		msg: 'Labore excepteur reprehenderit deserunt pariatur in cupidatat dolor Lorem nulla elit irure.',
		read: true,
		unreadCount: 1,
		online: true,
	},
	{
		id: 'd90b9cac-aca0-4b8f-9ac5-3b7c228e3657',
		from: 'Myrna',
		date: 'Fri Dec 24 2010 08:09:38 GMT+0100 (Central European Standard Time)',
		img: 'https://i.pravatar.cc/150?u=myrnaduke@marketoid.com',
		msg: 'Proident cupidatat sint exercitation incididunt enim deserunt cillum irure.',
		read: true,
		unreadCount: 0,
		online: false,
	},
	{
		id: '45ba88b0-3d9e-4ca7-a93a-45b7db9d7100',
		from: 'Terra',
		date: 'Mon Jun 04 1990 16:28:06 GMT+0200 (Central European Summer Time)',
		img: 'https://i.pravatar.cc/150?u=terraduke@marketoid.com',
		msg: 'Deserunt mollit qui aute enim sit enim ullamco nostrud velit excepteur culpa in.',
		read: false,
		unreadCount: 0,
		online: true,
	},
	{
		id: '874933b3-b7ba-47e0-8bcd-40defa550c68',
		from: 'Bessie',
		date: 'Wed Jul 17 1985 00:01:43 GMT+0200 (Central European Summer Time)',
		img: 'https://i.pravatar.cc/150?u=bessieduke@marketoid.com',
		msg: 'Duis et eu commodo nulla in anim elit.',
		read: true,
		unreadCount: 0,
		online: true,
	},
	{
		id: 'f09bb250-6e5b-4d98-a849-93e0fdc1a351',
		from: 'Ella',
		date: 'Fri Aug 05 2011 14:09:06 GMT+0200 (Central European Summer Time)',
		img: 'https://i.pravatar.cc/150?u=elladuke@marketoid.com',
		msg: 'Commodo pariatur proident et dolor.',
		read: false,
		unreadCount: 2,
		online: false,
	},
	{
		id: 'c4ae3078-4df8-4c0d-b55f-73e02622ee0f',
		from: 'Cain',
		date: 'Thu Mar 06 1997 05:05:53 GMT+0100 (Central European Standard Time)',
		img: 'https://i.pravatar.cc/150?u=cainduke@marketoid.com',
		msg: 'Ex ea magna exercitation duis aliquip minim pariatur adipisicing.',
		read: false,
		unreadCount: 3,
		online: false,
	},
	{
		id: 'c6650dc2-2fa3-4415-9fb7-239ccc7983d0',
		from: 'Herring',
		date: 'Tue Sep 05 2017 21:57:55 GMT+0200 (Central European Summer Time)',
		img: 'https://i.pravatar.cc/150?u=herringduke@marketoid.com',
		msg: 'Qui velit laborum dolore labore dolor est.',
		read: true,
		unreadCount: 1,
		online: false,
	},
	{
		id: 'a8c98568-690f-43aa-b188-0d13ff10dbde',
		from: 'Jerri',
		date: 'Wed Jul 07 2021 22:38:47 GMT+0200 (Central European Summer Time)',
		img: 'https://i.pravatar.cc/150?u=jerriduke@marketoid.com',
		msg: 'Nisi irure nostrud tempor ex aute aute consectetur reprehenderit velit.',
		read: true,
		unreadCount: 2,
		online: true,
	},
	{
		id: '9160e9d7-8e66-425f-99a0-dd323d464387',
		from: 'Yvette',
		date: 'Fri May 03 1996 17:50:23 GMT+0200 (Central European Summer Time)',
		img: 'https://i.pravatar.cc/150?u=yvetteduke@marketoid.com',
		msg: 'Ea consectetur ex ullamco commodo reprehenderit dolore occaecat aute culpa commodo exercitation id.',
		read: false,
		unreadCount: 1,
		online: true,
	},
	{
		id: 'd8da9548-3691-47f1-940a-85f0dba6d470',
		from: 'Cornelia',
		date: 'Thu Feb 06 2003 18:59:28 GMT+0100 (Central European Standard Time)',
		img: 'https://i.pravatar.cc/150?u=corneliaduke@marketoid.com',
		msg: 'Qui incididunt pariatur do esse pariatur reprehenderit nulla id deserunt magna consequat sint non.',
		read: false,
		unreadCount: 2,
		online: true,
	},
	{
		id: '349337b0-ada4-4ba1-9899-914913daacc6',
		from: 'Mueller',
		date: 'Wed May 20 1987 01:53:37 GMT+0200 (Central European Summer Time)',
		img: 'https://i.pravatar.cc/150?u=muellerduke@marketoid.com',
		msg: 'Dolore proident laborum laborum consequat ea duis ut sunt sint ullamco qui tempor.',
		read: false,
		unreadCount: 0,
		online: false,
	},
	{
		id: 'ddd8aef7-c1c1-4d76-aea1-89c9c43d7491',
		from: 'Anita',
		date: 'Tue Jun 14 2016 17:52:21 GMT+0200 (Central European Summer Time)',
		img: 'https://i.pravatar.cc/150?u=anitaduke@marketoid.com',
		msg: 'Minim elit ex veniam eiusmod ut.',
		read: true,
		unreadCount: 0,
	},
	{
		id: 'a257f2f2-400a-45d2-8f7f-2425535ebbb1',
		from: 'Beverley',
		date: 'Wed Sep 19 2012 18:31:41 GMT+0200 (Central European Summer Time)',
		img: 'https://i.pravatar.cc/150?u=beverleyduke@marketoid.com',
		msg: 'In incididunt aliquip elit amet sit laboris est mollit cillum anim amet sit sunt ut.',
		read: true,
		unreadCount: 3,
	},
	{
		id: '66b9566e-03f7-4c9a-a315-0b1975b3fb6f',
		from: 'Lindsay',
		date: 'Tue Dec 24 2002 17:16:18 GMT+0100 (Central European Standard Time)',
		img: 'https://i.pravatar.cc/150?u=lindsayduke@marketoid.com',
		msg: 'Mollit consectetur laboris aute adipisicing aute Lorem nostrud sunt.',
		read: false,
		unreadCount: 0,
	},
	{
		id: 'ec99722b-095b-4a44-b945-43b6660d8ede',
		from: 'Jewel',
		date: 'Sun Jun 12 1988 12:19:33 GMT+0200 (Central European Summer Time)',
		img: 'https://i.pravatar.cc/150?u=jewelduke@marketoid.com',
		msg: 'Amet adipisicing duis tempor fugiat sit cillum nisi dolore occaecat pariatur eiusmod tempor.',
		read: false,
		unreadCount: 1,
	},
	{
		id: '3d8a32e7-590d-4bcd-8600-624e09baac1b',
		from: 'Parks',
		date: 'Thu Oct 25 1984 17:37:01 GMT+0100 (Central European Standard Time)',
		img: 'https://i.pravatar.cc/150?u=parksduke@marketoid.com',
		msg: 'Deserunt veniam veniam Lorem mollit sint adipisicing tempor proident.',
		read: true,
		unreadCount: 3,
	},
	{
		id: '8227764e-ea3a-4369-af0e-b692a2475f4e',
		from: 'Elliott',
		date: 'Sun Jul 28 1974 03:25:44 GMT+0100 (Central European Standard Time)',
		img: 'https://i.pravatar.cc/150?u=elliottduke@marketoid.com',
		msg: 'Nisi eu labore quis in.',
		read: false,
		unreadCount: 1,
	},
	{
		id: 'f96fc7f8-c6f4-492c-9d9d-111aa4f2d213',
		from: 'Shields',
		date: 'Tue Feb 27 1979 03:23:55 GMT+0100 (Central European Standard Time)',
		img: 'https://i.pravatar.cc/150?u=shieldsduke@marketoid.com',
		msg: 'Cillum mollit duis consequat magna minim officia id enim anim amet enim.',
		read: false,
		unreadCount: 1,
	},
	{
		id: 'a18e2182-fa22-4cea-b84a-e49cefe0bceb',
		from: 'Felicia',
		date: 'Wed Jan 23 1985 11:46:33 GMT+0100 (Central European Standard Time)',
		img: 'https://i.pravatar.cc/150?u=feliciaduke@marketoid.com',
		msg: 'Do excepteur non Lorem reprehenderit aute.',
		read: false,
		unreadCount: 3,
	},
	{
		id: 'fe65602a-d1e7-4d02-9275-07c43a69519c',
		from: 'Ruiz',
		date: 'Tue Dec 15 1987 00:04:48 GMT+0100 (Central European Standard Time)',
		img: 'https://i.pravatar.cc/150?u=ruizduke@marketoid.com',
		msg: 'Amet ex anim ut aliqua culpa incididunt cillum.',
		read: false,
		unreadCount: 3,
	},
	{
		id: '50a2e86c-d31a-46a1-b3d3-9d3dff98cd82',
		from: 'Laurel',
		date: 'Fri Dec 22 2000 21:49:21 GMT+0100 (Central European Standard Time)',
		img: 'https://i.pravatar.cc/150?u=laurelduke@marketoid.com',
		msg: 'Do irure irure consectetur ullamco officia pariatur excepteur.',
		read: true,
		unreadCount: 0,
	},
	{
		id: '59c41dca-f2c7-4ed4-9147-01f0f29ba005',
		from: 'Brittany',
		date: 'Sun Aug 28 2011 08:18:22 GMT+0200 (Central European Summer Time)',
		img: 'https://i.pravatar.cc/150?u=brittanyduke@marketoid.com',
		msg: 'Culpa cupidatat sunt duis commodo ex aute voluptate ut.',
		read: true,
		unreadCount: 2,
	},
	{
		id: 'e7f501e4-a7a1-4395-ab12-a2e6f9ca230c',
		from: 'Lindsay',
		date: 'Fri Mar 25 2016 15:16:00 GMT+0100 (Central European Standard Time)',
		img: 'https://i.pravatar.cc/150?u=lindsayduke@marketoid.com',
		msg: 'Magna enim ad nulla nisi.',
		read: true,
		unreadCount: 3,
		online: true,
	},
];
const MessagesScreen = () => {
	// const data = useSelector
	const [value, setValue] = React.useState<string>('');

	const navigation = useNavigation();

	const onDetail = ({ userData }) => {
		// Example for navigation detail screen
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		navigation.push(APP_SCREEN.MESSAGES.STACK, {
			screen: APP_SCREEN.MESSAGES.USER,
			params: userData,
		});
	};
	return (
		<View style={styles.container}>
			{/* header */}
			<View style={styles.headerContainer}>
				{/* header */}
				<Text style={styles.textHeader}>Messages</Text>
				<View
					style={styles.containerAddFriend}
				>
					<Feather name="user-plus" size={20} style={styles.iconFriends} />
					<Text style={styles.textAddFriend}>Add Friends</Text>
				</View>
			</View>
			<ScrollView>
				{/* search */}
				<View
					style={styles.containerSearchInput}
				>
					<Feather name="search" size={20} style={styles.iconSearch} />
					<TextInput placeholder="Search" style={styles.inputSearch} placeholderTextColor={Colors.gray72} value={value} onChangeText={setValue} />
				</View>
				{/* body */}
				<View style={styles.body}>
					<ScrollView
						contentInsetAdjustmentBehavior="automatic"
						contentContainerStyle={styles.contentContainerStyle}
						showsHorizontalScrollIndicator={false}
						horizontal={true}
					>
						<FlatList
							data={chats}
							keyExtractor={(item) => item.id.toString()}
							ItemSeparatorComponent={() => <View style={{}} />}
							renderItem={({ item }) => (
								<TouchableOpacity onPress={() => onDetail(item)} style={styles.ChatContainer}>
									<View style={styles.imageChat}>
										<Image source={{ uri: item.img }} style={styles.imageFriend} />
										{item.online ? (
											<View
												style={styles.dotOnline}
											></View>
										) : (
											<View
												style={styles.dotOffline}
											></View>
										)}
									</View>
									<View style={{ flex: 1 }}>
										<View style={styles.headerChatList}>
											<Text style={styles.textChatName}>{item.from}</Text>
											<Text style={styles.textDay}>{moment().diff(moment(item.date), 'days')} d</Text>
										</View>
										<Text style={styles.textChatMessage}>
											{item.from}:
											<Text style={styles.textChatMessage}>
												{item.msg.length > 25 ? `${item.msg.substring(0, 25)}...` : item.msg}
											</Text>
										</Text>
									</View>
								</TouchableOpacity>
							)}
						/>
					</ScrollView>
				</View>
			</ScrollView>
			<View
				style={{
					position: 'absolute',
					bottom: 100,
					right: 10,
					width: 60,
					height: 60,
					backgroundColor: darkColor.Foundation_Possitive,
					borderRadius: 50,
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<Feather name="message-circle" size={30} />
			</View>
		</View>
	);
};

export default MessagesScreen;
