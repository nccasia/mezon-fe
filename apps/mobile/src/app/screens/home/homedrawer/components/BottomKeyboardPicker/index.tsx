import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { Colors } from '@mezon/mobile-ui';
import React, { Ref, forwardRef } from 'react';
import styles from './styles';

export type IModeKeyboardPicker = 'text' | 'emoji' | 'attachment';

interface IProps {
	height: number;
	children: React.ReactNode;
	isStickyHeader: boolean;
}

export default forwardRef(function BottomKeyboardPicker({ height = 1, children, isStickyHeader = false }: IProps, ref: Ref<BottomSheetMethods>) {
	return (
		<BottomSheet
			ref={ref}
			snapPoints={[height === 0 ? 1 : height, '100%']}
			animateOnMount
			backgroundStyle={{
				backgroundColor: Colors.secondary,
			}}
		>
			<BottomSheetScrollView
				stickyHeaderIndices={isStickyHeader ? [0] : []}
				style={styles.contentContainer}>
				{children}
			</BottomSheetScrollView>
		</BottomSheet>
	);
});
