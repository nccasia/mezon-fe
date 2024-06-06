import { size } from '@mezon/mobile-ui';
import React from 'react';
import { TouchableHighlight, View } from 'react-native';
import PlusIcon from '../../../../assets/svg/plus.svg';
export default function ThreadAddButton() {
	return (
		<TouchableHighlight style={{ padding: size.s_10 }}>
			<View>
				<PlusIcon width={22} height={22} />
			</View>
		</TouchableHighlight>
	);
}
