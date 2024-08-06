import { size, useTheme } from '@mezon/mobile-ui';
import { ChannelMembersEntity } from '@mezon/store-mobile';
import { User } from 'mezon-js';
import { useState } from 'react';
import { Keyboard, NativeScrollEvent, NativeSyntheticEvent, ScrollView, View } from 'react-native';
import EmptySearchPage from '../EmptySearchPage';
import MemberItem from '../MemberStatus/MemberItem';
import { UserInformationBottomSheet } from '../UserInformationBottomSheet';
import style from './MembersSearchTab.styles';

type MembersSearchTabProps = {
	listMemberSearch: {
		avatarUser: string;
		displayName: string;
		id: string;
		idDM: string;
		name: string;
		typeChat: number;
		user: User;
	}[];
};
const MembersSearchTab = ({ listMemberSearch }: MembersSearchTabProps) => {
	const [selectedUser, setSelectedUser] = useState<ChannelMembersEntity | null>(null);
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const handleCloseUserInfoBS = () => {
		setSelectedUser(null);
	};

	return (
		<View style={styles.container}>
			{listMemberSearch?.length > 0 ? (
				<ScrollView keyboardDismissMode={'on-drag'}  contentContainerStyle={{ paddingBottom: size.s_50 }} showsVerticalScrollIndicator={false}>
					{
						<View style={styles.boxMembers}>
							{listMemberSearch?.map((user) => (
								<MemberItem
									onPress={(user) => {
										setSelectedUser(user);
									}}
									user={user as any}
									key={user?.user?.id}
								/>
							))}
						</View>
					}
				</ScrollView>
			) : (
				<EmptySearchPage />
			)}
			<UserInformationBottomSheet user={selectedUser?.user} userId={selectedUser?.user?.id} onClose={handleCloseUserInfoBS} />
		</View>
	);
};

export default MembersSearchTab;
