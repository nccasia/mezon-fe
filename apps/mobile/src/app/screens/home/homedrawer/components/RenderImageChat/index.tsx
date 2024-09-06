import { Block, Metrics, useTheme } from '@mezon/mobile-ui';
import React from 'react';
import { ActivityIndicator, TouchableOpacity } from 'react-native';
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

	const imageSize = getAspectRatioSize({
		aspectRatio: resolution.width / resolution.height,
		width: widthMedia
	});

	const isUploading = !image?.url?.includes('http');

	if (!image.url) {
		return null;
	}

	return (
		<TouchableOpacity disabled={isUploading || disable} activeOpacity={0.8} key={index} onPress={() => onPress(image)} onLongPress={onLongPress}>
			<FastImage
				style={[
					styles.imageMessageRender,
					{
						width: imageSize.width,
						height: imageSize.height
					}
				]}
				source={{ uri: image?.url }}
				resizeMode="contain"
			/>
			{isUploading && (
				<Block
					backgroundColor={'rgba(0,0,0,0.5)'}
					flex={1}
					position={'absolute'}
					top={0}
					left={0}
					width={imageSize.width}
					height={imageSize.height}
					alignItems={'center'}
					justifyContent={'center'}
				>
					<ActivityIndicator />
				</Block>
			)}
		</TouchableOpacity>
	);
});
