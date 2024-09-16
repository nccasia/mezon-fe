import { Block, size } from '@mezon/mobile-ui';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity } from 'react-native';
import { styles } from './UserEmptyMessage.styles';

const UserEmptyMessage = ({ onPress }: { onPress: () => void }) => {
	const { t } = useTranslation(['userEmptyClan']);
	return (
		<Block style={styles.wrapper}>
			<Block marginTop={size.s_20}>
				<Text style={styles.title}>{t('emptyMessage.dMsWith')}</Text>
				<Text style={styles.description}>{t('emptyMessage.inviteYourFriends')}</Text>
			</Block>
			<Block marginTop={size.s_40}>
				<TouchableOpacity
					style={styles.addFriendsBtn}
					onPress={() => {
						onPress();
					}}
				>
					<Text style={styles.textAddFriends}>{t('emptyMessage.addFriend')}</Text>
				</TouchableOpacity>
			</Block>
		</Block>
	);
};

export default UserEmptyMessage;
