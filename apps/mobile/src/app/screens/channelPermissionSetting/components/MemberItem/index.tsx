import { useAuth, useCheckOwnerForUser } from '@mezon/core';
import { Icons, OwnerIcon } from '@mezon/mobile-components';
import { Block, Colors, Text, size, useTheme } from '@mezon/mobile-ui';
import { channelUsersActions, useAppDispatch } from '@mezon/store-mobile';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity } from 'react-native';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import FastImage from 'react-native-fast-image';
import Toast from 'react-native-toast-message';
import { EOverridePermissionType, ERequestStatus } from '../../types/channelPermission.enum';
import { IMemberItemProps } from '../../types/channelPermission.type';

export const MemberItem = memo(
	({ member, channelId, isCheckbox = false, isChecked = false, onSelectMemberChange, isAdvancedSetting = false, onPress }: IMemberItemProps) => {
		const { userId } = useAuth();
		const [checkClanOwner] = useCheckOwnerForUser();
		const isClanOwner = checkClanOwner(member?.user?.id);
		const { themeValue } = useTheme();
		const dispatch = useAppDispatch();
		const { t } = useTranslation('channelSetting');

		const disabled = useMemo(() => {
			return !isCheckbox && !isAdvancedSetting;
		}, [isCheckbox, isAdvancedSetting]);

		const deleteMember = async () => {
			const body = {
				channelId,
				userId: member?.user?.id
			};
			const response = await dispatch(channelUsersActions.removeChannelUsers(body));
			const isError = response?.meta?.requestStatus === ERequestStatus.Rejected;
			Toast.show({
				type: 'success',
				props: {
					text2: isError ? t('channelPermission.toast.failed') : t('channelPermission.toast.success'),
					leadingIcon: isError ? <Icons.CloseIcon color={Colors.red} /> : <Icons.CheckmarkLargeIcon color={Colors.green} />
				}
			});
		};

		const disableDeleteButton = useMemo(() => {
			return isClanOwner || userId === member?.user?.id;
		}, [isClanOwner, member?.user?.id, userId]);

		const getSuffixIcon = () => {
			if (isCheckbox) {
				return (
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
				);
			}
			if (isAdvancedSetting) {
				return <Icons.ChevronSmallRightIcon color={themeValue.white} />;
			}
			return (
				<TouchableOpacity onPress={deleteMember} disabled={disableDeleteButton}>
					<Icons.CircleXIcon color={disableDeleteButton ? themeValue.textDisabled : themeValue.white} />
				</TouchableOpacity>
			);
		};

		const onPressMemberItem = useCallback(() => {
			if (isAdvancedSetting) {
				onPress && onPress(member?.user?.id, EOverridePermissionType.Member);
				return;
			}
			onSelectMemberChange(!isChecked, member?.user?.id);
		}, [isChecked, member?.user?.id, onSelectMemberChange, isAdvancedSetting, onPress]);

		return (
			<TouchableOpacity onPress={onPressMemberItem} disabled={disabled}>
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
						{!isAdvancedSetting && <Text color={themeValue.textDisabled}>{member?.user?.username}</Text>}
					</Block>
					{getSuffixIcon()}
				</Block>
			</TouchableOpacity>
		);
	}
);
