import { clansActions, getStoreAsync, selectAllClans, selectCurrentClan } from '@mezon/store-mobile';
import React from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import PlusGreenIcon from '../../../../assets/svg/guildAddCategoryChannel.svg';
import LogoMezon from '../../../../assets/svg/logoMezon.svg';
import { ClanIcon } from './Reusables';
import { styles } from './styles';
import Toast from "react-native-toast-message";

const ServerList = React.memo((props: any) => {
	const clans = useSelector(selectAllClans);
	const currentClan = useSelector(selectCurrentClan);

	const handleChangeClan = async (clanId: string) => {
		const store = await getStoreAsync();
		store.dispatch(clansActions.changeCurrentClan({ clanId: clanId }));
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
			<ClanIcon icon={<PlusGreenIcon width={30} height={30} />} data={{}} onPress={() => Toast.show({ type: 'info', text1: 'Updating...'})} />
		</View>
	);
});

export default ServerList;
