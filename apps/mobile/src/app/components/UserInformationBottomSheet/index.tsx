import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { styles } from './styles';
import BottomSheet from 'react-native-raw-bottom-sheet';
import UserProfile from '../../screens/home/homedrawer/components/UserProfile';
import { User } from 'mezon-js';

interface IUserInformationBottomSheetProps {
    userId?: string;
    user?: User;
    onClose: () => void
}

export const UserInformationBottomSheet = React.memo((props: IUserInformationBottomSheetProps) => {
    const { onClose, userId, user } = props;
    const ref = useRef(null);

    useEffect(() => {
		if (ref) {
			if (userId || user) {
				ref.current?.open();
			} else {
				ref.current?.close();
			}
		}
	}, [userId, user]);
    
    return (
        <BottomSheet
            ref={ref}
            height={500}
            onClose={() => onClose()}
            draggable
            customStyles={{
                container: {
                    backgroundColor: 'transparent',
                },
            }}
        >
            <View style={styles.container}>
                <UserProfile userId={userId} user={user} onClose={() => onClose()}></UserProfile>
            </View>
        </BottomSheet>
    )
})