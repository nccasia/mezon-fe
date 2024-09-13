import { Icons } from '@mezon/mobile-components';
import { size, useTheme } from '@mezon/mobile-ui';
import { EventManagementEntity, selectChannelById, selectMemberClanByUserId } from '@mezon/store-mobile';
import { OptionEvent } from '@mezon/utils';
import { Pressable, Text, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useSelector } from 'react-redux';
import MezonButton from '../../../temp-ui/MezonButton2';
import EventLocation from '../EventLocation';
import EventTime from '../EventTime';
import { style } from './styles';

interface IEventItemProps {
	event: EventManagementEntity;
	onPress?: () => void;
	showActions?: boolean;
}

export default function EventItem({ event, onPress, showActions = true }: IEventItemProps) {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const userCreate = useSelector(selectMemberClanByUserId(event?.creator_id || ''));
	const option = event.address ? OptionEvent.OPTION_LOCATION : OptionEvent.OPTION_SPEAKER;
	const channelVoice = useSelector(selectChannelById(event?.channel_id));
	// const channelFirst = useSelector(selectChannelFirst);

	function handlePress() {
		onPress && onPress();
	}

	return (
		<Pressable onPress={handlePress}>
			<View style={styles.container}>
				<View style={styles.infoSection}>
					<EventTime event={event} />

					<View style={[styles.inline, styles.infoRight]}>
						<View style={styles.avatar}>
							<FastImage source={{ uri: userCreate?.user?.avatar_url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
						</View>
						<View style={styles.inline}>
							<Icons.GroupIcon height={size.s_10} width={size.s_10} color={themeValue.text} />
							<Text style={styles.tinyText}>{event?.user_ids?.length}</Text>
						</View>
					</View>
				</View>

				<View style={styles.mainSec}>
					<Text style={{ color: themeValue.textStrong }}>{event.title}</Text>
					{event.description && <Text style={styles.description}>{event.description}</Text>}
					<EventLocation event={event} />
				</View>

				{showActions && (
					<View style={styles.inline}>
						<MezonButton
							icon={<Icons.CheckmarkSmallIcon height={size.s_20} width={size.s_20} color={themeValue.text} />}
							title="Interested"
							fluid
							border
						/>
						<MezonButton icon={<Icons.ShareIcon height={size.s_20} width={size.s_20} color={themeValue.text} />} />
					</View>
				)}
			</View>
		</Pressable>
	);
}
