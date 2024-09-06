import { useAuth, useCheckOwnerForUser } from '@mezon/core';
import { Icons, OwnerIcon } from '@mezon/mobile-components';
import { Block, Text, size, useTheme } from '@mezon/mobile-ui';
import { ChannelMembersEntity, channelUsersActions, useAppDispatch } from '@mezon/store-mobile';
import { memo, useMemo } from 'react';
import { TouchableOpacity } from 'react-native';

interface IMemberItemProps {
	member: ChannelMembersEntity;
	channelId?: string;
}

export const MemberItem = memo(({ member, channelId }: IMemberItemProps) => {
	const [checkClanOwner] = useCheckOwnerForUser();
	const { userId } = useAuth();
	const isClanOwner = checkClanOwner(member?.user?.id);
	const { themeValue } = useTheme();
	const dispatch = useAppDispatch();

	const deleteMember = async () => {
		const body = {
			channelId,
			userId: member?.user?.id
		};
		await dispatch(channelUsersActions.removeChannelUsers(body));
	};

	const disableDeleteButton = useMemo(() => {
		return isClanOwner || userId === member?.user?.id;
	}, [isClanOwner, member?.user?.id, userId]);

	return (
		<Block key={member?.user?.id} gap={size.s_10} flexDirection="row" padding={size.s_10} alignItems="center">
			<Icons.BravePermission color={themeValue.text} width={size.s_24} height={size.s_24} />
			<Block flex={1}>
				<Block flexDirection="row" gap={size.s_4} alignItems="center">
					<Text h4 color={themeValue.white}>
						{member?.user?.display_name}
					</Text>
					{isClanOwner && <OwnerIcon width={16} height={16} />}
				</Block>
				<Text color={themeValue.textDisabled}>{member?.user?.username}</Text>
			</Block>
			<TouchableOpacity onPress={deleteMember} disabled={disableDeleteButton}>
				<Icons.CircleXIcon color={disableDeleteButton ? themeValue.textDisabled : themeValue.white} />
			</TouchableOpacity>
		</Block>
	);
});
