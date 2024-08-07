import { Metrics, useAnimatedState, useTheme } from '@mezon/mobile-ui';
import React, { useEffect, useRef } from 'react';
import { Image, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import { style } from './styles';

const widthMedia = Metrics.screenWidth - 150;

export const RenderImageChat = React.memo(({ image, index, disable, onPress, onLongPress }: any) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const [calcImgHeight, setCalcImgHeight] = useAnimatedState<number>(180);
	const prevImageUrl = useRef<string | null>(null);

	useEffect(() => {
		if (image?.url && image.url !== prevImageUrl.current) {
			prevImageUrl.current = image.url;
			Image.getSize(image.url, (width, height) => {
				const newHeight = (height / width) * widthMedia;
				setCalcImgHeight(newHeight);
			});
		}
	}, [image.url, setCalcImgHeight]);
	
	return (
		<TouchableOpacity disabled={disable} activeOpacity={0.8} key={index} onPress={() => onPress(image)} onLongPress={onLongPress}>
			<FastImage
				style={[
					styles.imageMessageRender,
					{
						width: widthMedia,
						height: calcImgHeight,
					},
				]}
				source={{ uri: image?.url }}
				resizeMode="contain"
			/>
		</TouchableOpacity>
	);
});
