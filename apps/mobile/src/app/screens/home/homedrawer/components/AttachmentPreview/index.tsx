import { abbreviateText, CloseIcon, FileIcon, PlayIcon } from '@mezon/mobile-components';
import { Colors, size, verticalScale } from '@mezon/mobile-ui';
import { ApiMessageAttachment } from 'mezon-js/api.gen';
import React from 'react';
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import colors from 'tailwindcss/colors';
import styles from './styles';

interface IProps {
	attachments: ApiMessageAttachment[];
	onRemove: (url: string, filename: string) => void;
}

const AttachmentPreview = ({ attachments, onRemove }: IProps) => {
	const renderFileView = (attachment: ApiMessageAttachment) => {
		const splitFiletype = attachment.filetype.split('/');
		const type = splitFiletype[splitFiletype.length - 1];
		return (
			<View style={styles.fileViewer}>
				<FileIcon width={verticalScale(30)} height={verticalScale(30)} color={Colors.bgViolet} />
				<View style={{ maxWidth: '75%' }}>
					<Text style={styles.fileName} numberOfLines={1}>
						{abbreviateText(attachment.filename)}
					</Text>
					<Text style={styles.typeFile} numberOfLines={1}>
						{type}
					</Text>
				</View>
			</View>
		);
	};
	return (
		<ScrollView
			horizontal
			style={styles.container}
			showsHorizontalScrollIndicator={false}
			contentContainerStyle={{ paddingRight: verticalScale(20) }}
		>
			{attachments.map((attachment, index) => {
				const isFile = !attachment.filetype.includes('video') && !attachment.filetype.includes('image');
				const isVideo = attachment.filetype.includes('video');
				const isUploaded = !!attachment?.size;
				return (
					<View key={index + attachment.filename} style={styles.attachmentItem}>
						{isFile ? renderFileView(attachment) : <Image source={{ uri: attachment.url }} style={styles.attachmentItemImage} />}
						{isUploaded && (
							<TouchableOpacity
								style={styles.iconClose}
								activeOpacity={0.8}
								onPress={() => onRemove(attachment.url ?? '', attachment?.filename || '')}
							>
								<CloseIcon width={size.s_18} height={size.s_18} color={colors.black} />
							</TouchableOpacity>
						)}
						{(isVideo || !isUploaded) && (
							<View style={styles.videoOverlay}>
								{!isUploaded ? (
									<ActivityIndicator size={'small'} color={'white'} />
								) : (
									<PlayIcon width={size.s_20} height={size.s_20} />
								)}
							</View>
						)}
					</View>
				);
			})}
		</ScrollView>
	);
};

export default AttachmentPreview;
