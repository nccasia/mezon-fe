import { useTheme } from '@mezon/mobile-ui';
import { RootState, selectAllClans } from '@mezon/store-mobile';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import ChannelList from './ChannelList';
import ServerList from './ServerList';
import UserEmptyClan from './UserEmptyClan';
import { style } from './styles';

const DrawerContent = React.memo((props: any) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const clansLoadingStatus = useSelector((state: RootState) => state?.clans?.loadingStatus);
	const clans = useSelector(selectAllClans);
	const [isEmptyClan, setIsEmptyClan] = useState<boolean>(false);

	useEffect(() => {
		setIsEmptyClan(clansLoadingStatus === 'loaded' && !clans?.length);
	}, [clansLoadingStatus, clans]);
	return (
		<View {...props.dProps} style={[styles.containerDrawerContent, { backgroundColor: themeValue.primary }]}>
			<ServerList />
			{isEmptyClan ? <UserEmptyClan /> : <ChannelList />}
		</View>
	);
});

export default DrawerContent;
