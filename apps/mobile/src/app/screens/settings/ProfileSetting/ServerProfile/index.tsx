import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useAuth, useClanProfileSetting } from '@mezon/core';
import { CheckIcon, Icons } from '@mezon/mobile-components';
import { Text, useTheme } from '@mezon/mobile-ui';
import { ClansEntity, selectAllClans, selectCurrentClan } from '@mezon/store-mobile';
import { handleUploadFileMobile, useMezon } from '@mezon/transport';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Dimensions, FlatList, Keyboard, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';
import { EProfileTab, IClanProfileValue } from '..';
import { SeparatorWithLine } from '../../../../../app/components/Common';
import { IFile, MezonBottomSheet, MezonClanAvatar, MezonInput } from '../../../../../app/temp-ui';
import { normalizeString } from '../../../../utils/helpers';
import BannerAvatar from '../UserProfile/components/Banner';
import { style } from './styles';

interface IServerProfile {
	triggerToSave: EProfileTab;
	clanProfileValue: IClanProfileValue;
	isClanProfileNotChanged?: boolean;
	setDefaultValue: (clanProfileValue: IClanProfileValue) => void;
	setCurrentClanProfileValue: (updateFn: (prevValue: IClanProfileValue) => IClanProfileValue) => void;
}

export default function ServerProfile({
	triggerToSave,
	clanProfileValue,
	isClanProfileNotChanged,
	setDefaultValue,
	setCurrentClanProfileValue,
}: IServerProfile) {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const { userProfile, userId } = useAuth();
	const { sessionRef, clientRef } = useMezon();
	const bottomSheetDetail = useRef<BottomSheetModal>(null);
	const { t } = useTranslation(['profileSetting']);
	const clans = useSelector(selectAllClans);
	const currentClan = useSelector(selectCurrentClan);
	const [selectedClan, setSelectedClan] = useState<ClansEntity>(currentClan);
	const { clanProfile, updateUserClanProfile } = useClanProfileSetting({ clanId: selectedClan?.id });
	const [file, setFile] = useState<IFile>(null);
	const navigation = useNavigation();
	const [searchClanText, setSearchClanText] = useState('');

	const openBottomSheet = () => {
		bottomSheetDetail.current?.present();
	};

	useEffect(() => {
		if (clanProfile?.id) {
			const defaultValue: IClanProfileValue = {
				username: userProfile?.user?.username,
				displayName: clanProfile?.nick_name,
				imgUrl: clanProfile?.avartar,
			};

			setDefaultValue(defaultValue);
		}
	}, [clanProfile, setDefaultValue, userProfile?.user?.username]);

	const onPressHashtag = () => {
		Toast.show({
			type: 'info',
			text1: 'Original known as ' + userProfile?.user?.username + '#' + userId,
		});
	};

	const onValueChange = (newValue: Partial<IClanProfileValue>) => {
		setCurrentClanProfileValue((prevValue) => ({ ...prevValue, ...newValue }));
	};

	const switchClan = (clan: ClansEntity) => {
		if (isClanProfileNotChanged) {
			setSelectedClan(clan);
			return;
		}

		Alert.alert(
			t('changedAlert.title'),
			t('changedAlert.description'),
			[
				{
					text: t('changedAlert.keepEditing'),
					style: 'cancel',
				},
				{
					text: t('changedAlert.discard'),
					onPress: () => setSelectedClan(clan),
				},
			],
			{ cancelable: false },
		);
	};

	useEffect(() => {
		if (triggerToSave === EProfileTab.ClanProfile) {
			handleUpdateClanProfile();
		}
	}, [triggerToSave]);

	const getImageUrlToSave = useCallback(async () => {
		if (!file) {
			return clanProfileValue?.imgUrl;
		}
		const session = sessionRef.current;
		const client = clientRef.current;

		if (!file || !client || !session) {
			throw new Error('Client is not initialized');
		}
		const ms = new Date().getTime();
		const fullFilename = `${selectedClan?.clan_id}/${clanProfileValue?.username}/${ms}`.replace(/-/g, '_') + '/' + file.name;
		const res = await handleUploadFileMobile(client, session, fullFilename, file);

		return res.url;
	}, [clientRef, sessionRef, file, clanProfileValue, selectedClan?.clan_id]);

	const handleUpdateClanProfile = async () => {
		const imgUrl = await getImageUrlToSave();
		const { username = '', displayName } = clanProfileValue;
		if (clanProfileValue?.imgUrl || clanProfileValue?.displayName) {
			const response = await updateUserClanProfile(selectedClan?.clan_id ?? '', displayName || username, imgUrl || '');
			if (response) {
				Toast.show({
					type: 'info',
					text1: 'Update clan profile success',
				});
				setFile(null);
				navigation.goBack();
			}
		}
	};
	const handleAvatarChange = (data: IFile) => {
		setCurrentClanProfileValue((prevValue) => ({ ...prevValue, imgUrl: data?.uri }));
		setFile(data);
	};
	
	useEffect(() => {
		const keyboardListener = Keyboard.addListener('keyboardDidShow', () => {
			bottomSheetDetail?.current?.snapToIndex(1);
		});
		const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
			bottomSheetDetail?.current?.snapToIndex(0);
		});
		return () => {
			keyboardListener.remove();
			keyboardDidHideListener.remove();
		};
	}, []);

	const filteredClanList = useMemo(() => {
		return clans?.filter((it) => normalizeString(it?.clan_name)?.includes(normalizeString(searchClanText)));
	}, [searchClanText, clans]);
	return (
		<View style={{ width: Dimensions.get('screen').width }}>
			<TouchableOpacity onPress={() => openBottomSheet()} style={styles.actionItem}>
				<View style={[styles.clanAvatarWrapper]}>
					<MezonClanAvatar
						image={selectedClan?.logo}
						alt={selectedClan?.clan_name}
					/>
				</View>
				<View style={{ flex: 1 }}>
					<Text style={styles.clanName}>{selectedClan?.clan_name}</Text>
				</View>
				<Icons.ChevronSmallRightIcon height={15} width={15} color={themeValue.text} />
			</TouchableOpacity>

			<BannerAvatar avatar={clanProfileValue?.imgUrl} onChange={handleAvatarChange} />

			<View style={styles.btnGroup}>
				<TouchableOpacity onPress={() => onPressHashtag()} style={styles.btnIcon}>
					<Icons.TextIcon width={16} height={16} />
				</TouchableOpacity>
			</View>

			<View style={styles.clanProfileDetail}>
				<View style={styles.nameWrapper}>
					<Text style={styles.displayNameText}>{clanProfileValue?.displayName || clanProfileValue?.username}</Text>
					<Text style={styles.userNameText}>{clanProfileValue?.username}</Text>
				</View>

				<MezonInput
					value={clanProfileValue?.displayName}
					onTextChange={(newValue) => onValueChange({ displayName: newValue })}
					placeHolder={clanProfileValue?.username}
					maxCharacter={32}
					label={t('fields.displayName.label')}
				/>
			</View>

			<MezonBottomSheet ref={bottomSheetDetail} title={t('selectAClan')} heightFitContent>
				<View style={styles.bottomSheetContainer}>
					<MezonInput value={searchClanText} onTextChange={setSearchClanText} placeHolder={t('searchClanPlaceholder')} />
					<FlatList
						data={filteredClanList}
						keyExtractor={(item) => item?.id}
						ItemSeparatorComponent={SeparatorWithLine}
						renderItem={({ item }) => {
							return (
								<TouchableOpacity style={styles.clanItem} onPress={() => switchClan(item)}>
									<View style={styles.optionTitle}>
										<View style={[styles.clanAvatarWrapper]}>
											<MezonClanAvatar
												alt={item?.clan_name}
												image={item?.logo}
											/>
										</View>

										<Text style={styles.clanName}>{item?.clan_name}</Text>
									</View>
									{item?.clan_id === selectedClan?.clan_id ? <CheckIcon color="green" /> : null}
								</TouchableOpacity>
							);
						}}
					/>
				</View>
			</MezonBottomSheet>
		</View>
	);
}
