import { Attributes, Block, size, useTheme } from '@mezon/mobile-ui';
import React from 'react';
import { StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';

const ChannelListSkeleton = ({ numberSkeleton }: { numberSkeleton: number }) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);

	return (
		<Block paddingHorizontal={size.s_10}>
			<Block gap={size.s_10} flexDirection="row" alignItems="center" justifyContent="space-between">
				<ShimmerPlaceHolder
					shimmerColors={[themeValue.secondaryLight, themeValue.charcoal, themeValue.jet]}
					shimmerStyle={styles.bigText}
					LinearGradient={LinearGradient}
				/>
			</Block>
			{Array.from({ length: numberSkeleton }).map((_, index) => (
				<Block key={`ChannelListSkeleton_${index}`}>
					<ShimmerPlaceHolder
						shimmerColors={[themeValue.secondaryLight, themeValue.charcoal, themeValue.jet]}
						shimmerStyle={styles.normalText}
						LinearGradient={LinearGradient}
					/>
					{index % 2 ? (
						<Block>
							<ShimmerPlaceHolder
								shimmerColors={[themeValue.secondaryLight, themeValue.charcoal, themeValue.jet]}
								shimmerStyle={styles.mediumText}
								LinearGradient={LinearGradient}
							/>
							<ShimmerPlaceHolder
								shimmerColors={[themeValue.secondaryLight, themeValue.charcoal, themeValue.jet]}
								shimmerStyle={styles.smallText}
								LinearGradient={LinearGradient}
							/>
						</Block>
					) : (
						<Block>
							<ShimmerPlaceHolder
								shimmerColors={[themeValue.secondaryLight, themeValue.charcoal, themeValue.jet]}
								shimmerStyle={styles.smallText}
								LinearGradient={LinearGradient}
							/>
							<ShimmerPlaceHolder
								shimmerColors={[themeValue.secondaryLight, themeValue.charcoal, themeValue.jet]}
								shimmerStyle={styles.smallText}
								LinearGradient={LinearGradient}
							/>
							<ShimmerPlaceHolder
								shimmerColors={[themeValue.secondaryLight, themeValue.charcoal, themeValue.jet]}
								shimmerStyle={styles.mediumText}
								LinearGradient={LinearGradient}
							/>
						</Block>
					)}
				</Block>
			))}
		</Block>
	);
};

export default ChannelListSkeleton;

const style = (colors: Attributes) =>
	StyleSheet.create({
		bigText: { marginBottom: size.s_10, height: size.s_30, width: '100%', borderRadius: size.s_8 },
		normalText: { marginTop: size.s_6, width: 200, marginBottom: size.s_10, height: size.s_24, borderRadius: size.s_8 },
		smallText: { marginLeft: size.s_20, width: 100, marginBottom: size.s_10, height: size.s_16, borderRadius: size.s_8 },
		mediumText: { marginLeft: size.s_20, width: 150, marginBottom: size.s_10, height: size.s_16, borderRadius: size.s_8 },
		avatar: { width: size.s_40, height: size.s_40, borderRadius: 50 }
	});
