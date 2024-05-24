import { useReference } from '@mezon/core';
import { CameraIcon, CheckIcon, PlayIcon } from '@mezon/mobile-components';
import { Colors, size } from '@mezon/mobile-ui';
import { CameraRoll, iosReadGalleryPermission, iosRequestReadWriteGalleryPermission } from '@react-native-camera-roll/camera-roll';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, FlatList, Image, PermissionsAndroid, Platform, Text, TouchableOpacity, View } from 'react-native';
import RNFS from 'react-native-fs';
import * as ImagePicker from 'react-native-image-picker';
import { CameraOptions } from 'react-native-image-picker';
import { styles } from './styles';
interface IProps {
	onPickGallery: (files: IFile | any) => void;
}

export interface IFile {
	uri: string;
	name: string;
	type: string;
	size: string;
	fileData: any;
}
const Gallery = ({ onPickGallery }: IProps) => {
	const [photos, setPhotos] = useState([]);
	const [pageInfo, setPageInfo] = useState(null);
	const [loading, setLoading] = useState(false);
	const [permissionGranted, setPermissionGranted] = useState(false);
	const { attachmentDataRef, setAttachmentData } = useReference();

	const attachmentsFileName = useMemo(() => {
		if (!attachmentDataRef?.length) return [];
		return attachmentDataRef.map((attachment) => attachment.filename);
	}, [attachmentDataRef]);

	useEffect(() => {
		checkAndRequestPermissions();
	}, []);

	const checkAndRequestPermissions = async () => {
		const hasPermission = await requestPermission();
		setPermissionGranted(hasPermission);
		if (hasPermission) {
			loadPhotos();
		} else {
			Alert.alert('Permission Denied', 'App needs access to your came podra roll to function properly.');
		}
	};

	const requestPermission = async () => {
		if (Platform.OS === 'android') {
			const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE, {
				title: 'Permission to access camera roll',
				message: 'App needs access to your camera roll',
				buttonPositive: 'OK',
			});
			return granted === PermissionsAndroid.RESULTS.GRANTED;
		} else if (Platform.OS === 'ios') {
			const result = await iosReadGalleryPermission('addOnly');
			if (result === 'not-determined') {
				const requestResult = await iosRequestReadWriteGalleryPermission();
				return requestResult === 'granted' || requestResult === 'limited';
			}
			return result === 'granted' || result === 'limited';
		}
		return false;
	};

	const loadPhotos = async (after = null) => {
		if (loading) return;

		setLoading(true);
		try {
			const res = await CameraRoll.getPhotos({
				first: 10,
				assetType: 'All',
				after,
				include: ['filename', 'fileSize', 'fileExtension', 'imageSize', 'orientation'],
			});
			setPhotos(after ? [...photos, ...res.edges] : res.edges);
			setPageInfo(res.page_info);
		} catch (error) {
			console.log('Error loading photos', error);
		} finally {
			setLoading(false);
		}
	};

	function removeAttachmentByUrl(urlToRemove: string, fileName: string) {
		const removedAttachment = attachmentDataRef.filter((attachment) => {
			if (attachment?.url === urlToRemove) {
				return false;
			}
			return !(fileName && attachment?.filename === fileName);
		});

		setAttachmentData(removedAttachment);
	}

	const renderItem = ({ item }) => {
		if (item?.isUseCamera) {
			return (
				<TouchableOpacity style={styles.cameraPicker} onPress={onOpenCamera}>
					<CameraIcon color={Colors.textGray} width={size.s_24} height={size.s_24} />
				</TouchableOpacity>
			);
		}
		const fileName = item?.node?.image?.filename || item?.node?.image?.uri;
		const isVideo = item?.node?.type?.startsWith?.('video');
		const isSelected = attachmentsFileName?.includes(fileName);

		return (
			<TouchableOpacity
				style={styles.itemGallery}
				onPress={() => {
					if (isSelected) {
						const infoAttachment = attachmentDataRef?.find?.((attachment) => attachment?.filename === fileName);
						removeAttachmentByUrl(infoAttachment.url, infoAttachment?.filename);
					} else {
						handleGalleryPress(item);
					}
				}}
			>
				<Image source={{ uri: item.node.image.uri }} style={styles.imageGallery} />
				{isVideo && (
					<View style={styles.videoOverlay}>
						<PlayIcon width={size.s_20} height={size.s_20} />
					</View>
				)}
				{isSelected && (
					<View style={styles.iconSelected}>
						<CheckIcon color={Colors.bgViolet} />
					</View>
				)}
				{isSelected && <View style={styles.selectedOverlay} />}
			</TouchableOpacity>
		);
	};

	const handleGalleryPress = async (file: any) => {
		try {
			const image = file?.node?.image;
			let filePath = image?.uri;
			if (Platform.OS === 'ios' && filePath.startsWith('ph://')) {
				const appleId = filePath.substring(5, 41);
				const ext = image.extension;
				const destPath = `${RNFS.CachesDirectoryPath}/${appleId}.${ext}`;
				filePath = await RNFS.copyAssetsFileIOS(filePath, destPath, image.width, image.height);
			}
			const fileData = await RNFS.readFile(filePath, 'base64');

			const fileFormat: IFile = {
				uri: filePath,
				name: image?.filename || image?.uri,
				type: Platform.OS === 'ios' ? `${file?.node?.type}/${image?.extension}` : file?.node?.type,
				size: image?.fileSize,
				fileData,
			};
			setAttachmentData({
				url: filePath,
				filename: image?.filename || image?.uri,
				filetype: Platform.OS === 'ios' ? `${file?.node?.type}/${image?.extension}` : file?.node?.type,
			});
			onPickGallery([fileFormat]);
		} catch (err) {
			console.log('Error: ', err);
		}
	};

	const onOpenCamera = async () => {
		const options = {
			durationLimit: 10000,
			mediaType: 'photo',
		};

		ImagePicker.launchCamera(options as CameraOptions, async (response) => {
			if (response.didCancel) {
				console.log('User cancelled camera');
			} else if (response.errorCode) {
				console.log('Camera Error: ', response.errorMessage);
			} else {
				const file = response.assets[0];
				const fileData = await RNFS.readFile(file.uri, 'base64');

				const fileFormat: IFile = {
					uri: file?.uri,
					name: file?.fileName,
					type: file?.type,
					size: file?.fileSize?.toString(),
					fileData,
				};
				onPickGallery([fileFormat]);
			}
		});
	};

	const handleLoadMore = async () => {
		if (pageInfo?.has_next_page) {
			await loadPhotos(pageInfo.end_cursor);
		}
	};

	return (
		<View style={{ flex: 1 }}>
			{permissionGranted ? (
				<FlatList
					data={[{ isUseCamera: true }, ...photos]}
					renderItem={renderItem}
					keyExtractor={(item, index) => `${index.toString()}_gallery`}
					numColumns={3}
					onEndReached={handleLoadMore}
					onEndReachedThreshold={0.5}
					ListFooterComponent={() => loading && <Text>Loading...</Text>}
				/>
			) : (
				<View style={styles.wrapperRequesting}>
					<Text style={styles.titleRequesting}>Requesting permission to access photos...</Text>
				</View>
			)}
		</View>
	);
};

export default Gallery;
