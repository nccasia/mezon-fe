import { MuteIcon, SettingIcon } from '@mezon/mobile-components';
import { Colors } from '@mezon/mobile-ui';
import { ChannelsEntity } from '@mezon/store-mobile';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import MezonToggleButton from '../../../temp-ui/MezonToggleButton';
import { EActionDataNotify } from '../types';
import { styles as s } from './NotificationOption.styles';
interface INotificationOptionProps {
	onChange: (value: EActionDataNotify) => void;
	channels: ChannelsEntity[];
}
const NotificationOption = ({ onChange, channels } : INotificationOptionProps) => {
	const { t } = useTranslation(['notification']);
	const tabDataNotify = [
		{ id: 1, title: t('tabNotify.forYou'), value: 'individual', icon: <Text style={s.icon}>@</Text> },
		{ id: 2, title: t('tabNotify.mention'), value: 'mention', icon: <MuteIcon width={22} height={22} /> },
	];
	const [selectedTabs, setSelectedTabs] = useState({ individual: true, mention: false });

	const handleTabChange = (value, isSelected) => {
		setSelectedTabs((prevState) => ({
			...prevState,
			[value]: isSelected,
		}));
	};

	useEffect(() => {
		setSelectedTabs({ individual: true, mention: false });
	}, [channels]);

	const calculateValue = () => {
		return selectedTabs.individual && selectedTabs.mention
			? EActionDataNotify.All
			: selectedTabs.individual
				? EActionDataNotify.Individual
				: selectedTabs.mention
					? EActionDataNotify.Mention
					: null;
	};

	useEffect(() => {
		const value = calculateValue();
		onChange(value);
	}, [selectedTabs]);

	return (
		<View style={s.wrapperOption}>
			<Text style={s.headerTitle}>{t('headerTitle')}</Text>
			<View style={s.optionContainer}>
				{tabDataNotify.map((option) => (
					<View key={option.id} style={s.option}>
						{option.icon}
						<Text style={s.textOption}>{option.title}</Text>
						<MezonToggleButton
							onChange={(isSelected) => handleTabChange(option.value, isSelected)}
							height={30}
							width={60}
							toggleOnColor={Colors.white}
							value={selectedTabs[option.value]}
							toggleBgOffColor={Colors.gray48}
							toggleBgOnColor={Colors.bgButton}
							toggleOffColor={Colors.gray72}
						></MezonToggleButton>
					</View>
				))}
			</View>
			<View style={s.notifySetting}>
				<TouchableOpacity style={s.option} onPress={() => Toast.show({ type: 'info', text1: 'Updating...' })}>
					<SettingIcon width={22} height={22} />
					<Text style={s.textOption}>{t('tabNotify.notificationSettings')}</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

export default NotificationOption;
