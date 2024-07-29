import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Icons } from '@mezon/mobile-components';
import { useTheme } from '@mezon/mobile-ui';
import { EventManagementEntity, selectClanById, selectMemberByUserId } from '@mezon/store-mobile';
import { useRef } from 'react';
import { Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { MezonBottomSheet } from '../../../temp-ui';
import MezonAvatar from '../../../temp-ui/MezonAvatar';
import MezonButton from '../../../temp-ui/MezonButton2';
import EventLocation from '../EventLocation';
import EventMenu from '../EventMenu';
import EventTime from '../EventTime';
import { style } from './styles';

interface IEventDetailProps {
	event: EventManagementEntity;
}

export default function EventDetail({ event }: IEventDetailProps) {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const userCreate = useSelector(selectMemberByUserId(event?.creator_id || ''));
	const clans = useSelector(selectClanById(event?.clan_id || ''));
	const menuBottomSheet = useRef<BottomSheetModal>(null);

	function handlePress() {
		menuBottomSheet?.current?.present();
	}

	return (
		<View style={styles.container}>
			<EventTime event={event} />
			<Text style={styles.title}>{event.title}</Text>

			<View>
				<View style={styles.mainSection}>
					<View style={styles.inline}>
						<MezonAvatar avatarUrl={clans?.logo} username={clans?.clan_name} height={20} width={20} />
						<Text style={styles.smallText}>{clans?.clan_name}</Text>
					</View>

					<EventLocation event={event} />

					<View style={styles.inline}>
						<Icons.BellIcon height={16} width={16} color={themeValue.text} />
						<Text style={styles.smallText}>{event?.user_ids?.length}</Text>
						<Text style={styles.smallText}>{
							event?.user_ids?.length > 1
								? "people are interested"
								: "person is interested"}
						</Text>
					</View>

					<View style={styles.inline}>
						<MezonAvatar
							avatarUrl={userCreate?.user?.avatar_url}
							username={userCreate?.user?.username}
							height={20}
							width={20}
						/>
						<Text style={styles.smallText}>Created by</Text>
						<Text style={[styles.smallText, styles.highlight]}>{userCreate?.user?.username}</Text>
					</View>
				</View>
			</View>

			{event.description && <Text style={styles.description}>{event.description}</Text>}

			<View style={styles.inline}>
				{/* <MezonButton title="End event" fluid /> */}
				<MezonButton icon={<Icons.CheckmarkLargeIcon height={16} width={16} color={themeValue.text} />} title="Interested" fluid border titleStyle={{ color: themeValue.text }} />
				{/* <MezonButton title="Start event" fluid type="success" /> */}
				<MezonButton icon={<Icons.ShareIcon height={20} width={20} color={themeValue.text} />} />
				<MezonButton icon={<Icons.MoreVerticalIcon height={20} width={20} color={themeValue.text} />} onPress={handlePress} />
			</View>

			<MezonBottomSheet ref={menuBottomSheet}>
				<EventMenu event={event} />
			</MezonBottomSheet>
		</View>
	);
}
