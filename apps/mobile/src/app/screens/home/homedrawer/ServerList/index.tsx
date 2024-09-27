import { useFriends } from '@mezon/core';
import { size, useTheme } from '@mezon/mobile-ui';
import { clansActions, useAppDispatch } from '@mezon/store-mobile';
import { useNavigation } from '@react-navigation/native';
import useTabletLandscape from 'apps/mobile/src/app/hooks/useTabletLandscape';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import LogoMezonDark from '../../../../../assets/svg/logoMezonDark.svg';
import LogoMezonLight from '../../../../../assets/svg/logoMezonLight.svg';
import { SeparatorWithLine } from '../../../../components/Common';
import { APP_SCREEN } from '../../../../navigation/ScreenTypes';
import { ListClanPopup } from '../components/ListClanPopup';
import { UnreadDMBadgeList } from '../components/UnreadDMBadgeList';
import { style } from './styles';

const ServerList = React.memo(() => {
	const { themeValue, theme } = useTheme();
	const styles = style(themeValue);
	const { quantityPendingRequest } = useFriends();
	const navigation = useNavigation<any>();
	const isTabletLandscape = useTabletLandscape();
	const dispatch = useAppDispatch();

	const navigateToDM = () => {
		navigation.navigate(APP_SCREEN.MESSAGES.HOME);
		if (isTabletLandscape) {
			dispatch(clansActions.setCurrentClanId('0'));
		}
	};

	return (
		<View style={styles.wrapperServerList}>
			<TouchableOpacity style={styles.wrapperLogo} onPress={() => navigateToDM()}>
				{theme === 'light' ? <LogoMezonLight width={size.s_50} height={size.s_50} /> : <LogoMezonDark width={size.s_50} height={size.s_50} />}
				{quantityPendingRequest ? (
					<View style={styles.badge}>
						<Text style={styles.badgeText}>{quantityPendingRequest}</Text>
					</View>
				) : null}
			</TouchableOpacity>
			<SeparatorWithLine style={styles.separatorLine} />
			<ScrollView contentContainerStyle={styles.contentScroll} showsVerticalScrollIndicator={false}>
				<UnreadDMBadgeList />
				<ListClanPopup />
			</ScrollView>
		</View>
	);
});

export default ServerList;
