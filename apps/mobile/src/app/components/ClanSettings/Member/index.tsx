import { Block, useTheme } from '@mezon/mobile-ui';
import { UsersClanEntity } from '@mezon/utils';
import { useCallback, useState } from 'react';
import { KeyboardAvoidingView } from 'react-native';
import { APP_SCREEN, MenuClanScreenProps } from '../../../navigation/ScreenTypes';
import UserSettingProfile from '../../../screens/home/homedrawer/components/UserProfile/component/UserSettingProfile';
import { MemberList } from './MemberList';

type MemberClanScreen = typeof APP_SCREEN.MENU_CLAN.MEMBER_SETTING;
export default function MemberSetting({ navigation }: MenuClanScreenProps<MemberClanScreen>) {
	const [selectedMember, setSelectedMember] = useState<UsersClanEntity | null>(null);
	const { themeValue } = useTheme();
	const onMemberSelect = useCallback((member: UsersClanEntity) => {
		setSelectedMember(member);
	}, []);

	const onShowManagementUserModalChange = useCallback((value: boolean) => {
		if (!value) {
			setSelectedMember(null);
		}
	}, []);

	return (
		<KeyboardAvoidingView style={{ flex: 1 }}>
			<Block flex={1} backgroundColor={themeValue.secondary}>
				<MemberList onMemberSelect={onMemberSelect} />

				<UserSettingProfile
					user={selectedMember}
					showManagementUserModal={selectedMember !== null}
					showActionOutside={false}
					onShowManagementUserModalChange={onShowManagementUserModalChange}
				/>
			</Block>
		</KeyboardAvoidingView>
	);
}
