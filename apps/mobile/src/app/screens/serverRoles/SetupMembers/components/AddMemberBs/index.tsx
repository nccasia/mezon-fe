import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { size, useTheme } from '@mezon/mobile-ui';
import { RolesClanEntity, UsersClanEntity } from '@mezon/store-mobile';
import { RefObject, memo } from 'react';
import Backdrop from '../../../../../temp-ui/MezonBottomSheet/backdrop';
import { AddMemberBsContent } from './AddMemberBsContent';

interface IAddMemberBSProps {
	memberList?: UsersClanEntity[];
	role?: RolesClanEntity;
	onClose?: () => void;
	bottomSheetRef: RefObject<BottomSheetModal>;
}

export const AddMemberBS = memo((props: IAddMemberBSProps) => {
	const { memberList = [], role, onClose, bottomSheetRef } = props;
	const { themeValue } = useTheme();
	return (
		<BottomSheetModal
			ref={bottomSheetRef}
			snapPoints={['90%']}
			style={{
				borderTopLeftRadius: size.s_14,
				borderTopRightRadius: size.s_14,
				overflow: 'hidden'
			}}
			backdropComponent={Backdrop}
			backgroundStyle={{ backgroundColor: themeValue.primary }}
		>
			<AddMemberBsContent memberList={memberList} role={role} onClose={onClose} />
		</BottomSheetModal>
	);
});
