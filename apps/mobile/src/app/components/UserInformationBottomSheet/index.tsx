import { ActionEmitEvent } from '@mezon/mobile-components';
import { User } from 'mezon-js';
import React, { useEffect, useRef } from 'react';
import { DeviceEventEmitter, View } from 'react-native';
import UserProfile from '../../screens/home/homedrawer/components/UserProfile';
import { MezonBottomSheet } from '../../temp-ui';
import { styles } from './styles';

interface IUserInformationBottomSheetProps {
	userId?: string;
	user?: User;
	onClose: () => void;
}

export const UserInformationBottomSheet = React.memo((props: IUserInformationBottomSheetProps) => {
	const { onClose, userId, user } = props;
	const bottomSheetRef = useRef(null);
	const snapPoints = ['60%'];
	useEffect(() => {
		const showUserInfoBottomSheetListener = DeviceEventEmitter.addListener(ActionEmitEvent.SHOW_INFO_USER_BOTTOM_SHEET, ({ isHiddenBottomSheet }) => {
			isHiddenBottomSheet && bottomSheetRef.current?.close();
		});
		return () => {
			showUserInfoBottomSheetListener.remove();
		}
	}, []);

	useEffect(() => {
		if (bottomSheetRef) {
			if (userId || user) {
				bottomSheetRef.current?.present();
			} else {
				bottomSheetRef.current?.close();
			}
		}
	}, [userId, user]);
	return (
		<MezonBottomSheet
			ref={bottomSheetRef}
			snapPoints={snapPoints}
			heightFitContent={true}
			onDismiss={() => {
				onClose();
			}}
			style={styles.bottomSheet}
			handleComponent={() => {
				return (
					<View style={styles.bottomSheetBarWrapper}>
						<View style={styles.bottomSheetBar} />
					</View>
				);
			}}
		>
			<UserProfile userId={userId} user={user} onClose={() => onClose()}></UserProfile>
		</MezonBottomSheet>
	);
});
