import { debounce } from '@mezon/mobile-components';
import { Block, size, useTheme } from '@mezon/mobile-ui';
import { UsersClanEntity, selectAllUserClans, useAppSelector } from '@mezon/store-mobile';
import { FlashList } from '@shopify/flash-list';
import { memo, useCallback, useMemo, useState } from 'react';
import { MezonInput } from '../../../../temp-ui';
import { normalizeString } from '../../../../utils/helpers';
import { SeparatorWithLine } from '../../../Common';
import { UserItem } from '../UserItem';

interface IMemberListProps {
	onMemberSelect: (memberId: UsersClanEntity) => void;
}

export const MemberList = memo((props: IMemberListProps) => {
	const { onMemberSelect } = props;
	const { themeValue } = useTheme();
	const [searchMemberText, setSearchMemberText] = useState('');
	const debouncedSetSearchText = debounce((text) => setSearchMemberText(text), 300);
	const clanUserList = useAppSelector(selectAllUserClans);

	const filteredMemberList = useMemo(() => {
		if (!clanUserList || clanUserList?.length === 0) {
			return [];
		}
		return clanUserList?.filter((member) => {
			return (
				normalizeString(member.user.display_name).includes(normalizeString(searchMemberText)) ||
				normalizeString(member.user.username).includes(normalizeString(searchMemberText))
			);
		});
	}, [searchMemberText, clanUserList]);

	const renderMemberItem = useCallback(
		({ item }) => {
			return <UserItem userID={item.id} onMemberSelect={onMemberSelect} />;
		},
		[onMemberSelect]
	);

	return (
		<Block backgroundColor={themeValue.secondary} flex={1}>
			<Block paddingHorizontal={size.s_12}>
				<MezonInput onTextChange={debouncedSetSearchText} placeHolder={'Search Member'} />
			</Block>
			<FlashList
				data={filteredMemberList}
				keyExtractor={(item) => item.id}
				ItemSeparatorComponent={SeparatorWithLine}
				renderItem={renderMemberItem}
				estimatedItemSize={180}
				removeClippedSubviews={true}
				keyboardShouldPersistTaps={'handled'}
			/>
		</Block>
	);
});
