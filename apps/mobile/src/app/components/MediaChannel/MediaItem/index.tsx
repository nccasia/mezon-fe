import { Block } from '@mezon/mobile-ui';
import { AttachmentEntity, selectMemberByUserId } from '@mezon/store-mobile';
import { Video as ExpoVideo, ResizeMode } from 'expo-av';
import React, { useCallback, useMemo } from 'react';
import { TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useSelector } from 'react-redux';
import MezonAvatar from '../../../temp-ui/MezonAvatar';
import { isImage, isVideo } from '../../../utils/helpers';
import styles from './MediaItem.styles';

interface IMediaItemProps {
	data: AttachmentEntity;
	onPress: (item: AttachmentEntity) => void;
}
const MediaItem = React.memo(({ data, onPress }: IMediaItemProps) => {
	const checkIsVideo = useMemo(() => isVideo(data?.url), [data?.url]);
	const checkIsImage = useMemo(() => isImage(data?.url), [data?.url]);
	const uploader = useSelector(selectMemberByUserId(data?.uploader || ''));
	const handlePress = useCallback(() => {
		onPress(data);
	}, [onPress, data]);
	return (
		<TouchableOpacity onPress={handlePress} style={styles.containerItem}>
			<Block style={styles.boxAvatar}>
				<MezonAvatar height={25} width={25} username={uploader?.user?.username} avatarUrl={uploader?.user?.avatar_url}></MezonAvatar>
			</Block>
			{checkIsImage ? <FastImage style={styles.image} source={{ uri: data?.url }} resizeMode="cover" /> : null}
			{checkIsVideo ? (
				<ExpoVideo
					onError={(err) => {
						console.log('*** load error', err);
					}}
					source={{
						uri: data?.url,
					}}
					useNativeControls={false}
					resizeMode={ResizeMode.CONTAIN}
					rate={1.0}
					style={styles.video}
				/>
			) : null}
		</TouchableOpacity>
	);
});

export default MediaItem;
