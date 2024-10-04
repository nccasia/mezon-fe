import { Icons } from '@mezon/mobile-components';
import { useTheme } from '@mezon/mobile-ui';
import { EventManagementEntity, selectChannelById } from '@mezon/store-mobile';
import { OptionEvent } from '@mezon/utils';
import { Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { style } from './styles';

interface IEventLocation {
	event: EventManagementEntity;
}

export function EventLocation({ event }: IEventLocation) {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const option = event.address ? OptionEvent.OPTION_LOCATION : OptionEvent.OPTION_SPEAKER;
	const channelVoice = useSelector(selectChannelById(event?.channel_id));
	// const channelFirst = useSelector(selectChannelFirst);

	return (
		<View style={styles.container}>
			{option === OptionEvent.OPTION_SPEAKER && (
				<View style={styles.inline}>
					<Icons.VoiceNormalIcon height={16} width={16} color={themeValue.text} />
					<Text style={styles.smallText}>{channelVoice?.channel_label}</Text>
				</View>
			)}

			{option === OptionEvent.OPTION_LOCATION && (
				<View style={styles.inline}>
					<Icons.LocationIcon height={16} width={16} color={themeValue.text} />
					<Text style={styles.smallText}>{event?.address}</Text>
				</View>
			)}

			{/* {option === '' && !event && !channelVoice && (
                <>
                    <Icons.Location />
                    <p className="hover:underline text-slate-400">{channelFirst.channel_label}</p>
                </>
            )} */}
		</View>
	);
}
