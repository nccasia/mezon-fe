import { Block, Colors, Metrics, size } from '@mezon/mobile-ui';
import { Video as ExpoVideo, ResizeMode } from 'expo-av';
import React from 'react';
import { ActivityIndicator } from 'react-native';

const widthMedia = Metrics.screenWidth - 150;
export const RenderVideoChat = React.memo(
	({ videoURL }: { videoURL: string }) => {
		if (!videoURL) return null;
		const isUploading = !videoURL?.includes('http');
		return (
			<Block height={170} width={widthMedia + size.s_50} marginTop={size.s_10}>
				<ExpoVideo
					onError={(err) => {
						console.log('load error', err);
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
						width: widthMedia + size.s_50,
						height: 160,
						borderRadius: size.s_4,
						overflow: 'hidden',
						backgroundColor: Colors.borderDim
					}}
				/>
				{isUploading && (
					<Block
						backgroundColor={'rgba(0,0,0,0.5)'}
						position="absolute"
						top={0}
						left={0}
						right={0}
						bottom={15}
						alignItems="center"
						justifyContent="center"
					>
						<ActivityIndicator />
					</Block>
				)}
			</Block>
		);
	},
	(prevProps, nextProps) => prevProps.videoURL === nextProps.videoURL
);
