import { Icons, SpeakerIcon } from '@mezon/mobile-components';
import { Fonts, useTheme } from '@mezon/mobile-ui';
import { selectVoiceChannelAll } from '@mezon/store-mobile';
import { OptionEvent } from '@mezon/utils';
import { memo, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';
import { IMezonOptionData, MezonInput, MezonOption, MezonSelect } from '../../../componentUI';
import MezonButton, { EMezonButtonTheme } from '../../../componentUI/MezonButton2';
import { APP_SCREEN, MenuClanScreenProps } from '../../../navigation/ScreenTypes';
import { style } from './styles';

type CreateEventScreenType = typeof APP_SCREEN.MENU_CLAN.CREATE_EVENT;
export const EventCreatorType = memo(function ({ navigation, route }: MenuClanScreenProps<CreateEventScreenType>) {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const { onGoBack } = route.params || {};

	const { t } = useTranslation(['eventCreator']);
	const voicesChannel = useSelector(selectVoiceChannelAll);

	navigation.setOptions({
		headerTitle: t('screens.eventType.headerTitle'),
		headerTitleStyle: {
			fontSize: Fonts.size.h7,
			color: themeValue.textDisabled
		},
		headerLeft: () => <></>,
		headerRight: () => (
			<TouchableOpacity style={{ marginRight: 20 }} onPress={handleClose}>
				<Icons.CloseLargeIcon height={Fonts.size.s_18} width={Fonts.size.s_18} color={themeValue.textStrong} />
			</TouchableOpacity>
		)
	});

	function handleClose() {
		onGoBack?.();
		navigation.navigate(APP_SCREEN.HOME);
	}

	useEffect(() => {
		return onGoBack?.();
	}, []);

	const options = useMemo(
		() =>
			[
				{
					title: t('fields.channelType.voiceChannel.title'),
					description: t('fields.channelType.voiceChannel.description'),
					value: OptionEvent.OPTION_SPEAKER,
					textStyle: {
						fontWeight: 'bold'
					},
					disabled: !voicesChannel?.length
				},
				{
					title: t('fields.channelType.somewhere.title'),
					description: t('fields.channelType.somewhere.description'),
					value: OptionEvent.OPTION_LOCATION,
					textStyle: {
						fontWeight: 'bold'
					}
				}
			] satisfies IMezonOptionData,
		[]
	);

	const channels = voicesChannel?.map((item) => ({
		title: item.channel_label,
		value: item.channel_id,
		icon: <SpeakerIcon height={20} width={20} color={themeValue.text} />
	}));

	const [eventType, setEventType] = useState<OptionEvent>();
	const [channelID, setChannelID] = useState<string>(channels?.[0]?.value || '');
	const [location, setLocation] = useState<string>('');

	function handleEventTypeChange(value: OptionEvent) {
		setEventType(value);
	}

	function handlePressNext() {
		if (eventType === OptionEvent.OPTION_LOCATION) {
			if (location?.trim()?.length === 0) {
				Toast.show({
					type: 'error',
					text1: t('notify.locationBlank')
				});
				return;
			}
		}

		navigation.navigate(APP_SCREEN.MENU_CLAN.CREATE_EVENT_DETAILS, {
			type: eventType,
			channelId: eventType === OptionEvent.OPTION_SPEAKER ? channelID : null,
			location: eventType === OptionEvent.OPTION_LOCATION ? location : null,
			onGoBack
		});
	}

	function handleChannelIDChange(value: string | number) {
		setChannelID(value as string);
	}

	return (
		<View style={styles.container}>
			<View style={styles.feedSection}>
				<ScrollView>
					<View style={styles.headerSection}>
						<Text style={styles.title}>{t('screens.eventType.title')}</Text>
						<Text style={styles.subtitle}>{t('screens.eventType.subtitle')}</Text>
					</View>

					<MezonOption data={options} onChange={handleEventTypeChange} />

					{eventType && eventType === OptionEvent.OPTION_SPEAKER && !!voicesChannel?.length && (
						<MezonSelect
							prefixIcon={<Icons.VoiceNormalIcon height={20} width={20} color={themeValue.textStrong} />}
							title={t('fields.channel.title')}
							titleUppercase
							onChange={handleChannelIDChange}
							data={channels}
						/>
					)}

					{eventType && eventType === OptionEvent.OPTION_LOCATION && (
						<MezonInput
							onTextChange={setLocation}
							value={location}
							inputWrapperStyle={styles.input}
							label={t('fields.address.title')}
							titleUppercase
							placeHolder={t('fields.address.placeholder')}
						/>
					)}

					<Text style={styles.bottomDescription}>{t('screens.eventType.description')}</Text>
				</ScrollView>
			</View>

			<View style={styles.btnWrapper}>
				<MezonButton
					title={t('actions.next')}
					titleStyle={styles.titleMezonBtn}
					type={EMezonButtonTheme.SUCCESS}
					containerStyle={styles.mezonBtn}
					onPress={handlePressNext}
				/>
			</View>
		</View>
	);
});
