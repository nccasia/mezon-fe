import { CloseIcon, debounce, getAttachmentUnique, PenIcon, save, SearchIcon, SendIcon, STORAGE_CLAN_ID } from '@mezon/mobile-components';
import { Colors, size } from '@mezon/mobile-ui';
import { channelMetaActions, selectAllChannelsByUser, selectClansEntities } from '@mezon/store';
import {
	channelsActions,
	directActions,
	getStoreAsync,
	selectCurrentChannelId,
	selectCurrentClan,
	selectDirectsOpenlist,
	useAppSelector
} from '@mezon/store-mobile';
import { createUploadFilePath, handleUploadFileMobile, useMezon } from '@mezon/transport';
import { ILinkOnMessage } from '@mezon/utils';
import { FlashList } from '@shopify/flash-list';
import { ChannelStreamMode, ChannelType } from 'mezon-js';
import { ApiMessageAttachment } from 'mezon-js/api.gen';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Flow } from 'react-native-animated-spinkit';
import FastImage from 'react-native-fast-image';
import RNFS from 'react-native-fs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { MezonAvatar } from '../../../temp-ui';
import { isImage, isVideo } from '../../../utils/helpers';
import AttachmentFilePreview from '../../home/homedrawer/components/AttachmentFilePreview';
import { styles } from './styles';

