import { baseColor, useTheme } from "@mezon/mobile-ui";
import { StyleProp, Text, TextStyle, View } from "react-native";
import FastImage from "react-native-fast-image";
import { style } from "./styles";

interface IMezonClanAvatarProps {
    image?: string;
    alt?: string;
    defaultColor?: string;
    textStyle?: StyleProp<TextStyle>,
    noDefaultText?: boolean
}

export default function MezonClanAvatar({ image, alt = "anonymous", defaultColor, textStyle, noDefaultText }: IMezonClanAvatarProps) {
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
                    {!noDefaultText
                        ? (
                            <Text
                                adjustsFontSizeToFit
                                numberOfLines={1}
                                style={[styles.altText, textStyle]}>
                                {alt?.charAt(0).toUpperCase()}
                            </Text>
                        ) : null
                    }
                </View>
            }
        </>
    );
}
