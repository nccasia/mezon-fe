import { useTheme } from '@mezon/mobile-ui';
import { ChannelMembersEntity } from '@mezon/store-mobile';
import { FlashList } from '@shopify/flash-list';
import { useState } from 'react';
import { Keyboard, View } from 'react-native';
import { EmptySearchPage } from '../EmptySearchPage';
import { MemberItem } from '../MemberStatus/MemberItem';
import { UserInformationBottomSheet } from '../UserInformationBottomSheet';
import style from './MembersSearchTab.styles';

type MembersSearchTabProps = {
	listMemberSearch: any;
};
const MembersSearchTab = ({ listMemberSearch }: MembersSearchTabProps) => {
	const [selectedUser, setSelectedUser] = useState<ChannelMembersEntity | null>(null);
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const handleCloseUserInfoBS = () => {
		setSelectedUser(null);
	};

	return (
		<View style={[styles.container, { backgroundColor: listMemberSearch?.length > 0 ? themeValue.primary : themeValue.secondary }]}>
			{listMemberSearch?.length > 0 ? (
				<View style={styles.boxMembers}>
					<FlashList
						showsVerticalScrollIndicator={false}
						data={listMemberSearch}
						keyboardShouldPersistTaps={'handled'}
						onScrollBeginDrag={Keyboard.dismiss}
						renderItem={({ item, index }) => (
							<MemberItem
								onPress={(user) => {
									setSelectedUser(user);
								}}
								user={item as any}
								key={`${item?.['id']}_member_search_${index}}`}
							/>
						)}
						estimatedItemSize={100}
						removeClippedSubviews={true}
					/>
				</View>
			) : (
				<EmptySearchPage />
			)}
			<UserInformationBottomSheet
				user={selectedUser?.user || selectedUser}
				userId={selectedUser?.user?.id || selectedUser?.id}
				onClose={handleCloseUserInfoBS}
			/>
		</View>
	);
};

export default MembersSearchTab;
