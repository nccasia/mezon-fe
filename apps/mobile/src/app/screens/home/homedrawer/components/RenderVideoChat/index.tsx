import { Colors, Metrics, size } from '@mezon/mobile-ui';
import { Video as ExpoVideo, ResizeMode } from 'expo-av';
import React from 'react';

const widthMedia = Metrics.screenWidth - 150;
export const RenderVideoChat = React.memo(
	({ videoURI }: any) => {
		return (
			<ExpoVideo
				onError={(err) => {
					console.log('*** load error', err);
				}}
				source={{
					uri: videoURI,
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
		);
	},
	(prevProps, nextProps) => prevProps.videoURI === nextProps.videoURI,
);
