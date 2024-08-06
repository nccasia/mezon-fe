import { useUserPermission } from '@mezon/core';
import { Icons } from '@mezon/mobile-components';
import { size, useTheme } from '@mezon/mobile-ui';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { APP_SCREEN } from '../../../navigation/ScreenTypes';
export default function ThreadAddButton() {
	const navigation = useNavigation<any>();
	const { themeValue } = useTheme();
	const { isCanManageThread } = useUserPermission();
	if (!isCanManageThread) {
		return <View />;
	}
	return (
		<TouchableOpacity
			onPress={() => navigation.navigate(APP_SCREEN.MENU_THREAD.STACK, { screen: APP_SCREEN.MENU_THREAD.CREATE_THREAD_FORM_MODAL })}
			style={{ padding: size.s_10 }}
		>
			<Icons.PlusLargeIcon width={22} height={22} color={themeValue.text} />
		</TouchableOpacity>
	);
}
