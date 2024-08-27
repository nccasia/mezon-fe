import { Metrics, useTheme } from '@mezon/mobile-ui';
import React from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { getAspectRatioSize, useImageResolution } from 'react-native-zoom-toolkit';
import { style } from './styles';

const widthMedia = Metrics.screenWidth - 150;

export const RenderImageChat = React.memo(({ image, index, disable, onPress, onLongPress }: any) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	// Gets the resolution of your image
	const { isFetching, resolution } = useImageResolution({ uri: image.url });
	if (isFetching || resolution === undefined) {
		return null;
	}

	const isUpdated = false;

	const imageSize = getAspectRatioSize({
		aspectRatio: resolution.width / resolution.height,
		width: widthMedia,
	});

	return (
		<TouchableOpacity
			disabled={disable || !isUpdated}
			activeOpacity={0.8}
			key={index}
			onPress={() => onPress(image)}
			onLongPress={onLongPress}>
			<View style={{ position: "relative" }}>
				<FastImage
					style={[
						styles.imageMessageRender,
						{
							width: imageSize.width,
							height: imageSize.height,
						},
					]}
					source={{ uri: image?.url }}
					resizeMode="contain"
				/>

				{!image?.path?.startWith("http") && (
					<View style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", justifyContent: "center", alignContent: "center", backgroundColor: themeValue.darkMossGreen }}>
						<ActivityIndicator size={'small'} color={'white'} />
					</View>)}
			</View>
		</TouchableOpacity>
	);
});
