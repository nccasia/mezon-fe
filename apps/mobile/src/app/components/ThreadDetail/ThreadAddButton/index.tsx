import { usePermissionChecker } from '@mezon/core';
import { Icons } from '@mezon/mobile-components';
import { size, useTheme } from '@mezon/mobile-ui';
import { selectCurrentChannelId } from '@mezon/store';
import { EOverriddenPermission, EPermission } from '@mezon/utils';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
export default function ThreadAddButton({ onPress }: { onPress: () => void }) {
	const { themeValue } = useTheme();
	const currentChannelId = useSelector(selectCurrentChannelId);
	const [isCanManageThread, isCanManageChannel] = usePermissionChecker(
		[EOverriddenPermission.manageThread, EPermission.manageChannel],
		currentChannelId ?? ''
	);

	if (isCanManageThread || isCanManageChannel) {
		return (
			<TouchableOpacity onPress={onPress} style={{ padding: size.s_10 }}>
				<Icons.PlusLargeIcon width={22} height={22} color={themeValue.text} />
			</TouchableOpacity>
		);
	}

	return <View />;
}
