import { Text, View } from "react-native";
import styles from "./style";
import { useClans } from "@mezon/core";
import { MezonImagePicker } from "../../../temp-ui";

export interface IFile {
    uri: string;
    name: string;
    type: string;
    size: string;
    fileData: any;
}

interface ILogoClanSelector { }

export default function LogoClanSelector({ }: ILogoClanSelector) {
    const { currentClan, updateClan } = useClans();

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
                <MezonImagePicker
                    defaultValue={currentClan?.logo}
                    onLoad={handleLoad} />
            </View>

            <Text style={styles.clanName}>{currentClan.clan_name}</Text>
        </View>
    )
}