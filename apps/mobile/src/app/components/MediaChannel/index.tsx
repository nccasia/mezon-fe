import { Block, Colors, Metrics, size, useAnimatedState, useTheme } from '@mezon/mobile-ui';
import { selectAttachmentPhoto } from '@mezon/store-mobile';
import { ApiMessageAttachment } from 'mezon-js/api.gen';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Platform, Dimensions, ScrollView, View } from 'react-native';
import { Flow } from 'react-native-animated-spinkit';
import { useSelector } from 'react-redux';
import EmptySearchPage from '../EmptySearchPage';
import { ImageListModal } from '../ImageListModal';
import { style } from './MediaChannel.styles';
import MediaItem from './MediaItem';

const MediaChannel = () => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const attachments = useSelector(selectAttachmentPhoto());
	const [imageSelected, setImageSelected] = useState<ApiMessageAttachment>();
	const [visibleImageModal, setVisibleImageModal] = useState<boolean>(false);
	const [idxSelectedImageModal, setIdxSelectedImageModal] = useAnimatedState<number>(0);
	const [visibleImageModalOverlay, setVisibleImageModalOverlay] = useState<boolean>(false);
	const timeOutRef = useRef(null);
	const widthScreen = Dimensions.get('screen').width;
	const widthImage = useMemo(() => {
		return (widthScreen - (size.s_10 * 2 + size.s_6 * 2)) / 3.45;
	}, [widthScreen]);

	const openImage = useCallback(
		(image: ApiMessageAttachment) => {
			setImageSelected(image);
			setIdxSelectedImageModal(0);
			setVisibleImageModal(true);
		},
		[setVisibleImageModal, setIdxSelectedImageModal],
	);

	const onImageModalChange = useCallback(
		(idx: number) => {
			setIdxSelectedImageModal(idx);
		},
		[setIdxSelectedImageModal],
	);

	const onImageFooterChange = useCallback(
		(idx: number) => {
			setVisibleImageModal(false);
			setVisibleImageModalOverlay(true);
			setIdxSelectedImageModal(idx);
			timeOutRef.current = setTimeout(() => {
				setVisibleImageModal(true);
			}, 50);
			timeOutRef.current = setTimeout(() => {
				setVisibleImageModalOverlay(false);
			}, 500);
		},
		[setIdxSelectedImageModal, setVisibleImageModal, setVisibleImageModalOverlay],
	);

	return (
		<View style={styles.wrapper}>
			<ScrollView
				style={{flex: 1}}
				contentContainerStyle={{ paddingBottom: size.s_50 }}
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.container}>
					{attachments?.length ? (
						attachments?.map((item, index) => (
							<Block height={widthImage} width={widthImage}>
								<MediaItem data={item} onPress={openImage} key={index} />
							</Block>
						))
					) : (
						<EmptySearchPage />
					)}
				</View>
			</ScrollView>
			{visibleImageModalOverlay && (
				<View style={styles.overlay}>
					<Flow size={size.s_34 * 2} color={Colors.bgViolet} />
				</View>
			)}
			{visibleImageModal ? (
				<ImageListModal
					visible={visibleImageModal}
					idxSelected={idxSelectedImageModal}
					onImageChange={onImageModalChange}
					onClose={() => setVisibleImageModal(false)}
					onImageChangeFooter={onImageFooterChange}
					imageSelected={imageSelected}
				/>
			) : null}
		</View>
	);
};

export default MediaChannel;
