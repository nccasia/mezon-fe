import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { size, useTheme } from '@mezon/mobile-ui';
import { memo, useCallback } from 'react';
import Backdrop from '../../../../componentUI/MezonBottomSheet/backdrop';
import { IAddMemberOrRoleBSProps } from '../../types/channelPermission.type';
import { AddMemberOrRoleContent } from './AddMemberOrRoleContent';

export const AddMemberOrRoleBS = memo(({ bottomSheetRef, channel }: IAddMemberOrRoleBSProps) => {
	const { themeValue } = useTheme();

	const onDismiss = useCallback(() => {
		bottomSheetRef.current?.dismiss();
	}, [bottomSheetRef]);

	return (
		<BottomSheetModal
			ref={bottomSheetRef}
			snapPoints={['85%']}
			style={{
				borderTopLeftRadius: size.s_14,
				borderTopRightRadius: size.s_14,
				overflow: 'hidden'
			}}
			backdropComponent={Backdrop}
			backgroundStyle={{ backgroundColor: themeValue.primary }}
		>
			<AddMemberOrRoleContent channel={channel} onDismiss={onDismiss} />
		</BottomSheetModal>
	);
});
