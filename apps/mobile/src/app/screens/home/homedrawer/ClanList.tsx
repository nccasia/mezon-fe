import {selectAllClans, selectCurrentClan} from '@mezon/store';
import React from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import DiscoveryIcon from '../../../../assets/svg/discoveryStudentHubs.svg';
import PlusGreenIcon from '../../../../assets/svg/guildAddCategoryChannel.svg';
import LogoMezon from '../../../../assets/svg/logoMezon.svg';
import { ClanIcon } from './Reusables';

const ClanList = React.memo((props: any) => {
	const currentClan = useSelector(selectCurrentClan);
	console.log('Tom log  => currentClan', currentClan);

	return (
		<View style={{ height: '100%', paddingTop: 20, width: '22%', justifyContent: 'flex-start' }}>
			<ClanIcon icon={<LogoMezon width={40} height={40} />} data={[]} />
			<View style={{ width: '100%', alignItems: 'center', marginBottom: 10 }}>
				<View style={{ borderWidth: 0.5, borderColor: 'lightgray', width: '50%' }} />
			</View>
			{/*Keep logic show array, currently only shows 1 current clan*/}
			{!!currentClan && [currentClan].map((server) => (
				<ClanIcon data={server} />
			))}
			<ClanIcon icon={<PlusGreenIcon width={30} height={30} />} data={{}} />
			<ClanIcon icon={<DiscoveryIcon width={30} height={30} />} data={{}} />
		</View>
	);
});

export default ClanList;
