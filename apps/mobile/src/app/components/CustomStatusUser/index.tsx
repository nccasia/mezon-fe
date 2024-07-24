import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { DisturbStatusIcon, Icons, IdleStatusIcon, OfflineStatus, OnlineStatus } from '@mezon/mobile-components';
import { Block, Colors, size, useTheme } from '@mezon/mobile-ui';
import { Ref, forwardRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, TouchableOpacity } from 'react-native';
import { ETypeCustomUserStatus } from '../../screens/profile/ProfileScreen';
import { MezonBottomSheet } from '../../temp-ui';
import FilterCheckbox from '../NotificationSetting/FilterCheckbox/FilterCheckbox';
import { styles } from './CustomStatusUser.styles';

interface ICustomStatusUserProps {
	onPressSetCustomStatus?: () => void;
	userCustomStatus?: string;
	handleCustomUserStatus?: (customStatus: string, type: ETypeCustomUserStatus) => void;
}
const CustomStatusUser = forwardRef(function CustomStatusUser(props: ICustomStatusUserProps, ref: Ref<BottomSheetModalMethods>) {
	const { onPressSetCustomStatus, userCustomStatus, handleCustomUserStatus } = props;
	const { t } = useTranslation(['customUserStatus']);

	const snapPoints = ['60%'];
	const { themeValue } = useTheme();
	const [userStatusOption, setUserStatusOption] = useState([
		{
			id: 1,
			label: t('userStatus.online'),
			value: t('userStatus.online'),
			isChecked: true,
			icon: <OnlineStatus />,
		},
		{
			id: 2,
			label: t('userStatus.idle'),
			value: t('userStatus.idle'),
			isChecked: false,
			icon: <IdleStatusIcon />,
		},
		{
			id: 3,
			label: t('userStatus.doNotDisturb'),
			value: t('userStatus.doNotDisturb'),
			isChecked: false,
			icon: <DisturbStatusIcon />,
		},
		{
			id: 4,
			label: t('userStatus.invisible'),
			value: t('userStatus.invisible'),
			isChecked: false,
			icon: <OfflineStatus />,
		},
	]);

	const handleRadioBoxPress = (checked: boolean, id: number | string) => {
		setUserStatusOption(userStatusOption.map((item) => item && { ...item, isChecked: item.id === id }));
	};
	return (
		<MezonBottomSheet snapPoints={snapPoints} ref={ref}>
			<Block paddingHorizontal={size.s_20} paddingVertical={size.s_10}>
				<Text style={styles.titleHeader}>{t('changeOnlineStatus')}</Text>
				<Text style={styles.label}>{t('onlineStatus')}</Text>
				<Block borderRadius={size.s_10} overflow="hidden">
					{userStatusOption?.map((option, index) => (
						<FilterCheckbox
							id={option.id}
							label={option.label}
							key={`${index}_${option.value}`}
							isChecked={option.isChecked}
							onCheckboxPress={handleRadioBoxPress}
							customStyles={styles.option}
							leftIcon={option.icon}
						/>
					))}
				</Block>
				<TouchableOpacity style={styles.setCustomStatusBtn} onPress={() => onPressSetCustomStatus()}>
					<Icons.ReactionIcon color={Colors.textGray} />
					<Text style={styles.customStatusText}>{userCustomStatus ? userCustomStatus : t('setCustomStatus')}</Text>
					{userCustomStatus ? (
						<Pressable onPress={() => handleCustomUserStatus('', ETypeCustomUserStatus.Close)}>
							<Icons.CloseIcon color={themeValue.textStrong} />
						</Pressable>
					) : null}
				</TouchableOpacity>
			</Block>
		</MezonBottomSheet>
	);
});

export default CustomStatusUser;
