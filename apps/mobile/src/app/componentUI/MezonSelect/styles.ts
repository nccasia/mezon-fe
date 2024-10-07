import { Attributes, Metrics } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		bsContainer: {
			padding: Metrics.size.xl
		}
	});
