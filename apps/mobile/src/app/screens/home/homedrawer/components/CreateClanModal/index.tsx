import { useClans } from '@mezon/core';
import { AddIcon, save, setDefaultChannelLoader, STORAGE_CLAN_ID, UploadImage } from '@mezon/mobile-components';
import { Colors, useTheme } from '@mezon/mobile-ui';
import { channelsActions, clansActions, getStoreAsync, selectAllAccount, selectCurrentChannel } from '@mezon/store-mobile';
import { handleUploadFileMobile, useMezon } from '@mezon/transport';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Keyboard, KeyboardAvoidingView, Platform, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import RNFS from 'react-native-fs';
import * as ImagePicker from 'react-native-image-picker';
import { CameraOptions } from 'react-native-image-picker';
import { useSelector } from 'react-redux';
import { MezonButton, MezonInput, MezonModal } from '../../../../../temp-ui';
import { validInput } from '../../../../../utils/validate';
import { IFile } from '../AttachmentPicker/Gallery';
import { style } from './CreateClanModal.styles';

interface ICreateClanProps {
	visible: boolean;
	setVisible: (value: boolean) => void;
}
const CreateClanModal = ({ visible, setVisible }: ICreateClanProps) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const userProfile = useSelector(selectAllAccount);
	const [nameClan, setNameClan] = useState<string>('');
	const [urlImage, setUrlImage] = useState('');
	const [isCheckValid, setIsCheckValid] = useState<boolean>();
	const currentChannel = useSelector(selectCurrentChannel);
	const { t } = useTranslation(['clan']);
	const { sessionRef, clientRef } = useMezon();
	const { createClans } = useClans();
	const handleCreateClan = async () => {
		const store = await getStoreAsync();
		createClans(nameClan?.trim?.(), urlImage).then(async (res) => {
			if (res && res?.clan_id) {
				store.dispatch(clansActions.joinClan({ clanId: res?.clan_id }));
				save(STORAGE_CLAN_ID, res?.clan_id);
				store.dispatch(clansActions.changeCurrentClan({ clanId: res?.clan_id }));
				const respChannel = await store.dispatch(channelsActions.fetchChannels({ clanId: res?.clan_id, noCache: true }));
				await setDefaultChannelLoader(respChannel.payload, res?.clan_id);
				setVisible(false);
			}
		});
	};

	useEffect(() => {
		setIsCheckValid(validInput(nameClan));
	}, [nameClan]);

	useEffect(() => {
		if (!visible) {
			setUrlImage('');
			setNameClan('');
		}
	}, [visible]);

	const onOpen = async () => {
		const options = {
			durationLimit: 10000,
			mediaType: 'photo',
		};

		ImagePicker.launchImageLibrary(options as CameraOptions, async (response) => {
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
				handleFile([fileFormat][0]);
			}
		});
	};

	const handleFile = async (file: IFile | any) => {
		const session = sessionRef.current;
		const client = clientRef.current;
		if (!file || !client || !session) {
			throw new Error('Client or files are not initialized');
		}
		const res = await handleUploadFileMobile(client, session, currentChannel?.clan_id, currentChannel?.channel_id, file.name, file);
		if (!res.url) return;
		setUrlImage(res.url);
	};

	return (
		<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
			<MezonModal
				visible={visible}
				visibleChange={(visible) => {
					setVisible(visible);
				}}
				headerStyles={styles.headerModal}
			>
				<TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
					<View style={styles.wrapperCreateClanModal}>
						<Text style={styles.headerTitle}>{t('title')}</Text>
						<Text style={styles.headerSubTitle}>{t('subTitle')}</Text>
						<View style={styles.boxImage}>
							<TouchableOpacity style={styles.uploadImage} onPress={onOpen}>
								{!urlImage ? (
									<View style={[styles.uploadCreateClan]}>
										<AddIcon style={styles.addIcon} height={30} width={30} color={Colors.bgButton} />
										<UploadImage height={20} width={20} color={Colors.bgGrayLight} />
										<Text style={styles.uploadText}>{t('upload')}</Text>
									</View>
								) : (
									<View style={[styles.uploadCreateClan, styles.overflowImage]}>
										<Image source={{ uri: urlImage }} style={styles.image} />
									</View>
								)}
							</TouchableOpacity>
						</View>

						<MezonInput
							label={t('clanName')}
							onTextChange={setNameClan}
							placeHolder={`${userProfile?.user?.username}'s clan`}
							value={nameClan}
							maxCharacter={64}
							errorMessage={t('errorMessage')}
						/>

						<Text style={styles.community}>
							{t('byCreatingClan')} <Text style={styles.communityGuideLines}>Community Guidelines.</Text>
						</Text>
						<MezonButton disabled={!isCheckValid} viewContainerStyle={styles.button} onPress={handleCreateClan}>
							<Text style={styles.buttonText}>{t('createServer')}</Text>
						</MezonButton>
					</View>
				</TouchableWithoutFeedback>
			</MezonModal>
		</KeyboardAvoidingView>
	);
};

export default CreateClanModal;
