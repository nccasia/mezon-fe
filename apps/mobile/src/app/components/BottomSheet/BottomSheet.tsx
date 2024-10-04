import React from 'react';
import { View } from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import { darkColor } from '../../constants/Colors';
const BottomSheet = ({ bottomSheetRef, children }) => {
	return (
		<RBSheet
			ref={bottomSheetRef}
			draggable={true}
			height={850}
			openDuration={250}
			closeOnPressBack={true}
			dragOnContent={true}
			closeOnPressMask={true}
			customStyles={{
				wrapper: {
					backgroundColor: 'rgba(0,0,0,0.2)'
				},
				draggableIcon: { backgroundColor: darkColor.Backgound_Subtle, width: 100 },
				container: {
					borderTopLeftRadius: 30,
					borderTopRightRadius: 30,
					backgroundColor: '#2b2d31'
				}
			}}
		>
			<View>{children}</View>
		</RBSheet>
	);
};

export default BottomSheet;
