import { Block, size, useTheme } from '@mezon/mobile-ui';
import { AttachmentEntity, selectAttachmentPhoto } from '@mezon/store-mobile';
import { memo, useCallback, useMemo, useState } from 'react';
import { Dimensions, Platform, ScrollView, View } from 'react-native';
import { useSelector } from 'react-redux';
import { EmptySearchPage } from '../EmptySearchPage';
import { ImageListModal } from '../ImageListModal';
import { style } from './MediaChannel.styles';
import { MediaItem } from './MediaItem';

const MediaChannel = memo(() => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const attachments = useSelector(selectAttachmentPhoto());
	const [imageSelected, setImageSelected] = useState<AttachmentEntity>();
	const [visibleImageModal, setVisibleImageModal] = useState<boolean>(false);
	const widthScreen = Dimensions.get('screen').width;
	const widthImage = useMemo(() => {
		return (widthScreen - (size.s_10 * 2 + size.s_6 * 2)) / (Platform.OS === 'ios' ? 3.45 : 2.9);
	}, [widthScreen]);

	const openImage = useCallback(
		(image: AttachmentEntity) => {
			setImageSelected(image);
			setVisibleImageModal(true);
		},
		[setVisibleImageModal]
	);

	const onCloseModalImage = useCallback(() => {
		setVisibleImageModal(false);
	}, []);
	return (
		<View style={styles.wrapper}>
			<ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: size.s_50 }} showsVerticalScrollIndicator={false}>
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
			{visibleImageModal && <ImageListModal visible={visibleImageModal} onClose={onCloseModalImage} imageSelected={imageSelected} />}
		</View>
	);
});

export default MediaChannel;
