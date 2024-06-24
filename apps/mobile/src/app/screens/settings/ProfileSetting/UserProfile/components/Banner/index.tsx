import { Image, View } from "react-native";
import styles from "./styles";
import { TouchableOpacity } from "react-native-gesture-handler";
import { PenIcon } from "@mezon/mobile-components";
import Toast from "react-native-toast-message";
import { launchImageLibrary } from "react-native-image-picker"
import { useMixImageColor } from "../../../../../../../app/hooks/useMixImageColor";

export interface IFile {
    uri: string;
    name: string;
    type: string;
    size: string;
    fileData: any;
}
interface IBannerAvatarProps {
    avatar: string;
    onChange?: (url: IFile) => void;
}

export default function BannerAvatar({ avatar, onChange }: IBannerAvatarProps) {
    const { color } = useMixImageColor(avatar);

    function reserve() {
        Toast.show({
            type: "info",
            text1: "Coming soon..."
        })
    }

    async function selectImage() {
        const response = await launchImageLibrary({
            mediaType: "photo",
            includeBase64: true,
        });

        if (response.didCancel) {
            console.log('User cancelled camera');
        } else if (response.errorCode) {
            console.log('Camera Error: ', response.errorMessage);
        } else {
            const file = response.assets[0];
            const fileFormat: IFile = {
                uri: file?.uri,
                name: file?.fileName,
                type: file?.type,
                size: file?.fileSize?.toString(),
                fileData: file?.base64,
            };

            // TODO: Update banner color
            onChange && onChange(fileFormat);
        }
    }

    return (
        <View style={{ display: "flex" }}>
            <View style={[styles.bannerContainer, { backgroundColor: color }]}>
                <View style={styles.btnGroup}>
                    <TouchableOpacity
                        onPress={reserve}
                        style={styles.btnRound}>
                        <PenIcon height={12} width={12} color="gray" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.avatarContainer}>
                <Image
                    style={styles.avatar}
                    source={{ uri: avatar || '' }}
                />

                <View style={[styles.btnGroup, styles.absolute]}>
                    <TouchableOpacity
                        onPress={selectImage}
                        style={styles.btnRound} >
                        <PenIcon height={12} width={12} color="gray" />
                    </TouchableOpacity>
                </View>

                <View style={[styles.onLineStatus]}></View>
            </View>
        </View>
    )
}