import { CameraIcon, CheckIcon, PlayIcon } from '@mezon/mobile-components';
import { Colors, size, useTheme } from '@mezon/mobile-ui';
import { appActions, referencesActions, selectAttachmentData, selectCurrentClanId, useAppDispatch } from '@mezon/store-mobile';
import { createUploadFilePath, useMezon } from '@mezon/transport';
import { CameraRoll, iosReadGalleryPermission, iosRequestReadWriteGalleryPermission, PhotoIdentifier } from '@react-native-camera-roll/camera-roll';
import { IFile } from 'apps/mobile/src/app/temp-ui';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, FlatList, Image, Linking, PermissionsAndroid, Platform, Text, TouchableOpacity, View } from 'react-native';
import RNFS from 'react-native-fs';
import * as ImagePicker from 'react-native-image-picker';
import { CameraOptions } from 'react-native-image-picker';
import { useSelector } from 'react-redux';
import { style } from './styles';
interface IProps {
	onPickGallery: (files: IFile | any) => void;
	currentChannelId: string;
}

interface IRenderItem {
	isUseCamera: boolean;
}

const Gallery = ({ onPickGallery, currentChannelId }: IProps) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const [photos, setPhotos] = useState<PhotoIdentifier[]>([]);
	const [pageInfo, setPageInfo] = useState(null);
	const [loading, setLoading] = useState(false);
	const attachmentDataRef = useSelector(selectAttachmentData(currentChannelId || ''));
	const currentClanId = useSelector(selectCurrentClanId);
	const { sessionRef } = useMezon();
	const session = sessionRef.current;
	const dispatch = useAppDispatch();
	const timerRef = useRef<any>();

	const attachmentsFileName = useMemo(() => {
		if (!attachmentDataRef?.length) return [];
		return attachmentDataRef.map((attachment) => attachment.filename);
	}, [attachmentDataRef]);

	useEffect(() => {
		checkAndRequestPermissions();

		return () => {
			timerRef?.current && clearTimeout(timerRef.current);
		};
	}, []);

	const getFullFileName = useCallback(
		(fileName: string) => {
			return createUploadFilePath(session, currentClanId, currentChannelId, fileName);
		},
		[currentChannelId, currentClanId, session],
	);

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
				PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO),
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
						style: 'cancel',
					},
					{
						text: 'OK',
						onPress: () => {
							openAppSettings();
						},
					},
				]);
			}

			return granted === PermissionsAndroid.RESULTS.GRANTED;
		} else if (Platform.OS === 'ios') {
			dispatch(appActions.setIsFromFCMMobile(true));
			const result = await iosReadGalleryPermission('addOnly');
			timerRef.current = setTimeout(() => dispatch(appActions.setIsFromFCMMobile(false)), 2000);
			if (result === 'not-determined') {
				const requestResult = await iosRequestReadWriteGalleryPermission();
				return requestResult === 'granted' || requestResult === 'limited';
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
				first: 10,
				assetType: 'All',
				...(!!pageInfo && !!after && { after: after }),
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

	function removeAttachmentByUrl(indexOfItem) {
		dispatch(
			referencesActions.removeAttachment({
				channelId: currentChannelId,
				index: indexOfItem,
			}),
		);
	}

	const renderItem = ({ item: node, index }: { item: PhotoIdentifier | IRenderItem, index: number }) => {
		if ((node as IRenderItem).isUseCamera) {
			return (
				<TouchableOpacity style={styles.cameraPicker} onPress={onOpenCamera}>
					<CameraIcon color={themeValue.text} width={size.s_24} height={size.s_24} />
				</TouchableOpacity>
			);
		}
		const item = node as PhotoIdentifier;
		const fileName = item?.node?.image?.filename || item?.node?.image?.uri;
		const isVideo = item?.node?.type?.startsWith?.('video');
		const isSelected = attachmentsFileName?.some((i) => i?.includes(getFullFileName(fileName)));

		return (
			<TouchableOpacity
				style={styles.itemGallery}
				onPress={() => {
					if (isSelected) {
						const infoAttachment = attachmentDataRef?.find?.((attachment) => attachment?.filename === getFullFileName(fileName));
						removeAttachmentByUrl(attachmentDataRef.indexOf(infoAttachment));
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

	const handleGalleryPress = async (file: PhotoIdentifier) => {
		try {
			const image = file?.node?.image;
			const type = file?.node?.type;
			const size = file?.node?.image?.fileSize;
			const filename = file?.node?.image?.filename || file?.node?.image?.uri;
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

			dispatch(
				referencesActions.setAttachmentData({
					channelId: currentChannelId,
					attachments: [
						{
							url: filePath,
							filename,
							filetype: type,
							size
						},
					],
				}),
			);
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

				dispatch(
					referencesActions.setAttachmentData({
						channelId: currentChannelId,
						attachments: [
							{
								url: file?.uri,
								filename: file?.fileName || file?.uri,
								filetype: file?.type,
								size: file?.fileSize,
							},
						],
					}),
				);
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
			<FlatList
				data={[{ isUseCamera: true }, ...photos]}
				// @ts-check
				renderItem={renderItem}
				keyExtractor={(item, index) => `${index.toString()}_gallery`}
				numColumns={3}
				onEndReached={handleLoadMore}
				onEndReachedThreshold={0.5}
				ListFooterComponent={() => loading && <Text style={{ color: themeValue.text }}>Loading...</Text>}
			/>
		</View>
	);
};

export default Gallery;
