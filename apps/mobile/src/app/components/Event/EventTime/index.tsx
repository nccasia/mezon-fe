import { Icons, isSameDay, timeFormat } from '@mezon/mobile-components';
import { useTheme } from '@mezon/mobile-ui';
import { EventManagementEntity } from '@mezon/store-mobile';
import { Text, View } from 'react-native';
import MezonBadge from '../../../temp-ui/MezonBadge';
import { style } from './styles';

interface IEventTimeProps {
	event: EventManagementEntity;
}

export default function EventTime({ event }: IEventTimeProps) {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	return (
		<View style={styles.inline}>
			{
				isSameDay(event.create_time as string) && <MezonBadge title="new" type="success" />
			}
			<Icons.CalendarIcon height={20} width={20} color={themeValue.textStrong} />
			<Text style={styles.smallText}>{timeFormat(event.start_time)} </Text>

			{/* Coming soon */}
			{/* Active now */}
		</View>
	);
}
