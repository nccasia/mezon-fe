import { CrossIcon, getUpdateOrAddClanChannelCache, Icons, save, STORAGE_DATA_CLAN_CHANNEL_CACHE } from '@mezon/mobile-components';
import { baseColor, size, useTheme } from '@mezon/mobile-ui';
import { appActions, useAppDispatch } from '@mezon/store';
import { channelsActions, createNewChannel, getStoreAsync, selectCurrentChannel, selectCurrentClanId } from '@mezon/store-mobile';
import { DrawerActions } from '@react-navigation/native';
import { ChannelType } from 'mezon-js';
import { ApiCreateChannelDescRequest } from 'mezon-js/api.gen';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';
import { IMezonMenuSectionProps, MezonInput, MezonMenu, MezonOption, MezonSwitch } from '../../componentUI';
import { APP_SCREEN, MenuClanScreenProps } from '../../navigation/ScreenTypes';
import { validInput } from '../../utils/validate';
import { style } from './styles';

type CreateChannelScreen = typeof APP_SCREEN.MENU_CLAN.CREATE_CHANNEL;
export function ChannelCreator({ navigation, route }: MenuClanScreenProps<CreateChannelScreen>) {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const [isChannelPrivate, setChannelPrivate] = useState<boolean>(false);
	const [channelName, setChannelName] = useState<string>('');
	const [channelType, setChannelType] = useState<ChannelType>(ChannelType.CHANNEL_TYPE_TEXT);
	const currentClanId = useSelector(selectCurrentClanId);
	const currentChannel = useSelector(selectCurrentChannel);
	const { categoryId } = route.params;

	const { t } = useTranslation(['channelCreator']);
	const dispatch = useAppDispatch();

	navigation.setOptions({
		headerRight: () => (
			<Pressable onPress={handleCreateChannel}>
				<Text
					style={{
						color: baseColor.blurple,
						fontWeight: 'bold',
						paddingHorizontal: size.s_20,
						opacity: channelName?.trim()?.length > 0 ? 1 : 0.5
					}}
				>
					{t('actions.create')}
				</Text>
			</Pressable>
		),

		headerLeft: () => (
			<Pressable style={{ padding: size.s_20 }} onPress={handleClose}>
				<CrossIcon height={size.s_16} width={size.s_16} color={themeValue.text} />
			</Pressable>
		)
	});

	async function handleCreateChannel() {
		if (!validInput(channelName)) return;
		const store = await getStoreAsync();

		const body: ApiCreateChannelDescRequest = {
			clan_id: currentClanId?.toString(),
			type: channelType,
			channel_label: channelName?.trim(),
			channel_private: isChannelPrivate ? 1 : 0,
			category_id: categoryId || currentChannel.category_id
		};
		dispatch(appActions.setLoadingMainMobile(true));
		const newChannelCreatedId = await dispatch(createNewChannel(body));
		const payload = newChannelCreatedId.payload as ApiCreateChannelDescRequest;
		const channelID = payload.channel_id;
		const clanID = payload.clan_id;

		const error = (newChannelCreatedId as any).error;
		if (newChannelCreatedId && error) {
			Toast.show({
				type: 'info',
				text1: t('fields.channelName.duplicateChannelName')
			});
			dispatch(appActions.setLoadingMainMobile(false));
			return;
		}

		if (newChannelCreatedId && channelType !== ChannelType.CHANNEL_TYPE_VOICE && channelType !== ChannelType.CHANNEL_TYPE_STREAMING) {
			navigation.navigate(APP_SCREEN.HOME_DEFAULT);
			navigation.dispatch(DrawerActions.closeDrawer());
			requestAnimationFrame(async () => {
				await store.dispatch(channelsActions.joinChannel({ clanId: clanID ?? '', channelId: channelID, noFetchMembers: false }));
			});
			const dataSave = getUpdateOrAddClanChannelCache(clanID, channelID);
			save(STORAGE_DATA_CLAN_CHANNEL_CACHE, dataSave);
		} else {
			navigation.navigate(APP_SCREEN.HOME);
		}
		setChannelName('');
		dispatch(appActions.setLoadingMainMobile(false));
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
							icon: <Icons.LockIcon color={themeValue.text} height={size.s_20} width={size.s_20} />
						}
					]
				}
			] satisfies IMezonMenuSectionProps[],
		[channelType]
	);

	const channelTypeList = [
		{
			title: t('fields.channelType.text.title'),
			description: t('fields.channelType.text.description'),
			value: ChannelType.CHANNEL_TYPE_TEXT,
			icon: <Icons.TextIcon height={size.s_20} width={size.s_20} color={themeValue.textStrong} />
		},
		{
			title: t('fields.channelType.voice.title'),
			description: t('fields.channelType.voice.description'),
			value: ChannelType.CHANNEL_TYPE_VOICE,
			icon: <Icons.VoiceNormalIcon height={size.s_20} width={size.s_20} color={themeValue.textStrong} />
		},
		{
			title: t('fields.channelType.stream.title'),
			description: t('fields.channelType.stream.description'),
			value: ChannelType.CHANNEL_TYPE_STREAMING,
			icon: <Icons.StreamIcon height={size.s_20} width={size.s_20} color={themeValue.textStrong} />
		}
	];

	function handleChannelTypeChange(value: number) {
		setChannelType(value);
	}

	return (
		<View style={styles.wrapper}>
			<ScrollView contentContainerStyle={styles.container}>
				<MezonInput
					value={channelName}
					maxCharacter={64}
					onTextChange={setChannelName}
					label={t('fields.channelName.title')}
					errorMessage={t('fields.channelName.errorMessage')}
					placeHolder={t('fields.channelName.placeholder')}
				/>

				<MezonOption title={t('fields.channelType.title')} data={channelTypeList} onChange={handleChannelTypeChange} value={channelType} />

				{channelType === ChannelType.CHANNEL_TYPE_TEXT && <MezonMenu menu={menuPrivate} />}
			</ScrollView>
		</View>
	);
}
