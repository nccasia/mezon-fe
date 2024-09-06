import { Icons } from '@mezon/mobile-components';
import { Block, size, Text, useTheme } from '@mezon/mobile-ui';
import { ChannelsEntity } from '@mezon/store-mobile';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, TouchableOpacity } from 'react-native';
import { SeparatorWithLine } from '../../../components/Common';

interface IAdvancedViewProps {
	isAdvancedEditMode: boolean;
	channel: ChannelsEntity;
}

enum EAdvancedPermissionSetting {
	AddRole,
	AddMember
}

export const AdvancedView = memo(({ isAdvancedEditMode, channel }: IAdvancedViewProps) => {
	const { themeValue } = useTheme();
	const { t } = useTranslation('channelSetting');
	const actionList = useMemo(() => {
		return [
			{
				title: t('channelPermission.addRole'),
				type: EAdvancedPermissionSetting.AddRole
			},
			{
				title: t('channelPermission.addMember'),
				type: EAdvancedPermissionSetting.AddMember
			}
		];
	}, [t]);

	const handleAction = (type: EAdvancedPermissionSetting) => {
		//TODO
	};
	return (
		<Block>
			{!isAdvancedEditMode && (
				<Block borderRadius={size.s_14} overflow="hidden" marginTop={size.s_16}>
					<FlatList
						data={actionList}
						keyExtractor={(item) => item.type?.toString()}
						ItemSeparatorComponent={SeparatorWithLine}
						renderItem={({ item }) => {
							const { title, type } = item;
							return (
								<TouchableOpacity onPress={() => handleAction(type)}>
									<Block
										flexDirection="row"
										justifyContent="space-between"
										padding={size.s_14}
										alignItems="center"
										backgroundColor={themeValue.primary}
									>
										<Block flexDirection="row" gap={size.s_14} alignItems="center">
											<Icons.PlusLargeIcon />
											<Text color={themeValue.text}>{title}</Text>
										</Block>
									</Block>
								</TouchableOpacity>
							);
						}}
					/>
				</Block>
			)}

			<Block>
				<Text color={themeValue.textDisabled}>{t('channelPermission.roles')}</Text>
				{/* TODO: list of role */}
			</Block>

			<Block>
				<Text color={themeValue.textDisabled}>{t('channelPermission.members')}</Text>
				{/* TODO: list of member */}
			</Block>
		</Block>
	);
});
