import { size, useTheme } from '@mezon/mobile-ui';
import { StyleProp, TextStyle, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import Images from '../../../assets/Images';
import { style } from './styles';

interface IMezonClanAvatarProps {
	image?: string;
	alt?: string;
	defaultColor?: string;
	textStyle?: StyleProp<TextStyle>;
	noDefaultText?: boolean;
	lightMode?: boolean;
}

export default function MezonClanAvatar({
	image,
	alt = 'anonymous',
	defaultColor,
	textStyle,
	noDefaultText = false,
	lightMode
}: IMezonClanAvatarProps) {
	const { themeValue } = useTheme();

	const styles = style(themeValue);

	if (image) {
		return <FastImage source={{ uri: image }} style={styles.image} />;
	}
	return (
		<View style={[styles.fakeBox, { backgroundColor: defaultColor || themeValue.colorAvatarDefault }]}>
			{!noDefaultText ? (
				<FastImage source={Images.ANONYMOUS_AVATAR} style={{ width: '100%', height: '100%', borderRadius: size.s_100 }} />
			) : null}
		</View>
	);
}
