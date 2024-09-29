import { BellIcon, CheckIcon, Icons, isEqual, LinkIcon, TrashIcon } from '@mezon/mobile-components';
import { Colors, useTheme } from '@mezon/mobile-ui';
import { channelsActions, selectChannelById, useAppDispatch } from '@mezon/store-mobile';
import { DrawerActions } from '@react-navigation/native';
import { ApiUpdateChannelDescRequest } from 'mezon-js';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';
import { APP_SCREEN, MenuChannelScreenProps } from '../../navigation/ScreenTypes';
import { IMezonMenuItemProps, IMezonMenuSectionProps, IMezonOptionData, MezonConfirm, MezonInput, MezonMenu, MezonOption } from '../../temp-ui';
import MezonSlider, { IMezonSliderData } from '../../temp-ui/MezonSlider';
import { validInput } from '../../utils/validate';
import { style } from './styles';

interface IChannelSettingValue {
	channelName: string;
	channelTopic: string;
	//TODO: update more
}

type ScreenChannelSetting = typeof APP_SCREEN.MENU_CHANNEL.SETTINGS;
export default function ChannelSetting({ navigation, route }: MenuChannelScreenProps<ScreenChannelSetting>) {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const { channelId } = route.params;
	const { t } = useTranslation(['channelSetting']);
	const { t: t1 } = useTranslation(['screenStack']);
	const dispatch = useAppDispatch();
	const channel = useSelector(selectChannelById(channelId || ''));
	const isChannel = useMemo(() => channel?.parrent_id === '0', [channel?.parrent_id]);
	const [isVisibleDeleteChannelModal, setIsVisibleDeleteChannelModal] = useState<boolean>(false);
	const [isCheckValid, setIsCheckValid] = useState<boolean>(true);
	const [originSettingValue, setOriginSettingValue] = useState<IChannelSettingValue>({
		channelName: '',
		channelTopic: ''
	});
	const [currentSettingValue, setCurrentSettingValue] = useState<IChannelSettingValue>({
		channelName: '',
		channelTopic: ''
	});
	const isNotChanged = useMemo(() => {
		return isEqual(originSettingValue, currentSettingValue);
	}, [originSettingValue, currentSettingValue]);

	const currentCategoryName = useMemo(() => {
		return channel?.category_name
	}, [channel?.category_name])

	navigation.setOptions({
		headerTitle: isChannel ? t1('menuChannelStack.channelSetting') : t1('menuChannelStack.threadSetting'),
		headerRight: () => (
			<Pressable onPress={() => handleSaveChannelSetting()}>
				<Text style={[styles.saveChangeButton, !isNotChanged ? styles.changed : styles.notChange]}>{t('confirm.save')}</Text>
			</Pressable>
		)
	});

	const handleUpdateValue = (value: Partial<IChannelSettingValue>) => {
		setCurrentSettingValue({ ...currentSettingValue, ...value });
	};

	useEffect(() => {
		if (channel?.channel_id) {
			const initialChannelSettingValue: IChannelSettingValue = {
				channelName: channel?.channel_label,
				channelTopic: ''
			};
			setOriginSettingValue(initialChannelSettingValue);
			setCurrentSettingValue(initialChannelSettingValue);
		}
	}, [channel]);

	useEffect(() => {
		setIsCheckValid(validInput(currentSettingValue?.channelName));
	}, [currentSettingValue?.channelName]);

	const handleSaveChannelSetting = async () => {
		const updateChannel: ApiUpdateChannelDescRequest = {
			channel_id: channel.channel_id || '',
			channel_label: currentSettingValue?.channelName,
			category_id: channel.category_id
		};
		await dispatch(channelsActions.updateChannel(updateChannel));
		navigation?.goBack();
		Toast.show({
			type: 'success',
			props: {
				text2: t('toast.updated'),
				leadingIcon: <CheckIcon color={Colors.green} />
			}
		});
	};

	const categoryMenu = useMemo(
		() =>
			[
				{
					title: isChannel ? t('fields.channelCategory.title') : t('fields.ThreadCategory.title'),
					expandable: true,
					previewValue: currentCategoryName,
					icon: <Icons.FolderPlusIcon color={themeValue.text} />,
					isShow: isChannel,
					onPress: () => {
						navigation.navigate(APP_SCREEN.MENU_CHANNEL.STACK, {
							screen: APP_SCREEN.MENU_CHANNEL.CHANGE_CATEGORY,
							params: {
								channel
							}
						});
					}
				}
			] satisfies IMezonMenuItemProps[],
		[currentCategoryName]
	);

	const permissionMenu = useMemo(
		() =>
			[
				{
					title: t('fields.channelPermission.permission'),
					expandable: true,
					icon: <Icons.BravePermission color={themeValue.text} />,
					isShow: isChannel,
					onPress: () => {
						navigation.navigate(APP_SCREEN.MENU_CHANNEL.STACK, {
							screen: APP_SCREEN.MENU_CHANNEL.CHANNEL_PERMISSION,
							params: {
								channelId
							}
						});
					}
				}
			] satisfies IMezonMenuItemProps[],
		[]
	);

	const notificationMenu = useMemo(
		() =>
			[
				{
					title: t('fields.channelNotifications.notification'),
					expandable: true,
					icon: <BellIcon color={themeValue.text} />
				},
				{
					title: t('fields.channelNotifications.pinned'),
					expandable: true,
					icon: <Icons.PinIcon color={themeValue.text} />
				},
				{
					title: t('fields.channelNotifications.invite'),
					expandable: true,
					icon: <LinkIcon color={themeValue.text} />
				}
			] satisfies IMezonMenuItemProps[],
		[]
	);

	const webhookMenu = useMemo(
		() =>
			[
				{
					title: t('fields.channelWebhooks.webhook'),
					expandable: true,
					icon: <Icons.WebhookIcon color={themeValue.text} />,
					isShow: isChannel
				}
			] satisfies IMezonMenuItemProps[],
		[]
	);

	const deleteMenu = useMemo(
		() =>
			[
				{
					title: isChannel ? t('fields.channelDelete.delete') : t('fields.threadDelete.delete'),
					textStyle: { color: 'red' },
					onPress: () => handlePressDeleteChannel(),
					icon: <TrashIcon color="red" />
				}
			] satisfies IMezonMenuItemProps[],
		[]
	);

	const topMenu = useMemo(
		() =>
			[
				{ items: categoryMenu },
				{
					items: permissionMenu,
					bottomDescription: t('fields.channelPermission.description')
				},
				{
					items: notificationMenu,
					bottomDescription: ''
				}
			] satisfies IMezonMenuSectionProps[],
		[currentCategoryName]
	);

	const bottomMenu = useMemo(() => [{ items: webhookMenu }, { items: deleteMenu }] satisfies IMezonMenuSectionProps[], []);

	const hideInactiveOptions = useMemo(
		() =>
			[
				{
					title: t('fields.channelHideInactivity._1hour'),
					value: 0
				},
				{
					title: t('fields.channelHideInactivity._24hours'),
					value: 1
				},
				{
					title: t('fields.channelHideInactivity._3days'),
					value: 2
				},
				{
					title: t('fields.channelHideInactivity._1Week'),
					value: 3
				}
			] satisfies IMezonOptionData,
		[]
	);

	const slowModeOptions = useMemo(
		() =>
			[
				{
					value: 0,
					name: t('fields.channelSlowMode.slowModeOff')
				},
				{
					value: 1,
					name: t('fields.channelSlowMode._5seconds')
				},
				{
					value: 2,
					name: t('fields.channelSlowMode._10seconds')
				},
				{
					value: 3,
					name: t('fields.channelSlowMode._15seconds')
				},
				{
					value: 4,
					name: t('fields.channelSlowMode._30seconds')
				},
				{
					value: 5,
					name: t('fields.channelSlowMode._1minute')
				},
				{
					value: 6,
					name: t('fields.channelSlowMode._1minute')
				},
				{
					value: 7,
					name: t('fields.channelSlowMode._2minutes')
				},
				{
					value: 8,
					name: t('fields.channelSlowMode._5minutes')
				},
				{
					value: 9,
					name: t('fields.channelSlowMode._10minutes')
				},
				{
					value: 10,
					name: t('fields.channelSlowMode._15minutes')
				},
				{
					value: 11,
					name: t('fields.channelSlowMode._30minutes')
				},
				{
					value: 12,
					name: t('fields.channelSlowMode._1hour')
				},
				{
					value: 13,
					name: t('fields.channelSlowMode._2hours')
				},
				{
					value: 14,
					name: t('fields.channelSlowMode._6hours')
				}
			] satisfies IMezonSliderData,
		[]
	);

	const handleDeleteChannel = async () => {
		await dispatch(
			channelsActions.deleteChannel({
				channelId: channel?.channel_id,
				clanId: channel?.clan_id
			})
		);
		navigation.navigate(APP_SCREEN.HOME);
		navigation.dispatch(DrawerActions.openDrawer());
	};

	const handleDeleteModalVisibleChange = (visible: boolean) => {
		setIsVisibleDeleteChannelModal(visible);
	};

	const handlePressDeleteChannel = () => {
		setIsVisibleDeleteChannelModal(true);
	};

	return (
		<ScrollView style={styles.container}>
			<View style={styles.inputWrapper}>
				<MezonInput
					label={t('fields.channelName.title')}
					value={currentSettingValue.channelName}
					onTextChange={(text) => handleUpdateValue({ channelName: text })}
					maxCharacter={64}
					errorMessage={t('fields.channelName.errorMessage')}
					placeHolder={t('fields.channelName.placeholder')}
					isValid={isCheckValid}
				/>

				{isChannel && (
					<MezonInput
						label={t('fields.channelDescription.title')}
						value={currentSettingValue.channelTopic}
						onTextChange={(text) => handleUpdateValue({ channelTopic: text })}
						textarea
					/>
				)}
			</View>

			<MezonMenu menu={topMenu} />

			<MezonSlider data={slowModeOptions} title={t('fields.channelSlowMode.title')} />

			<MezonOption
				title={t('fields.channelHideInactivity.title')}
				data={hideInactiveOptions}
				bottomDescription={t('fields.channelHideInactivity.description')}
			/>

			<MezonMenu menu={bottomMenu} />

			<MezonConfirm
				visible={isVisibleDeleteChannelModal}
				onVisibleChange={handleDeleteModalVisibleChange}
				onConfirm={handleDeleteChannel}
				title={t('confirm.delete.title')}
				confirmText={t('confirm.delete.confirmText')}
				content={t('confirm.delete.content', {
					channelName: channel?.channel_label
				})}
			/>
		</ScrollView>
	);
}
