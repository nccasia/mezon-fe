import { useClans } from '@mezon/core';
import { AddIcon, UploadImage } from '@mezon/mobile-components';
import { Colors } from '@mezon/mobile-ui';
import { clansActions, getStoreAsync, selectAllAccount, selectCurrentChannel } from '@mezon/store-mobile';
import { handleUploadFileMobile, useMezon } from '@mezon/transport';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import RNFS from 'react-native-fs';
import * as ImagePicker from 'react-native-image-picker';
import { CameraOptions } from 'react-native-image-picker';
import { useSelector } from 'react-redux';
import { MezonButton, MezonModal } from '../../../../../temp-ui';
import { IFile } from '../AttachmentPicker/Gallery';
import { styles as s } from './CreateClanModal.styles';

interface ICreateClanProps {
	visible: boolean;
	setVisible: (value: boolean) => void;
}
const CreateClanModal = ({ visible, setVisible }: ICreateClanProps) => {
	const [nameClan, setNameClan] = useState<string>('');
	const [urlImage, setUrlImage] = useState('');
	const currentChannel = useSelector(selectCurrentChannel);
	const { t } = useTranslation(['clan']);
	const userProfile = useSelector(selectAllAccount);
	const { sessionRef, clientRef } = useMezon();
	const { createClans } = useClans();
	const handleCreateClan = async () => {
		const store = await getStoreAsync();
		createClans(nameClan, urlImage).then((res) => {
			if (res && res.clan_id) {
				store.dispatch(clansActions.changeCurrentClan({ clanId: res.clan_id }));
				setVisible(false);
			}
		});
	};

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
		const ms = new Date().getTime();
		const fullFilename = `${currentChannel?.clan_id}/${currentChannel?.channel_id}/${ms}`.replace(/-/g, '_') + '/' + file.name;
		const res = await handleUploadFileMobile(client, session, fullFilename, file);
		if (!res.url) return;
		setUrlImage(res.url);
	};

	return (
		<MezonModal
			visible={visible}
			visibleChange={(visible) => {
				setVisible(visible);
			}}
			headerStyles={s.headerModal}
		>
			<View style={s.wrapperCreateClanModal}>
				<Text style={s.headerTitle}>{t('title')}</Text>
				<Text style={s.headerSubTitle}>{t('subTitle')}</Text>
				<View>
					<TouchableOpacity style={s.uploadImage} onPress={onOpen}>
						{!urlImage ? (
							<View style={[s.uploadCreateClan]}>
								<AddIcon style={s.addIcon} height={30} width={30} color={Colors.bgButton} />
								<UploadImage height={20} width={20} color={Colors.bgGrayLight} />
								<Text style={s.uploadText}>{t('upload')}</Text>
							</View>
						) : (
							<View style={[s.uploadCreateClan, s.overflowImage]}>
								<Image source={{ uri: urlImage }} style={s.image} />
							</View>
						)}
					</TouchableOpacity>
				</View>

				<Text style={s.serverName}>{t('clanName')}</Text>
				<TextInput
					style={s.input}
					onChangeText={(text) => {
						setNameClan(text);
					}}
					placeholder={`${userProfile?.user?.username}'s clan`}
					placeholderTextColor={Colors.textGray}
					value={nameClan}
					clearButtonMode={'always'}
				/>
				<Text style={s.community}>
					{t('byCreatingClan')} <Text style={s.communityGuideLines}>Community Guidelines.</Text>
				</Text>
				<MezonButton disabled={!nameClan} viewContainerStyle={s.button} onPress={handleCreateClan}>
					<Text style={s.buttonText}>{t('createServer')}</Text>
				</MezonButton>
			</View>
		</MezonModal>
	);
};

export default CreateClanModal;
