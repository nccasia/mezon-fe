import { Block } from '@mezon/mobile-ui';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ETypeCustomUserStatus } from '../../screens/profile/ProfileScreen';
import { IMezonOptionData, MezonInput, MezonModal, MezonOption } from '../../temp-ui';
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
	const [statusDuration, setStatusDuration] = useState<string>('');
	const timeOptions = useMemo(() => ([
		{
			title: t('statusDuration.today'),
			value: t('statusDuration.today'),
		},
		{
			title: t('statusDuration.fourHours'),
			value: t('statusDuration.fourHours')
		},
		{
			title: t('statusDuration.oneHour'),
			value: t('statusDuration.oneHour'),
		},
		{
			title: t('statusDuration.thirtyMinutes'),
			value: t('statusDuration.thirtyMinutes'),
		},
		{
			title: t('statusDuration.dontClear'),
			value: t('statusDuration.dontClear'),
		},
	]) as IMezonOptionData, [])

	useEffect(() => {
		setLineStatus(userCustomStatus);
	}, [userCustomStatus]);

	function handleTimeOptionChange(value: string) {
		setStatusDuration(value);
	}

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
				<MezonInput
					value={lineStatus}
					onTextChange={setLineStatus}
					placeHolder={t('placeholder')}
					textarea={true}
					maxCharacter={128}
				/>

				<MezonOption
					title={t('statusDuration.label')}
					value={statusDuration}
					data={timeOptions}
					onChange={handleTimeOptionChange}
				/>
			</Block>
		</MezonModal>
	);
};

export default AddStatusUserModal;
