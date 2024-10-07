import { useCategory } from '@mezon/core';
import { useTheme } from '@mezon/mobile-ui';
import { RootState, selectAllClans, selectIsShowEmptyCategory } from '@mezon/store-mobile';
import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import useTabletLandscape from '../../../hooks/useTabletLandscape';
import ChannelList from './ChannelList';
import ServerList from './ServerList';
import UserEmptyClan from './UserEmptyClan';
import { style } from './styles';

const ChannelListWrapper = React.memo(() => {
	const clans = useSelector(selectAllClans);
	const clansLoadingStatus = useSelector((state: RootState) => state?.clans?.loadingStatus);
	const { categorizedChannels: categorizedChannelsRaw } = useCategory();
	const isShowEmptyCategory = useSelector(selectIsShowEmptyCategory);

	const categorizedChannels = useMemo(() => {
		return categorizedChannelsRaw.map((item) => {
			if (!isShowEmptyCategory && item?.channels?.length === 0) {
				return null;
			}
			return item;
		});
	}, [categorizedChannelsRaw, isShowEmptyCategory]);

	return (
		<>
			{clansLoadingStatus === 'loaded' && !clans?.length ? (
				<UserEmptyClan />
			) : (
				<MemoizedChannelList categorizedChannels={categorizedChannels} />
			)}
		</>
	);
});

const MemoizedChannelList = React.memo(ChannelList, (prevProps, nextProps) => {
	return JSON.stringify(prevProps.categorizedChannels) === JSON.stringify(nextProps.categorizedChannels);
});

const DrawerContent = React.memo(() => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const isTabletLandscape = useTabletLandscape();

	return (
		<View style={[styles.containerDrawerContent, { backgroundColor: isTabletLandscape ? themeValue.tertiary : themeValue.primary }]}>
			<ServerList />
			<ChannelListWrapper />
		</View>
	);
});

export default DrawerContent;
