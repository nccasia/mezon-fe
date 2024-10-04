import { appActions, useAppDispatch } from '@mezon/store';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { useCallback } from 'react';
import { Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import RNFetchBlob from 'rn-fetch-blob';

export function useImage() {
	const dispatch = useAppDispatch();

	const downloadImage = useCallback(
		async (imageUrl: string, type: string) => {
			try {
				const response = await RNFetchBlob.config({
					fileCache: true,
					appendExt: type
				}).fetch('GET', imageUrl);

				if (response.info().status === 200) {
					const filePath = response.path();
					return filePath;
				} else {
					console.error('Error downloading image:', response.info());
					return null;
				}
			} catch (error) {
				console.error('Error downloading image:', error);
			} finally {
				dispatch(appActions.setLoadingMainMobile(false));
			}
		},
		[dispatch]
	);

	const saveImageToCameraRoll = useCallback(
		async (filePath: string, type: string) => {
			try {
				await CameraRoll.save(filePath, { type: type === 'video' ? 'video' : 'photo' });

				Toast.show({
					text1: 'Save successfully',
					type: 'info'
				});
			} catch (err) {
				Toast.show({
					text1: 'Error saving image',
					type: 'error'
				});
			} finally {
				if (Platform.OS === 'android') {
					await RNFetchBlob.fs.unlink(filePath);
				}
				dispatch(appActions.setLoadingMainMobile(false));
			}
		},
		[dispatch]
	);

	return {
		downloadImage,
		saveImageToCameraRoll
	};
}
