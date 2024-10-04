import { Icons } from '@mezon/mobile-components';
import { size, useTheme } from '@mezon/mobile-ui';
import { EventManagementEntity, selectMemberClanByUserId } from '@mezon/store-mobile';
import { EEventStatus } from '@mezon/utils';
import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useSelector } from 'react-redux';
import MezonButton from '../../../temp-ui/MezonButton2';
import { EventLocation } from '../EventLocation';
import { EventTime } from '../EventTime';
import { style } from './styles';

interface IEventItemProps {
	event: EventManagementEntity;
	onPress?: () => void;
	showActions?: boolean;
	start: string;
}

export function EventItem({ event, onPress, showActions = true, start }: IEventItemProps) {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const userCreate = useSelector(selectMemberClanByUserId(event?.creator_id || ''));

	const eventStatus = useMemo(() => {
		if (event?.status) {
			return event.status;
		}
		if (start) {
			const currentTime = Date.now();
			const startTimeLocal = new Date(start);
			const startTimeUTC = startTimeLocal.getTime() + startTimeLocal.getTimezoneOffset() * 60000;
			const leftTime = startTimeUTC - currentTime;

			if (leftTime > 0 && leftTime <= 1000 * 60 * 10) {
				return EEventStatus.UPCOMING;
			}

			if (leftTime <= 0) {
				return EEventStatus.ONGOING;
			}
		}

		return EEventStatus.UNKNOWN;
	}, [start, event?.status]);

	function handlePress() {
		onPress && onPress();
	}

	return (
		<Pressable onPress={handlePress}>
			<View style={styles.container}>
				<View style={styles.infoSection}>
					<EventTime eventStatus={eventStatus} event={event} />
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
