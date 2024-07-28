import { useTheme } from '@mezon/mobile-ui';
import { EventManagementEntity, selectMemberByUserId } from '@mezon/store-mobile';
import { Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import MezonAvatar from '../../../temp-ui/MezonAvatar';
import { style } from './styles';

interface IEventMemberProps {
	event: EventManagementEntity;
}

const renderAvatar = (id: string, index: number) => {
	const user = useSelector(selectMemberByUserId(id || ''));
	const { themeValue } = useTheme();
	const styles = style(themeValue);

	return (
		<View style={styles.item}>
			<MezonAvatar
				key={index.toString()}
				height={40}
				width={40}
				avatarUrl={user?.user?.avatar_url}
				username={user?.user?.username}
				userStatus={user?.user?.online}
			/>
			<Text style={styles.text}>{user?.user?.display_name}</Text>
		</View>

	);
};

export default function EventMember({ event }: IEventMemberProps) {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	return (
		<View style={styles.container}>
			{event?.user_ids?.map((uid, index) => renderAvatar(uid, index))}
		</View>
	);
}
