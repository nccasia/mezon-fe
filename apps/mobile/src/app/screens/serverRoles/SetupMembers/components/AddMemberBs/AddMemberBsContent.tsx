import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { useRoles } from '@mezon/core';
import { CheckIcon, CloseIcon, debounce } from '@mezon/mobile-components';
import { Block, Colors, Text, size, useTheme } from '@mezon/mobile-ui';
import { RolesClanEntity, UsersClanEntity } from '@mezon/store-mobile';
import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity } from 'react-native';
import Toast from 'react-native-toast-message';
import { MezonInput } from '../../../../../temp-ui';
import { normalizeString } from '../../../../../utils/helpers';
import { MemberItem } from '../MemberItem';

interface IAddMemberBsContentProps {
	memberList?: UsersClanEntity[];
	role?: RolesClanEntity;
	onClose?: () => void;
}

export const AddMemberBsContent = memo((props: IAddMemberBsContentProps) => {
	const { memberList = [], role, onClose } = props;
	const { themeValue } = useTheme();
	const { updateRole } = useRoles();
	const { t } = useTranslation('clanRoles');
	const [searchMemberText, setSearchMemberText] = useState('');
	const debouncedSetSearchText = debounce((text) => setSearchMemberText(text), 300);
	const [selectedMemberIdList, setSelectedMemberIdList] = useState<string[]>([]);

	const filteredMemberList = useMemo(() => {
		return memberList?.filter(
			(it) =>
				normalizeString(it?.user?.display_name).includes(normalizeString(searchMemberText)) ||
				normalizeString(it?.user?.username).includes(normalizeString(searchMemberText)) ||
				normalizeString(it?.clan_nick).includes(normalizeString(searchMemberText))
		);
	}, [searchMemberText, memberList]);

	const onSelectChange = useCallback(
		(value: boolean, memberId: string) => {
			const uniqueMemberIds = new Set(selectedMemberIdList);
			if (value) {
				uniqueMemberIds.add(memberId);
				setSelectedMemberIdList([...uniqueMemberIds]);
				return;
			}
			uniqueMemberIds.delete(memberId);
			setSelectedMemberIdList([...uniqueMemberIds]);
		},
		[selectedMemberIdList]
	);

	const handleAddMemberToRole = useCallback(async () => {
		const response = await updateRole(role?.clan_id, role?.id, role?.title, selectedMemberIdList, [], [], []);
		onClose && onClose();
		if (response) {
			Toast.show({
				type: 'success',
				props: {
					text2: t('setupMember.addedMember'),
					leadingIcon: <CheckIcon color={Colors.green} width={20} height={20} />
				}
			});
		} else {
			Toast.show({
				type: 'success',
				props: {
					text2: t('failed'),
					leadingIcon: <CloseIcon color={Colors.red} width={20} height={20} />
				}
			});
		}
	}, [role?.clan_id, role?.id, role?.title, selectedMemberIdList, updateRole, onClose, t]);

	return (
		<Block flex={1} paddingHorizontal={size.s_15}>
			<Block marginBottom={size.s_14}>
				<Text center color={themeValue.white} h3>
					{t('setupMember.addMember')}
				</Text>
				<Text center color={themeValue.text}>
					{role?.title}
				</Text>
				{selectedMemberIdList?.length ? (
					<Block position="absolute" right={0}>
						<TouchableOpacity onPress={handleAddMemberToRole} style={{ padding: size.s_6 }}>
							<Text color={Colors.textViolet} h5>
								{t('setupMember.add')}
							</Text>
						</TouchableOpacity>
					</Block>
				) : null}
			</Block>
			<MezonInput onTextChange={debouncedSetSearchText} placeHolder={t('setupMember.searchMembers')} />
			{filteredMemberList?.length ? (
				<BottomSheetFlatList
					data={filteredMemberList}
					keyExtractor={(item) => item.id}
					renderItem={({ item }) => {
						return (
							<MemberItem
								member={item}
								isSelectMode={true}
								onSelectChange={onSelectChange}
								isSelected={selectedMemberIdList?.includes(item.id)}
								role={role}
							/>
						);
					}}
				/>
			) : (
				<Block>
					<Text center color={themeValue.text}>
						{t('setupMember.noMembersFound')}
					</Text>
				</Block>
			)}
		</Block>
	);
});
