import { Block } from '@mezon/mobile-ui';
import { memo } from 'react';
import { ActivityIndicator } from 'react-native';

export const LoadingOverlay = memo(() => {
	return (
		<Block backgroundColor={'rgba(0,0,0,0.5)'} flex={1} alignContent="center" justifyContent="center">
			<ActivityIndicator />
		</Block>
	);
});
