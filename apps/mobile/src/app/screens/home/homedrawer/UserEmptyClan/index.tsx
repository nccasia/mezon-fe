import { Block, size } from '@mezon/mobile-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Text, TouchableOpacity } from 'react-native';
import Images from '../../../../../assets/Images';
import CreateClanModal from '../components/CreateClanModal';
import JoinClanModal from '../components/JoinClanModal';
import { styles } from './UserEmptyClan.styles';

const UserEmptyClan = () => {
	const [isVisibleCreateClanModal, setIsVisibleCreateClanModal] = useState<boolean>(false);
	const [isVisibleJoinClanModal, setIsVisibleJoinClanModal] = useState<boolean>(false);
	const { t } = useTranslation('userEmptyClan');

	return (
		<Block style={styles.wrapper}>
			<Text style={styles.headerText}>{t('emptyClans.clans')}</Text>
			<Image style={styles.imageBg} source={Images.CHAT_PANA} />
			<Block>
				<Text style={styles.title}>{t('emptyClans.readyChat')}</Text>
				<Text style={styles.description}>{t('emptyClans.buildYourCommunity')}</Text>
			</Block>
			<Block marginTop={size.s_20}>
				<TouchableOpacity onPress={() => setIsVisibleJoinClanModal(!isVisibleJoinClanModal)} style={styles.joinClan}>
					<Text style={styles.textJoinClan}>{t('emptyClans.joinClan')}</Text>
				</TouchableOpacity>
				<TouchableOpacity onPress={() => setIsVisibleCreateClanModal(!isVisibleCreateClanModal)} style={styles.createClan}>
					<Text style={styles.textCreateClan}>{t('emptyClans.createClan')}</Text>
				</TouchableOpacity>
			</Block>
			<CreateClanModal visible={isVisibleCreateClanModal} setVisible={(value) => setIsVisibleCreateClanModal(value)} />
			<JoinClanModal visible={isVisibleJoinClanModal} setVisible={(value) => setIsVisibleJoinClanModal(value)} />
		</Block>
	);
};

export default UserEmptyClan;
