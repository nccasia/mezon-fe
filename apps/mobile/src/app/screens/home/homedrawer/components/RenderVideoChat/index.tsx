import { Colors, Metrics, size } from '@mezon/mobile-ui';
import { Video as ExpoVideo, ResizeMode } from 'expo-av';
import React from 'react';
import { View } from 'react-native';

const widthMedia = Metrics.screenWidth - 150;
export const RenderVideoChat = React.memo(
	({ videoURL }: { videoURL: string }) => {
		return (
			<View
				style={{
					height: 170,
					width: widthMedia + size.s_50,
					marginTop: size.s_10,
				}}
			>
				<ExpoVideo
					onError={(err) => {
						console.log('*** load error', err);
					}}
					source={{
						uri: videoURL,
					}}
					useNativeControls
					resizeMode={ResizeMode.CONTAIN}
					rate={1.0}
					style={{
						width: widthMedia + size.s_50,
						height: 160,
						borderRadius: size.s_4,
						overflow: 'hidden',
						backgroundColor: Colors.borderDim,
					}}
				/>
			</View>
		);
	},
	(prevProps, nextProps) => prevProps.videoURL === nextProps.videoURL,
);
