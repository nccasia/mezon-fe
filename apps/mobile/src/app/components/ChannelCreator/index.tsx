import { CrossIcon, Icons } from '@mezon/mobile-components';
import { baseColor, useTheme } from '@mezon/mobile-ui';
import { useAppDispatch } from '@mezon/store';
import { createNewChannel, selectCurrentChannel, selectCurrentClanId } from '@mezon/store-mobile';
import { ChannelType } from 'mezon-js';
import { ApiCreateChannelDescRequest } from 'mezon-js/api.gen';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text } from 'react-native';
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';
import { APP_SCREEN, MenuClanScreenProps } from '../../navigation/ScreenTypes';
import { IMezonMenuSectionProps, MezonInput, MezonMenu, MezonOption, MezonSwitch } from '../../temp-ui';
import { validInput } from '../../utils/validate';
import { style } from './styles';

type CreateChannelScreen = typeof APP_SCREEN.MENU_CLAN.CREATE_CHANNEL;
export default function ChannelCreator({ navigation, route }: MenuClanScreenProps<CreateChannelScreen>) {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const [isChannelPrivate, setChannelPrivate] = useState<boolean>(false);
	const [channelName, setChannelName] = useState<string>('');
	const [channelType, setChannelType] = useState<ChannelType>(ChannelType.CHANNEL_TYPE_TEXT);
	const currentClanId = useSelector(selectCurrentClanId);
	const currentChannel = useSelector(selectCurrentChannel);
	// @ts-ignore
	const { categoryId } = route.params;

	const { t } = useTranslation(['channelCreator']);
	const dispatch = useAppDispatch();

	navigation.setOptions({
		headerRight: () => (
			<Pressable onPress={handleCreateChannel}>
				<Text
					style={{
						color: baseColor.blurple,
						fontWeight: "bold",
						paddingHorizontal: 20,
						opacity: channelName?.trim()?.length > 0 ? 1 : 0.5,
					}}
				>
					{t('actions.create')}
				</Text>
			</Pressable>
		),

		headerLeft: () => (
			<Pressable style={{ padding: 20 }} onPress={handleClose}>
				<CrossIcon height={16} width={16} color={themeValue.text} />
			</Pressable>
		),
	});

	async function handleCreateChannel() {
		if (!validInput(channelName)) return;

		const body: ApiCreateChannelDescRequest = {
			clan_id: currentClanId?.toString(),
			type: channelType,
			channel_label: channelName?.trim(),
			channel_private: isChannelPrivate ? 1 : 0,
			category_id: categoryId || currentChannel.category_id,
		};

		const newChannelCreatedId = await dispatch(createNewChannel(body));
		// @ts-ignore
		const error = newChannelCreatedId.error;

		if (newChannelCreatedId && error) {
			Toast.show({
				type: 'info',
				text1: error.message,
			});
		} else {
			setChannelName('');
			navigation.navigate(APP_SCREEN.HOME);
		}
	}

	function handleClose() {
		navigation.goBack();
	}

	const menuPrivate = useMemo(
		() =>
			[
				{
					bottomDescription:
						channelType === ChannelType.CHANNEL_TYPE_TEXT
							? t('fields.channelPrivate.descriptionText')
							: t('fields.channelPrivate.descriptionVoice'),
					items: [
						{
							title: t('fields.channelPrivate.title'),
							component: <MezonSwitch onValueChange={setChannelPrivate} />,
							icon: <Icons.LockIcon color={themeValue.text} height={20} width={20} />,
						},
					],
				},
			] satisfies IMezonMenuSectionProps[],
		[channelType],
	);

	const channelTypeList = [
		{
			title: t('fields.channelType.text.title'),
			description: t('fields.channelType.text.description'),
			value: ChannelType.CHANNEL_TYPE_TEXT,
		},
		{
			title: t('fields.channelType.voice.title'),
			description: t('fields.channelType.voice.description'),
			value: ChannelType.CHANNEL_TYPE_VOICE,
		},
	];

	function handleChannelTypeChange(value: number) {
		setChannelType(value);
	}

	return (
		<ScrollView contentContainerStyle={styles.container}>
			<MezonInput
				value={channelName}
				onTextChange={setChannelName}
				label={t('fields.channelName.title')}
				errorMessage={t('fields.channelName.errorMessage')}
				placeHolder={t('fields.channelName.placeholder')}
			/>

			<MezonOption title={t('fields.channelType.title')} data={channelTypeList} onChange={handleChannelTypeChange} />

			<MezonMenu menu={menuPrivate} />
		</ScrollView>
	);
}
