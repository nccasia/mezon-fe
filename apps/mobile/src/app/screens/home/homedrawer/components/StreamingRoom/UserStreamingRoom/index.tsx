import { useTheme } from '@mezon/mobile-ui';
import React from 'react';
import { View } from 'react-native';
import UserItem from './UserItem';
import { style } from './UserStreamingRoom.styles';

export default function UserStreamingRoom() {
	const users = [
		{
			name: 'ABC',
			avatar: 'https://cdn.mezon.vn/0/0/1779484387973271600/47New_Project__1_.png'
		},
		{
			name: 'ABC',
			avatar: 'https://cdn.mezon.vn/0/0/1779484387973271600/47New_Project__1_.png'
		}
	];
	const { themeValue } = useTheme();
	const styles = style(themeValue);

	return <View style={styles.gridContainer}>{users?.map((user, index) => <UserItem user={user} key={index} />)}</View>;
}
