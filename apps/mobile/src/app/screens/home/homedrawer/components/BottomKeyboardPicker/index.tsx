import BottomSheet, { BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { Colors } from '@mezon/mobile-ui';
import React, { Ref, forwardRef } from 'react';
import { Colors } from '@mezon/mobile-ui';
import { Keyboard } from 'react-native';

export type IKeyboardType = 'text' | 'emoji' | 'attachment';

interface IProps {
	height: number;
	children: React.ReactNode;
}

export default forwardRef(function BottomKeyboardPicker(
	{ height = 1, children }: IProps,
	ref: Ref<BottomSheetMethods>) {

	function hiddenKeyboardOnCollapse(fromIndex: number, toIndex: number) {
		if (toIndex === 0) Keyboard.dismiss();
	}

	return (
		<BottomSheet
			ref={ref}
			animateOnMount index={-1}
			onAnimate={hiddenKeyboardOnCollapse}
			snapPoints={[height === 0 ? 1 : height, '100%']}
			backgroundStyle={{ backgroundColor: Colors.bgPrimary }}>
			<BottomSheetScrollView>{children}</BottomSheetScrollView>
		</BottomSheet>
	);
});
