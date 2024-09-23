import { Block, Colors, Metrics, size } from '@mezon/mobile-ui';
import { Video as ExpoVideo, ResizeMode } from 'expo-av';
import React, { useState } from 'react';
import { ActivityIndicator } from 'react-native';

const widthMedia = Metrics.screenWidth - 150;

export const RenderVideoChat = React.memo(
	({ videoURL }: { videoURL: string }) => {
		const [videoDimensions, setVideoDimensions] = useState({ width: widthMedia + size.s_50, height: 160 });

		if (!videoURL) return null;
		const isUploading = !videoURL?.includes('http');

		return (
			<Block marginTop={size.s_10} opacity={isUploading ? 0.5 : 1}>
				<ExpoVideo
					onError={(err) => {
						console.log('load error', err);
					}}
					onReadyForDisplay={(event) => {
						const { width, height } = event.naturalSize || {};
						const aspectRatio = width / height;
						const calculatedWidth = widthMedia;
						const calculatedHeight = calculatedWidth / aspectRatio;
						setVideoDimensions({ width: calculatedWidth, height: calculatedHeight });
					}}
					source={{
						uri: videoURL
					}}
					useNativeControls
					resizeMode={ResizeMode.CONTAIN}
					rate={1.0}
					removeClippedSubviews
					shouldRasterizeIOS
					style={{
						width: videoDimensions.width,
						height: videoDimensions.height,
						borderRadius: size.s_4,
						overflow: 'hidden',
						backgroundColor: Colors.borderDim
					}}
				/>
				{isUploading && (
					<Block position="absolute" top={0} left={0} right={0} bottom={15} width={'100%'} alignItems="center" justifyContent="center">
						<ActivityIndicator />
					</Block>
				)}
			</Block>
		);
	},
	(prevProps, nextProps) => prevProps.videoURL === nextProps.videoURL
);
