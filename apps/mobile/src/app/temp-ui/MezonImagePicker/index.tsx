import { Icons } from '@mezon/mobile-components';
import { useTheme } from '@mezon/mobile-ui';
import { selectCurrentChannel } from '@mezon/store-mobile';
import { handleUploadFileMobile, useMezon } from '@mezon/transport';
import { setTimeout } from '@testing-library/react-native/build/helpers/timers';
import { memo, useEffect, useRef, useState } from 'react';
import { DimensionValue, Platform, StyleProp, Text, View, ViewStyle } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { openCropper } from 'react-native-image-crop-picker';
import { launchImageLibrary } from 'react-native-image-picker';
import { useSelector } from 'react-redux';
import MezonClanAvatar from '../MezonClanAvatar';
import { style as _style } from './styles';

export interface IFile {
	uri: string;
	name: string;
	type: string;
	size: string;
	fileData: any;
}

interface IMezonImagePickerProps {
	onChange?: (file: any) => void;
	onLoad?: (url: string) => void;
	defaultValue: string;
	height?: DimensionValue;
	width?: DimensionValue;
	rounded?: boolean;
	showHelpText?: boolean;
	autoUpload?: boolean;
	alt?: string;
	style?: StyleProp<ViewStyle>;
	defaultColor?: string;
	penPosition?: {
		top?: number;
		left?: number;
		right?: number;
		bottom?: number;
	},
	noDefaultText?: boolean;
}

export default memo(function MezonImagePicker({
	onChange,
	onLoad,
	defaultValue,
	height = 60,
	width = 60,
	showHelpText,
	autoUpload = false,
	rounded = false,
	alt,
	style,
	defaultColor,
	penPosition = {
		bottom: undefined,
		top: -7,
		left: undefined,
		right: -7
	},
	noDefaultText
}: IMezonImagePickerProps) {
	const { themeValue } = useTheme();
	const styles = _style(themeValue);
	const [image, setImage] = useState<string>(defaultValue);
	const currentChannel = useSelector(selectCurrentChannel);
	const { sessionRef, clientRef } = useMezon();
	const timerRef = useRef<any>(null);

  useEffect(()=>{
    setImage(defaultValue)
  },[defaultValue])

	useEffect(() => {
		return () => {
			timerRef?.current && clearTimeout(timerRef.current);
		};
	}, []);

	async function handleSelectImage() {
		const response = await launchImageLibrary({
			mediaType: 'photo',
			includeBase64: true,
		});

		if (response.didCancel) {
			console.log('User cancelled camera');
		} else if (response.errorCode) {
			console.log('Camera Error: ', response.errorMessage);
		} else {
			const file = response.assets[0];
			return {
				uri: file?.uri,
				name: file?.fileName,
				type: file?.type,
				size: file?.fileSize?.toString(),
				fileData: file?.base64,
			} as IFile;
		}
	}

	async function handleUploadImage(file: IFile) {
		const session = sessionRef.current;
		const client = clientRef.current;

		if (!file || !client || !session) {
			throw new Error('Client is not initialized');
		}
		const ms = new Date().getTime();
		const fullFilename = `${currentChannel?.clan_id}/${currentChannel?.channel_id}/${ms}`.replace(/-/g, '_') + '/' + file.name;
		const res = await handleUploadFileMobile(client, session, fullFilename, file);
		return res.url;
	}

	async function handleImage() {
		const file = await handleSelectImage();
		if (file) {
			timerRef.current = setTimeout(
				async () => {
					const croppedFile = await openCropper({
						path: file.uri,
						mediaType: 'photo',
						includeBase64: true,
						compressImageQuality: 1,
					});
					setImage(croppedFile.path);
					onChange && onChange(croppedFile);
					if (autoUpload) {
						const uploadImagePayload = {
							fileData: croppedFile?.data,
							name: file.name,
							uri: croppedFile.path,
							size: croppedFile.size.toString(),
							type: croppedFile.mime,
						} as IFile;
						const url = await handleUploadImage(uploadImagePayload);
						if (url) {
							onLoad && onLoad(url);
						}
					}
				},
				Platform.OS === 'ios' ? 500 : 0,
			);
		}
	}

	return (
		<TouchableOpacity onPress={() => handleImage()}>
			<View style={styles.bannerContainer}>
				<View style={[styles.bannerWrapper, { height, width }, rounded && { borderRadius: 999 }, style]}>
					{image || !showHelpText ? (
						<MezonClanAvatar
							image={image}
							alt={alt}
							defaultColor={defaultColor}
							noDefaultText={noDefaultText}
						/>
					) : (
						<Text style={styles.textPlaceholder}>Choose an image</Text>
					)}
				</View>

				<View style={[styles.btnWrapper, penPosition && { top: penPosition.top, bottom: penPosition.bottom, left: penPosition.left, right: penPosition.right }]}>
					<Icons.PencilIcon height={12} width={12} color={themeValue.text} />
				</View>
			</View>
		</TouchableOpacity>
	);
});
