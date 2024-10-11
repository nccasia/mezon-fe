import { TouchableOpacity } from '@gorhom/bottom-sheet';
import { Icons } from '@mezon/mobile-components';
import { Block, size, useTheme } from '@mezon/mobile-ui';
import { selectMemberClanByUserId } from '@mezon/store-mobile';
import { useNavigation } from '@react-navigation/native';
import { ApiWebhook } from 'mezon-js/api.gen';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Text } from 'react-native';
import { useSelector } from 'react-redux';
import { APP_SCREEN } from '../../../../../navigation/ScreenTypes';
import { style } from './styles';

export function WebhooksItem({ webhook }: { webhook: ApiWebhook }) {
	const { themeValue } = useTheme();
	const navigation = useNavigation<any>();
	const { t } = useTranslation(['clanIntegrationsSetting']);

	const styles = style(themeValue);
	const convertDate = (isoDateString: string): string => {
		const date = new Date(isoDateString);
		const options: Intl.DateTimeFormatOptions = {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		};
		return date.toLocaleDateString('en-GB', options);
	};
	const webhookOwner = useSelector(selectMemberClanByUserId(webhook.creator_id as string));
	const handleEditWebhooks = () => {
		navigation.navigate(APP_SCREEN.MENU_CLAN.WEBHOOKS_EDIT, {
			webhook
		});
	};
	return (
		<TouchableOpacity onPress={handleEditWebhooks}>
			<Block
				flexDirection="row"
				alignItems="center"
				backgroundColor={themeValue.secondaryWeight}
				paddingHorizontal={size.s_20}
				paddingVertical={size.s_10}
				gap={size.s_10}
				borderRadius={size.s_10}
				marginBottom={size.s_10}
			>
				<Image
					style={styles.image}
					source={{
						uri: webhook?.avatar
					}}
				/>
				<Block flex={1}>
					<Text style={styles.name}>{webhook?.webhook_name}</Text>
					<Text style={styles.textTime}>
						{t('webhooksItem.createdBy', {
							webhookCreateTime: convertDate(webhook.create_time || ''),
							webhookUserOwnerName: webhookOwner?.user?.username
						})}
					</Text>
				</Block>
				<Icons.ChevronSmallRightIcon />
			</Block>
		</TouchableOpacity>
	);
}
