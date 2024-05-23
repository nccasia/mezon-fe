import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import React, { Ref, forwardRef } from 'react';
import { Colors } from '@mezon/mobile-ui';

export type IKeyboardType = 'text' | 'emoji' | 'attachment';

interface IProps {
	height: number;
	children: React.ReactNode;
}

export default forwardRef(function BottomKeyboardPicker(
	{ height = 1, children }: IProps,
	ref: Ref<BottomSheetMethods>) {

	return (
		<BottomSheet ref={ref} snapPoints={[height === 0 ? 1 : height, '100%']} animateOnMount
			backgroundStyle={{ backgroundColor: Colors.bgPrimary }}>
			<BottomSheetView>{children}</BottomSheetView>
		</BottomSheet>
	);
});
