import { useReference } from '@mezon/core';
import { CameraIcon, CheckIcon, PlayIcon } from '@mezon/mobile-components';
import { Colors, size, useTheme } from '@mezon/mobile-ui';
import { appActions, useAppDispatch } from '@mezon/store-mobile';
import { CameraRoll, PhotoIdentifier, iosRefreshGallerySelection, iosRequestReadWriteGalleryPermission } from '@react-native-camera-roll/camera-roll';
import { iosReadGalleryPermission } from '@react-native-camera-roll/camera-roll/src/CameraRollIOSPermission';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, Linking, PermissionsAndroid, Platform, TouchableOpacity, View } from 'react-native';
import RNFS from 'react-native-fs';
import { FlatList } from 'react-native-gesture-handler';
import * as ImagePicker from 'react-native-image-picker';
import { CameraOptions } from 'react-native-image-picker';
import { IFile } from '../../../../../../componentUI';
import { style } from './styles';
export const { height } = Dimensions.get('window');
interface IProps {
	onPickGallery: (files: IFile | any) => void;
	currentChannelId: string;
}

const Gallery = ({ onPickGallery, currentChannelId }: IProps) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const [photos, setPhotos] = useState<PhotoIdentifier[]>([]);
	const [pageInfo, setPageInfo] = useState(null);
	const [loading, setLoading] = useState(false);
	const dispatch = useAppDispatch();
	const timerRef = useRef<any>();
	const { removeAttachmentByIndex, attachmentFilteredByChannelId } = useReference(currentChannelId);

	const isDisableSelectAttachment = useMemo(() => {
		if (!attachmentFilteredByChannelId) return false;
		const { files } = attachmentFilteredByChannelId;
		return files?.length >= 10;
	}, [attachmentFilteredByChannelId]);

	useEffect(() => {
		checkAndRequestPermissions();

		return () => {
			timerRef?.current && clearTimeout(timerRef.current);
		};
	}, []);

	const checkAndRequestPermissions = async () => {
		const hasPermission = await requestPermission();
		if (hasPermission) {
			loadPhotos();
		} else {
			await requestPermission();
		}
	};

	const getCheckPermissionPromise = () => {
		if (Number(Platform.Version) >= 33) {
			return Promise.all([
				PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES),
				PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO)
			]).then(([hasReadMediaImagesPermission, hasReadMediaVideoPermission]) => hasReadMediaImagesPermission && hasReadMediaVideoPermission);
		} else {
			return PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
		}
	};

	const requestPermission = async () => {
		if (Platform.OS === 'android') {
			dispatch(appActions.setIsFromFCMMobile(true));
			const hasPermission = await getCheckPermissionPromise();
			if (hasPermission) {
				return true;
			}
			const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
			timerRef.current = setTimeout(() => dispatch(appActions.setIsFromFCMMobile(false)), 2000);
			if (granted === 'never_ask_again') {
				Alert.alert('Photo Permission', 'App needs access to your photo library', [
					{
						text: 'Cancel',
						style: 'cancel'
					},
					{
						text: 'OK',
						onPress: () => {
							openAppSettings();
						}
					}
				]);
			}

			return granted === PermissionsAndroid.RESULTS.GRANTED;
		} else if (Platform.OS === 'ios') {
			dispatch(appActions.setIsFromFCMMobile(true));
			const result = await iosReadGalleryPermission('readWrite');
			timerRef.current = setTimeout(() => dispatch(appActions.setIsFromFCMMobile(false)), 2000);
			if (result === 'not-determined' || result === 'denied') {
				const requestResult = await iosRequestReadWriteGalleryPermission();
				return requestResult === 'granted' || requestResult === 'limited';
			} else if (result === 'limited') {
				await iosRefreshGallerySelection();
			}
			return result === 'granted' || result === 'limited';
		}
		return false;
	};

	const openAppSettings = () => {
		if (Platform.OS === 'ios') {
			Linking.openURL('app-settings:');
		} else {
			Linking.openSettings();
		}
	};

	const loadPhotos = async (after = null) => {
		if (loading) return;

		setLoading(true);
		try {
			const res = await CameraRoll.getPhotos({
				first: 30,
				assetType: 'All',
				...(!!pageInfo && !!after && { after: after }),
				include: ['filename', 'fileSize', 'fileExtension', 'imageSize', 'orientation']
			});
			setPhotos(after ? [...photos, ...res.edges] : res.edges);
			setPageInfo(res.page_info);
		} catch (error) {
			console.log('Error loading photos', error);
		} finally {
			setLoading(false);
		}
	};

	const renderItem = ({ item }) => {
		if (item?.isUseCamera) {
			return (
				<TouchableOpacity style={[styles.cameraPicker]} onPress={onOpenCamera}>
					<CameraIcon color={themeValue.text} width={size.s_24} height={size.s_24} />
				</TouchableOpacity>
			);
		}
		const fileName = item?.node?.image?.filename;
		const isVideo = item?.node?.type?.startsWith?.('video');
		const isSelected = attachmentFilteredByChannelId?.files.some((file) => file.filename === fileName);
		const disabled = isDisableSelectAttachment && !isSelected;
		return (
			<TouchableOpacity
				style={[styles.itemGallery, disabled && styles.disable]}
				onPress={() => {
					if (isSelected) {
						handleRemove(fileName);
					} else {
						handleGalleryPress(item);
					}
				}}
				disabled={disabled}
			>
				<Image source={{ uri: item.node.image.uri, cache: 'force-cache' }} style={styles.imageGallery} />
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

	const handleGalleryPress = async (file: PhotoIdentifier) => {
		try {
			const image = file?.node?.image;
			const type = file?.node?.type;
			const name = file?.node?.image?.filename || file?.node?.image?.uri;
			const size = file?.node?.image?.fileSize;
			let filePath = image?.uri;

			if (Platform.OS === 'ios' && filePath.startsWith('ph://')) {
				const ms = new Date().getTime();
				const ext = image.extension;
				const destPath = `${RNFS.CachesDirectoryPath}/${ms}.${ext}`;

				if (type && type.startsWith('video')) {
					filePath = await RNFS.copyAssetsVideoIOS(filePath, destPath);
				} else {
					filePath = await RNFS.copyAssetsFileIOS(filePath, destPath, image.width, image.height);
				}
			}

			const fileFormat: IFile = {
				uri: filePath,
				type: Platform.OS === 'ios' ? `${file?.node?.type}/${image?.extension}` : file?.node?.type,
				size: size,
				name,
				fileData: filePath
			};

			onPickGallery(fileFormat);
		} catch (err) {
			console.log('Error: ', err);
		}
	};

	const onOpenCamera = async () => {
		const options = {
			durationLimit: 10000,
			mediaType: 'photo'
		};

		ImagePicker.launchCamera(options as CameraOptions, async (response) => {
			if (response.didCancel) {
				console.log('User cancelled camera');
			} else if (response.errorCode) {
				console.log('Camera Error: ', response.errorMessage);
			} else {
				const file = response.assets[0];

				const fileFormat: IFile = {
					uri: file?.uri,
					name: file?.fileName,
					type: file?.type,
					size: file?.fileSize,
					fileData: file?.uri
				};

				onPickGallery(fileFormat);
			}
		});
	};

	const handleLoadMore = async () => {
		if (pageInfo?.has_next_page) {
			await loadPhotos(pageInfo.end_cursor);
		}
	};

	const handleRemove = (filename: string) => {
		const index = attachmentFilteredByChannelId?.files?.findIndex((file) => file.filename === filename);
		removeAttachmentByIndex(currentChannelId, index);
	};

	return (
		<View style={{ flex: 1 }}>
			<FlatList
				data={[{ isUseCamera: true }, ...photos]}
				renderItem={renderItem}
				keyExtractor={(item, index) => `${index.toString()}_gallery`}
				numColumns={3}
				style={{
					maxHeight: height * 0.8
				}}
				onEndReached={handleLoadMore}
				onEndReachedThreshold={0.5}
				ListFooterComponent={() => loading && <ActivityIndicator size="small" color={themeValue.text} />}
			/>
		</View>
	);
};

export default Gallery;
