import { appActions, clansActions, getStoreAsync, selectAllClans, selectCurrentClan } from '@mezon/store-mobile';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useSelector } from 'react-redux';
import PlusGreenIcon from '../../../../assets/svg/guildAddCategoryChannel.svg';
import LogoMezon from '../../../../assets/svg/logoMezon.svg';
import { ClanIcon } from './Reusables';
import CreateClanModal from './components/CreateClanModal';
import { styles } from './styles';

const ServerList = React.memo((props: any) => {
	const [isVisible, setIsVisible] = useState<boolean>(false);
	const clans = useSelector(selectAllClans);
	const currentClan = useSelector(selectCurrentClan);

	const handleChangeClan = async (clanId: string) => {
		const store = await getStoreAsync();
		store.dispatch(appActions.setLoadingMainMobile(true));
		store.dispatch(clansActions.changeCurrentClan({ clanId: clanId }));
	};

	const visibleCreateClanModal = (value) => {
		setIsVisible(value);
	};
	return (
		<View style={styles.wrapperServerList}>
			<ClanIcon icon={<LogoMezon width={40} height={40} />} data={[]} />
			<View style={{ width: '100%', alignItems: 'center', marginBottom: 10 }}>
				<View style={{ borderWidth: 0.5, borderColor: 'lightgray', width: '50%' }} />
			</View>
			{clans.map((server) => (
				<ClanIcon data={server} key={server.id} onPress={handleChangeClan} isActive={currentClan?.clan_id === server?.clan_id} />
			))}
			<Pressable
				style={styles.wrapperPlusClan}
				onPress={() => {
					setIsVisible(!isVisible);
				}}
			>
				<PlusGreenIcon width={30} height={30} />
			</Pressable>
			<CreateClanModal visible={isVisible} setVisible={visibleCreateClanModal} />
		</View>
	);
});

export default ServerList;
