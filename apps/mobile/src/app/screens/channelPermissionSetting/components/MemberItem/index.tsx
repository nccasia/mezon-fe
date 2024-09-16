import { useAuth, useCheckOwnerForUser } from '@mezon/core';
import { Icons, OwnerIcon } from '@mezon/mobile-components';
import { Block, Colors, Text, size, useTheme } from '@mezon/mobile-ui';
import { channelUsersActions, useAppDispatch } from '@mezon/store-mobile';
import { memo, useMemo } from 'react';
import { TouchableOpacity } from 'react-native';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import FastImage from 'react-native-fast-image';
import { IMemberItemProps } from '../../types/channelPermission.type';

export const MemberItem = memo(({ member, channelId, isCheckbox = false, isChecked = false, onSelectMemberChange }: IMemberItemProps) => {
	const { userId } = useAuth();
	const [checkClanOwner] = useCheckOwnerForUser();
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
		<TouchableOpacity onPress={() => onSelectMemberChange(!isChecked, member?.user?.id)} disabled={!isCheckbox}>
			<Block gap={size.s_10} flexDirection="row" padding={size.s_10} alignItems="center">
				<FastImage
					source={{ uri: member?.user?.avatar_url }}
					resizeMode="cover"
					style={{ width: size.s_40, height: size.s_40, borderRadius: 50 }}
				/>
				<Block flex={1}>
					<Block flexDirection="row" gap={size.s_4} alignItems="center">
						<Text h4 color={themeValue.white}>
							{member?.user?.display_name}
						</Text>
						{isClanOwner && <OwnerIcon width={16} height={16} />}
					</Block>
					<Text color={themeValue.textDisabled}>{member?.user?.username}</Text>
				</Block>
				{isCheckbox ? (
					<Block height={size.s_20} width={size.s_20}>
						<BouncyCheckbox
							size={20}
							isChecked={isChecked}
							onPress={(value) => onSelectMemberChange(value, member?.user?.id)}
							fillColor={Colors.bgButton}
							iconStyle={{ borderRadius: 5 }}
							innerIconStyle={{
								borderWidth: 1.5,
								borderColor: isChecked ? Colors.bgButton : Colors.tertiary,
								borderRadius: 5
							}}
						/>
					</Block>
				) : (
					<TouchableOpacity onPress={deleteMember} disabled={disableDeleteButton}>
						<Icons.CircleXIcon color={disableDeleteButton ? themeValue.textDisabled : themeValue.white} />
					</TouchableOpacity>
				)}
			</Block>
		</TouchableOpacity>
	);
});
