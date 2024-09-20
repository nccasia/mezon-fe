import { Block, Metrics, useTheme } from '@mezon/mobile-ui';
import React from 'react';
import { ActivityIndicator, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import { getAspectRatioSize, useImageResolution } from 'react-native-zoom-toolkit';
import { style } from './styles';

const widthMedia = Metrics.screenWidth - 150;
const heightMedia = Metrics.screenHeight * 0.3;

export const RenderImageChat = React.memo(({ image, index, disable, onPress, onLongPress }: any) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const { resolution } = useImageResolution({ uri: image.url });

	const imageSize = getAspectRatioSize({
		aspectRatio: (resolution?.width || 1) / (resolution?.height || 1),
		width: widthMedia
	});

	const isUploading = !image?.url?.includes('http');

	if (!image.url) {
		return null;
	}

	return (
		<TouchableOpacity disabled={isUploading || disable} activeOpacity={0.8} key={index} onPress={() => onPress(image)} onLongPress={onLongPress}>
			<FastImage
				fallback={true}
				style={[
					styles.imageMessageRender,
					{
						width: !imageSize?.height && !isUploading ? widthMedia : imageSize.width * 0.8,
						height: !imageSize?.height && !isUploading ? heightMedia : imageSize.height * 0.8,
						opacity: isUploading ? 0.5 : 1
					}
				]}
				children={
					isUploading ? (
						<Block backgroundColor={'rgba(0,0,0,0.5)'} flex={1} alignContent="center" justifyContent="center">
							<ActivityIndicator />
						</Block>
					) : null
				}
				source={{
					uri: image?.url,
					priority: FastImage.priority.high
				}}
				resizeMode={!imageSize?.height && !isUploading ? 'cover' : 'contain'}
			/>
		</TouchableOpacity>
	);
});
