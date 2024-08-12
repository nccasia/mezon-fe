import { useClans, useUserPermission } from '@mezon/core';
import { useTheme } from '@mezon/mobile-ui';
import { Text, View } from 'react-native';
import { MezonImagePicker } from '../../../temp-ui';
import { style } from './style';

export interface IFile {
	uri: string;
	name: string;
	type: string;
	size: string;
	fileData: any;
}

interface ILogoClanSelector { }

export default function LogoClanSelector({ }: ILogoClanSelector) {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const { currentClan, updateClan } = useClans();
	const { isClanOwner } = useUserPermission();

	function handleLoad(url?: string) {
		if (url) {
			updateClan({
				banner: currentClan?.banner ?? '',
				clan_id: currentClan?.clan_id ?? '',
				clan_name: currentClan?.clan_name ?? '',
				creator_id: currentClan?.creator_id ?? '',
				logo: url || (currentClan?.logo ?? ''),
			});
		}
	}

	return (
		<View style={styles.logoSection}>
			<View style={styles.logoContainer}>
				<MezonImagePicker defaultValue={currentClan?.logo} onLoad={handleLoad} autoUpload={true} alt={currentClan?.clan_name} disabled={!isClanOwner} />
			</View>

			<Text style={styles.clanName}>{currentClan?.clan_name}</Text>
		</View>
	);
}