export const Sharing = ({ data, onClose }) => {
	const listDM = useSelector(selectDirectsOpenlist);
	const listChannels = useSelector(selectAllChannelsByUser);
	const clans = useAppSelector((state) => selectClansEntities(state));

	const listChannelsText = useMemo(() => {
		return listChannels.filter((channel) => channel.type !== ChannelType.CHANNEL_TYPE_VOICE);
	}, [listChannels]);

	const listDMText = useMemo(() => {
		return listDM.filter((channel) => !!channel.channel_label);
	}, [listDM]);

	const currentClan = useSelector(selectCurrentClan);
	const currentChannelId = useSelector(selectCurrentChannelId) || '';
	const mezon = useMezon();
	const dispatch = useDispatch();
	const [dataText, setDataText] = useState<string>('');
	const [dataShareTo, setDataShareTo] = useState<any>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [searchText, setSearchText] = useState<string>('');
	const [channelSelected, setChannelSelected] = useState<any>();
	const inputSearchRef = useRef<any>();
	const session = mezon.sessionRef.current;
	const [attachmentUpload, setAttachmentUpload] = useState<any>([]);

	const dataMedia = useMemo(() => {
		return data.filter((data: { contentUri: string; filePath: string }) => !!data?.contentUri || !!data?.filePath);
	}, [data]);

	useEffect(() => {
		if (data) {
			if (data?.length === 1 && data?.[0]?.weblink) {
				setDataText(data?.[0]?.weblink);
			}
		}
	}, [data]);

	useEffect(() => {
		if (searchText) {
			handleSearchShareTo();
		} else {
			setDataShareTo([...listChannelsText, ...listDMText]);
		}
	}, [searchText]);

	useEffect(() => {
		if (dataMedia?.length) {
			convertFileFormat();
		}
	}, [dataMedia]);

	const getFullFileName = useCallback(
		(fileName: string) => {
			return createUploadFilePath(session, currentClan.id, currentChannelId, fileName, true);
		},
		[currentChannelId, currentClan.id, session]
	);

	useEffect(() => {
		if (listChannelsText || listDMText) setDataShareTo([...listChannelsText, ...listDMText]);
	}, [listChannelsText, listDMText]);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const debouncedSetSearchText = useCallback(
		debounce((text) => setSearchText(text), 300),
		[]
	);

	const generateChannelMatch = (data: any, DMList: any, searchText: string) => {
		return [...DMList, ...data].filter((channel: { channel_label?: string | number }) =>
			channel.channel_label?.toString()?.toLowerCase()?.includes(searchText?.toLowerCase())
		);
	};

	const handleSearchShareTo = async () => {
		const matchedChannels = generateChannelMatch(listChannelsText, listDMText, searchText);
		setDataShareTo(matchedChannels || []);
	};

	const onChooseSuggestion = async (channel: any) => {
		// Send to DM message
		if (channel.type === ChannelStreamMode.STREAM_MODE_DM || channel.type === ChannelStreamMode.STREAM_MODE_GROUP) {
			const store = await getStoreAsync();
			store.dispatch(
				directActions.joinDirectMessage({
					directMessageId: channel.id,
					channelName: channel.channel_label,
					type: channel.type
				})
			);
		}

		setChannelSelected(channel);
	};

	const sendToDM = async (dataSend: { text: any; links: any[] }) => {
		const store = await getStoreAsync();
		store.dispatch(
			channelsActions.joinChat({
				clanId: channelSelected?.clan_id,
				parentId: '',
				channelId: channelSelected?.channel_id,
				channelType: channelSelected?.type,
				isPublic: false,
				isParentPublic: false
			})
		);
		save(STORAGE_CLAN_ID, channelSelected?.clan_id);

		await mezon.socketRef.current.writeChatMessage(
			'0',
			'0',
			channelSelected.id,
			Number(channelSelected?.user_id?.length) === 1 ? ChannelStreamMode.STREAM_MODE_DM : ChannelStreamMode.STREAM_MODE_GROUP,
			false,
			false,
			{
				t: dataSend.text,
				lk: dataSend.links || []
			},
			[],
			getAttachmentUnique(attachmentUpload) || [],
			[]
		);
	};

	const sendToGroup = async (dataSend: { text: any; links: any[] }) => {
		const store = await getStoreAsync();
		store.dispatch(
			channelsActions.joinChat({
				clanId: channelSelected.clan_id,
				parentId: channelSelected.parent_id,
				channelId: channelSelected.channel_id,
				channelType: channelSelected.type,
				isPublic: !channelSelected?.channel_private,
				isParentPublic: channelSelected ? !channelSelected.channel_private : false
			})
		);
		save(STORAGE_CLAN_ID, channelSelected?.clan_id);

		await mezon.socketRef.current.writeChatMessage(
			currentClan.id,
			channelSelected.channel_id,
			channelSelected.channel_id,
			ChannelStreamMode.STREAM_MODE_CHANNEL,
			!channelSelected.channel_private,
			channelSelected?.parrent_id ? !channelSelected.channel_private : false,
			{
				t: dataSend.text,
				lk: dataSend.links || []
			},
			[], //mentions
			getAttachmentUnique(attachmentUpload) || [], //attachments
			[], //references
			false, //anonymous
			false //mentionEveryone
		);
		const timestamp = Date.now() / 1000;
		dispatch(channelMetaActions.setChannelLastSeenTimestamp({ channelId: channelSelected.channel_id, timestamp }));
	};

	const processText = (inputString: string) => {
		const links: ILinkOnMessage[] = [];
		const httpPrefix = 'http';

		let i = 0;
		while (i < inputString.length) {
			if (inputString.startsWith(httpPrefix, i)) {
				// Link processing
				const startIndex = i;
				i += httpPrefix.length;
				while (i < inputString.length && ![' ', '\n', '\r', '\t'].includes(inputString[i])) {
					i++;
				}
				const endIndex = i;
				links.push({
					s: startIndex,
					e: endIndex
				});
			} else {
				i++;
			}
		}

		return { links };
	};
	const onSend = async () => {
		setIsLoading(true);
		const { links } = processText(dataText);
		const dataSend = {
			text: dataText,
			links
		};
		// Send to DM message
		if (channelSelected.type === ChannelType.CHANNEL_TYPE_GROUP || channelSelected.type === ChannelType.CHANNEL_TYPE_DM) {
			await sendToDM(dataSend);
		} else {
			await sendToGroup(dataSend);
		}
		setIsLoading(false);
		onClose();
	};

	const convertFileFormat = async () => {
		const fileFormats = await Promise.all(
			dataMedia.map(async (media) => {
				const fileName = getFullFileName(media?.fileName || media?.contentUri || media?.filePath);
				setAttachmentUpload((prev) => [
					...prev,
					{ url: media?.contentUri || media?.filePath, filename: fileName?.originalFilename || fileName }
				]);
				const fileData = await RNFS.readFile(media.contentUri || media?.filePath, 'base64');

				return {
					uri: media.contentUri || media?.filePath,
					name: media?.fileName || media?.contentUri || media?.filePath,
					type: media?.mimeType,
					fileData
				};
			})
		);
		handleFiles(fileFormats);
		// setAttachmentData({
		// 	url: filePath,
		// 	filename: image?.filename || image?.uri,
		// 	filetype: Platform.OS === 'ios' ? `${file?.node?.type}/${image?.extension}` : file?.node?.type,
		// });
	};

	const handleFiles = (files: any) => {
		const session = mezon.sessionRef.current;
		const client = mezon.clientRef.current;
		if (!files || !client || !session || !currentClan.id) {
			throw new Error('Client or files are not initialized');
		}

		const promises = Array.from(files).map((file: any) => {
			return handleUploadFileMobile(client, session, currentClan.id, currentChannelId, file.name, file);
		});

		Promise.all(promises).then((attachments) => {
			attachments.forEach((attachment) => handleFinishUpload({ ...attachment, size: attachment.size || 100 }));
		});
	};

	const handleFinishUpload = useCallback(
		(attachment: ApiMessageAttachment) => {
			setAttachmentUpload([...attachmentUpload, attachment]);
		},
		[dispatch]
	);

	function removeAttachmentByUrl(urlToRemove: string) {
		setAttachmentUpload((prevAttachments) => prevAttachments.filter((attachment) => attachment.url !== urlToRemove));
	}

	const isAttachmentUploaded = useMemo(() => {
		if (!attachmentUpload) return true;

		return attachmentUpload.every((attachment: any) => attachment.url.includes('http'));
	}, [attachmentUpload]);

	const renderItemSuggest = ({ item }) => {
		return (
			<TouchableOpacity onPress={() => onChooseSuggestion(item)} style={styles.itemSuggestion}>
				<MezonAvatar
					avatarUrl={item?.channel_avatar?.[0] || clans?.[item?.clan_id]?.logo}
					username={clans?.[item?.clan_id]?.clan_name || item?.channel_label}
					width={size.s_24}
					height={size.s_24}
				/>
				<Text style={styles.titleSuggestion} numberOfLines={1}>
					{item?.channel_label}
				</Text>
			</TouchableOpacity>
		);
	};

	return (
		<SafeAreaView style={styles.wrapper}>
			<View style={styles.header}>
				<TouchableOpacity onPress={onClose}>
					<CloseIcon width={size.s_28} height={size.s_28} />
				</TouchableOpacity>
				<Text style={styles.titleHeader}>Share</Text>
				{channelSelected && isAttachmentUploaded ? (
					isLoading ? (
						<Flow size={size.s_28} color={Colors.white} />
					) : (
						<TouchableOpacity onPress={onSend}>
							<SendIcon width={size.s_28} height={size.s_20} color={Colors.white} />
						</TouchableOpacity>
					)
				) : (
					<View style={{ width: size.s_28 }} />
				)}
			</View>
			<ScrollView style={styles.container} keyboardShouldPersistTaps={'handled'}>
				<View style={styles.rowItem}>
					<Text style={styles.title}>Message preview</Text>
					{!!getAttachmentUnique(attachmentUpload)?.length && (
						<View style={[styles.inputWrapper, { marginBottom: size.s_16 }]}>
							<ScrollView horizontal style={styles.wrapperMedia}>
								{getAttachmentUnique(attachmentUpload)?.map((media: any, index) => {
									const isFile =
										Platform.OS === 'android'
											? !isImage(media?.filename?.toLowerCase()) && !isVideo(media?.filename?.toLowerCase())
											: !isImage(media?.url?.toLowerCase()) && !isVideo(media?.url?.toLowerCase());
									const isUploaded = media?.url?.includes('http');

									return (
										<View
											key={`${media?.url}_${index}_media_sharing`}
											style={[styles.wrapperItemMedia, isFile && { height: size.s_60, width: size.s_50 * 3 }]}
										>
											{isFile ? (
												<AttachmentFilePreview attachment={media} />
											) : (
												<FastImage source={{ uri: media?.url }} style={styles.itemMedia} />
											)}
											{isUploaded && (
												<TouchableOpacity
													style={styles.iconRemoveMedia}
													onPress={() => removeAttachmentByUrl(media.url ?? '')}
												>
													<CloseIcon width={size.s_18} height={size.s_18} />
												</TouchableOpacity>
											)}

											{!isUploaded && (
												<View style={styles.videoOverlay}>
													<ActivityIndicator size={'small'} color={'white'} />
												</View>
											)}
										</View>
									);
								})}
							</ScrollView>
						</View>
					)}

					<View style={styles.inputWrapper}>
						<View style={styles.iconLeftInput}>
							<PenIcon width={size.s_18} />
						</View>
						<TextInput
							style={styles.textInput}
							value={dataText}
							onChangeText={(text) => setDataText(text)}
							placeholder={'Add a Comment (Optional)'}
							placeholderTextColor={Colors.tertiary}
						/>
						{!!dataText?.length && (
							<TouchableOpacity activeOpacity={0.8} onPress={() => setDataText('')} style={styles.iconRightInput}>
								<CloseIcon width={size.s_18} />
							</TouchableOpacity>
						)}
					</View>
				</View>

				<View style={styles.rowItem}>
					<Text style={styles.title}>Share to</Text>
					<View style={styles.inputWrapper}>
						{channelSelected ? (
							<View style={styles.iconLeftInput}>
								<MezonAvatar
									avatarUrl={channelSelected?.channel_avatar?.[0] || clans?.[channelSelected?.clan_id]?.logo}
									username={clans?.[channelSelected?.clan_id]?.clan_name || channelSelected?.channel_label}
									width={size.s_18}
									height={size.s_18}
								/>
							</View>
						) : (
							<View style={styles.iconLeftInput}>
								<SearchIcon width={size.s_18} height={size.s_18} />
							</View>
						)}
						{channelSelected ? (
							<Text style={styles.textChannelSelected}>{channelSelected?.channel_label}</Text>
						) : (
							<TextInput
								ref={inputSearchRef}
								style={styles.textInput}
								onChangeText={debouncedSetSearchText}
								placeholder={'Select a channel or category...'}
								placeholderTextColor={Colors.tertiary}
							/>
						)}
						{channelSelected ? (
							<TouchableOpacity
								activeOpacity={0.8}
								onPress={() => {
									setChannelSelected(undefined);
									inputSearchRef?.current?.focus?.();
								}}
								style={styles.iconRightInput}
							>
								<CloseIcon width={size.s_18} />
							</TouchableOpacity>
						) : (
							!!searchText?.length && (
								<TouchableOpacity
									activeOpacity={0.8}
									onPress={() => {
										setSearchText('');
										inputSearchRef?.current?.clear?.();
									}}
									style={styles.iconRightInput}
								>
									<CloseIcon width={size.s_18} />
								</TouchableOpacity>
							)
						)}
					</View>
				</View>

				{!!dataShareTo?.length && (
					<View style={styles.rowItem}>
						<Text style={styles.title}>Suggestions</Text>
						<FlashList
							data={dataShareTo}
							renderItem={renderItemSuggest}
							keyExtractor={(item, index) => `${item?.id}_${index}_suggestion`}
							estimatedItemSize={size.s_30}
						/>
					</View>
				)}
			</ScrollView>
		</SafeAreaView>
	);
};
