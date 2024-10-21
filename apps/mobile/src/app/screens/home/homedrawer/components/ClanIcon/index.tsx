import { useTheme } from '@mezon/mobile-ui';
import { selectBadgeCountByClanId, selectCurrentClanId } from '@mezon/store';
import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useSelector } from 'react-redux';
import { style } from './styles';

interface IClanIconProps {
	data: any;
	onPress?: any;
}
export const ClanIcon = memo((props: IClanIconProps) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const currentClanId = useSelector(selectCurrentClanId);
	const badgeCountClan = useSelector(selectBadgeCountByClanId(props?.data?.clan_id ?? '')) || 0;

	const isActive = currentClanId === props?.data?.clan_id;
	return (
		<Pressable
			style={[styles.wrapperClanIcon]}
			onPress={() => {
				if (props?.onPress && props?.data?.clan_id) {
					props?.onPress(props?.data?.clan_id);
				}
			}}
		>
			{props?.data?.logo ? (
				<FastImage source={{ uri: props?.data?.logo || '' }} style={[styles.logoClan, isActive && styles.logoClanActive]} />
			) : (
				<View style={[styles.clanIcon, isActive && styles.logoClanActive]}>
					<Text style={styles.textLogoClanIcon}>{props?.data?.clan_name?.charAt(0)?.toUpperCase()}</Text>
				</View>
			)}

			{badgeCountClan > 0 && (
				<View style={styles.badge}>
					<Text style={styles.badgeText}>{badgeCountClan > 99 ? `+99` : badgeCountClan}</Text>
				</View>
			)}
			{!!isActive && <View style={styles.lineActiveClan} />}
		</Pressable>
	);
});
