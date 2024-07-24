import { Block, size } from '@mezon/mobile-ui';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text } from 'react-native';
import { ETypeCustomUserStatus } from '../../screens/profile/ProfileScreen';
import { MezonInput, MezonModal } from '../../temp-ui';
import FilterCheckbox from '../NotificationSetting/FilterCheckbox/FilterCheckbox';
import { styles } from './AddStatusUserModal.styles';

export interface IAddStatusUserModalProps {
	isVisible: boolean;
	setIsVisible: (value: boolean) => void;
	userCustomStatus: string;
	handleCustomUserStatus?: (customStatus: string, type: ETypeCustomUserStatus) => void;
}

const AddStatusUserModal = ({ isVisible, setIsVisible, userCustomStatus, handleCustomUserStatus }: IAddStatusUserModalProps) => {
	const [lineStatus, setLineStatus] = useState<string>('');
	const { t } = useTranslation(['customUserStatus']);

	const [statusDurationOption, setStatusDurationOption] = useState([
		{
			id: 1,
			label: t('statusDuration.today'),
			value: t('statusDuration.today'),
			isChecked: true,
		},
		{
			id: 2,
			label: t('statusDuration.fourHours'),
			value: t('statusDuration.fourHours'),
			isChecked: false,
		},
		{
			id: 3,
			label: t('statusDuration.oneHour'),
			value: t('statusDuration.oneHour'),
			isChecked: false,
		},
		{
			id: 4,
			label: t('statusDuration.thirtyMinutes'),
			value: t('statusDuration.thirtyMinutes'),
			isChecked: false,
		},
		{
			id: 5,
			label: t('statusDuration.dontClear'),
			value: t('statusDuration.dontClear'),
			isChecked: false,
		},
	]);

	useEffect(() => {
		setLineStatus(userCustomStatus);
	}, [userCustomStatus]);

	const handleRadioBoxPress = (checked: boolean, id: number | string) => {
		setStatusDurationOption(statusDurationOption.map((item) => item && { ...item, isChecked: item.id === id }));
	};

	return (
		<MezonModal
			visible={isVisible}
			title={t('editStatus')}
			visibleChange={setIsVisible}
			headerStyles={styles.headerModal}
			rightBtnText={t('save')}
			onClickRightBtn={() => {
				handleCustomUserStatus(lineStatus, ETypeCustomUserStatus.Save);
			}}
		>
			<Block>
				<MezonInput value={lineStatus} onTextChange={setLineStatus} placeHolder={t('placeholder')} textarea={true} maxCharacter={128} />
				<Text style={styles.durationText}>{t('statusDuration.label')}</Text>
				<Block borderRadius={size.s_10} overflow={'hidden'}>
					{statusDurationOption?.map((option, index) => (
						<FilterCheckbox
							id={option.id}
							label={option.label}
							key={`${index}_${option.value}`}
							isChecked={option.isChecked}
							onCheckboxPress={handleRadioBoxPress}
							customStyles={styles.option}
						/>
					))}
				</Block>
			</Block>
		</MezonModal>
	);
};

export default AddStatusUserModal;
