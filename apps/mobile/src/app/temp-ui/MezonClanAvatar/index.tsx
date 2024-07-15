import { StyleProp, Text, TextStyle, View } from "react-native";
import { style } from "./styles";
import { baseColor, useTheme } from "@mezon/mobile-ui";
import FastImage from "react-native-fast-image";

interface IMezonClanAvatarProps {
    image?: string;
    alt?: string;
    defaultColor?: string;
    textStyle?: StyleProp<TextStyle>
}

export default function MezonClanAvatar({ image, alt = "anonymous", defaultColor, textStyle }: IMezonClanAvatarProps) {
    const styles = style(useTheme().themeValue)

    return (
        <>
            {image
                ? <FastImage
                    source={{ uri: image }}
                    resizeMode="cover"
                    style={styles.image}
                />
                : <View style={[styles.fakeBox, { backgroundColor: defaultColor || baseColor.blurple }]}>
                    <Text style={[styles.altText, textStyle]}>
                        {alt?.charAt(0).toUpperCase()}
                    </Text>
                </View>
            }
        </>
    );
}