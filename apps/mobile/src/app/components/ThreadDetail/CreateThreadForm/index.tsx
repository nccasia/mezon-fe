import BottomSheet from '@gorhom/bottom-sheet';
import { useThreadMessage, useThreads } from '@mezon/core';
import {
	ActionEmitEvent,
	Icons,
	STORAGE_CLAN_ID,
	STORAGE_DATA_CLAN_CHANNEL_CACHE,
	getUpdateOrAddClanChannelCache,
	save
} from '@mezon/mobile-components';
import { useTheme } from '@mezon/mobile-ui';
import {
	RootState,
	channelsActions,
	createNewChannel,
	getStoreAsync,
	messagesActions,
	selectCurrentChannel,
	selectCurrentChannelId,
	selectCurrentClanId,
	selectOpenThreadMessageState,
	useAppDispatch
} from '@mezon/store-mobile';
import { IChannel, IMessageSendPayload, ThreadValue } from '@mezon/utils';
import { Formik } from 'formik';
import { ChannelStreamMode, ChannelType } from 'mezon-js';
import { ApiChannelDescription, ApiCreateChannelDescRequest, ApiMessageAttachment, ApiMessageMention, ApiMessageRef } from 'mezon-js/api.gen';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, DeviceEventEmitter, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { APP_SCREEN, MenuThreadScreenProps } from '../../../navigation/ScreenTypes';
import { ChatBox } from '../../../screens/home/homedrawer/ChatBox';
import MessageItem from '../../../screens/home/homedrawer/MessageItem';
import { IModeKeyboardPicker } from '../../../screens/home/homedrawer/components';
import AttachmentPicker from '../../../screens/home/homedrawer/components/AttachmentPicker';
import BottomKeyboardPicker from '../../../screens/home/homedrawer/components/BottomKeyboardPicker';
import EmojiPicker from '../../../screens/home/homedrawer/components/EmojiPicker';
import { EMessageActionType } from '../../../screens/home/homedrawer/enums';
import { MezonInput, MezonSwitch } from '../../../temp-ui';
import { validInput } from '../../../utils/validate';
import { style } from './CreateThreadForm.style';
import HeaderLeftThreadForm from './HeaderLeftThreadForm';
type CreateThreadFormScreen = typeof APP_SCREEN.MENU_THREAD.CREATE_THREAD_FORM_MODAL;
export default function CreateThreadForm({ navigation, route }: MenuThreadScreenProps<CreateThreadFormScreen>) {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const dispatch = useAppDispatch();
	const { channelThreads } = route.params || {};
	const { t } = useTranslation(['createThread']);
	const currentClanId = useSelector(selectCurrentClanId);
	const currentChannel = useSelector(selectCurrentChannel);
	const currentChannelId = useSelector(selectCurrentChannelId);

	const formikRef = useRef(null);
	const openThreadMessageState = useSelector(selectOpenThreadMessageState);
	const { valueThread, threadCurrentChannel } = useThreads();
	const { sendMessageThread } = useThreadMessage({
		channelId: threadCurrentChannel?.id as string,
		mode: ChannelStreamMode.STREAM_MODE_CHANNEL
	});
	const [heightKeyboardShow, setHeightKeyboardShow] = useState<number>(0);
	const [typeKeyboardBottomSheet, setTypeKeyboardBottomSheet] = useState<IModeKeyboardPicker>('text');
	const bottomPickerRef = useRef<BottomSheet>(null);
	navigation.setOptions({
		headerShown: true,
		headerTitle: () => <Text></Text>,
		headerLeft: () => <HeaderLeftThreadForm currentChannel={channelThreads || currentChannel} />,
		headerTintColor: themeValue.white
	});

	const onShowKeyboardBottomSheet = useCallback((isShow: boolean, height: number, type?: IModeKeyboardPicker) => {
		setHeightKeyboardShow(height);
		if (isShow) {
			setTypeKeyboardBottomSheet(type);
			bottomPickerRef.current?.collapse();
		} else {
			setTypeKeyboardBottomSheet('text');
			bottomPickerRef.current?.close();
		}
	}, []);

	const sessionUser = useSelector((state: RootState) => state.auth.session);

	const createThread = useCallback(
		async (value: ThreadValue) => {
			const body: ApiCreateChannelDescRequest = {
				clan_id: currentClanId?.toString(),
				channel_label: value.nameValueThread,
				channel_private: value.isPrivate,
				parrent_id: (channelThreads ? channelThreads?.id : currentChannelId) || '',
				category_id: currentChannel?.category_id,
				type: ChannelType.CHANNEL_TYPE_TEXT
			};
			try {
				const newThreadResponse = await dispatch(createNewChannel(body));
				if (newThreadResponse.meta.requestStatus === 'rejected') {
					Alert.alert('Created Thread Failed', "Thread not found or you're not allowed to update");
				} else {
					handleRouteData(newThreadResponse.payload as IChannel);
					return newThreadResponse?.payload;
				}
			} catch (error) {
				Alert.alert('Created Thread Failed', "Thread not found or you're not allowed to update");
			}
		},
		[currentChannel, currentChannel?.parrent_id, currentClanId, dispatch]
	);

	const handleSendMessageThread = useCallback(
		async (
			content: IMessageSendPayload,
			mentions?: Array<ApiMessageMention>,
			attachments?: Array<ApiMessageAttachment>,
			references?: Array<ApiMessageRef>,
			value?: ThreadValue
		) => {
			if (sessionUser) {
				if (value?.nameValueThread) {
					const thread = (await createThread(value)) as ApiChannelDescription;
					if (thread) {
						await dispatch(
							channelsActions.joinChat({
								clanId: currentClanId as string,
								parentId: thread.parrent_id as string,
								channelId: thread.channel_id as string,
								channelType: thread.type as number,
								isPublic: !thread.channel_private,
								isParentPublic: currentChannel ? !currentChannel.channel_private : false
							})
						);
						save(STORAGE_CLAN_ID, currentClanId);
						await sendMessageThread(content, mentions, attachments, references, thread);
						await dispatch(
							messagesActions.fetchMessages({
								channelId: thread.channel_id as string,
								isFetchingLatestMessages: true,
								clanId: currentClanId
							})
						);
					}
				} else {
					await sendMessageThread(content, mentions, attachments, references, threadCurrentChannel);
				}
			} else {
				console.error('Session is not available');
			}
		},
		[createThread, sendMessageThread, sessionUser, currentClanId, dispatch]
	);

	useEffect(() => {
		const sendMessage = DeviceEventEmitter.addListener(ActionEmitEvent.SEND_MESSAGE, ({ content }) => {
			const { isPrivate, nameValueThread } = formikRef.current.values;
			const valueForm = { isPrivate: isPrivate ? 1 : 0, nameValueThread: nameValueThread ?? valueThread?.content?.t };
			const contentMessage = openThreadMessageState ? { t: valueThread?.content?.t, contentThread: content?.t } : { t: content?.t };

			if (validInput(nameValueThread)) {
				handleSendMessageThread(contentMessage, [], [], [], valueForm);
			}
		});
		return () => {
			sendMessage.remove();
		};
	}, []);

	const handleRouteData = async (thread?: IChannel) => {
		const store = await getStoreAsync();
		navigation.navigate(APP_SCREEN.HOME);
		const channelId = thread?.channel_id;
		const clanId = thread?.clan_id;
		const dataSave = getUpdateOrAddClanChannelCache(clanId, channelId);
		save(STORAGE_DATA_CLAN_CHANNEL_CACHE, dataSave);
		store.dispatch(channelsActions.joinChannel({ clanId: clanId ?? '', channelId: channelId, noFetchMembers: false }));
	};
	return (
		<KeyboardAvoidingView style={styles.createChannelContainer}>
			<ScrollView contentContainerStyle={{ flex: 1 }}>
				<Formik innerRef={formikRef} initialValues={{ nameValueThread: null, isPrivate: false }}>
					{({ setFieldValue, handleChange, handleBlur, handleSubmit, values, touched, errors }) => (
						<View style={styles.createChannelContent}>
							<View style={{ marginHorizontal: 20 }}>
								<View style={styles.iconContainer}>
									<Icons.ThreadIcon width={22} height={22} color={themeValue.text} />
								</View>

								<SafeAreaView style={styles.inputContainer}>
									<MezonInput
										label={t('threadName')}
										onTextChange={handleChange('nameValueThread')}
										onFocus={() => {
											setHeightKeyboardShow(345);
											bottomPickerRef.current?.close();
										}}
										onBlur={() => {
											setHeightKeyboardShow(0);
										}}
										value={values.nameValueThread}
										placeHolder="New Thread"
										maxCharacter={64}
										errorMessage={t('errorMessage')}
									/>
								</SafeAreaView>
							</View>
							{!openThreadMessageState && (
								<View style={styles.threadPolicy}>
									<View style={styles.threadPolicyInfo}>
										<Text style={styles.threadPolicyTitle}>{t('privateThread')}</Text>
										<Text style={styles.threadPolicyContent}>{t('onlyPeopleInviteThread')}</Text>
									</View>
									<MezonSwitch
										value={values.isPrivate}
										onValueChange={(value) => {
											setFieldValue('isPrivate', value);
										}}
									/>
								</View>
							)}
							{valueThread && openThreadMessageState && (
								<View style={styles.messageBox}>
									<MessageItem
										messageId={valueThread?.id}
										message={valueThread}
										showUserInformation
										mode={ChannelStreamMode.STREAM_MODE_CHANNEL}
										channelId={currentChannel?.channel_id}
										isNumberOfLine={true}
										preventAction
									/>
								</View>
							)}
							<ChatBox
								messageAction={EMessageActionType.CreateThread}
								channelId={currentChannel?.channel_id}
								mode={ChannelStreamMode.STREAM_MODE_CHANNEL}
								hiddenIcon={{
									threadIcon: true
								}}
								onShowKeyboardBottomSheet={onShowKeyboardBottomSheet}
							/>
							<View
								style={{
									height: Platform.OS === 'ios' || typeKeyboardBottomSheet !== 'text' ? heightKeyboardShow : 0,
									backgroundColor: themeValue.secondary
								}}
							/>
							{heightKeyboardShow !== 0 && typeKeyboardBottomSheet !== 'text' && (
								<BottomKeyboardPicker
									height={heightKeyboardShow}
									ref={bottomPickerRef}
									isStickyHeader={typeKeyboardBottomSheet === 'emoji'}
								>
									{typeKeyboardBottomSheet === 'emoji' ? (
										<EmojiPicker
											onDone={() => {
												onShowKeyboardBottomSheet(false, heightKeyboardShow, 'text');
												DeviceEventEmitter.emit(ActionEmitEvent.SHOW_KEYBOARD, {});
											}}
											bottomSheetRef={bottomPickerRef}
										/>
									) : typeKeyboardBottomSheet === 'attachment' ? (
										<AttachmentPicker currentChannelId={currentChannel?.channel_id} currentClanId={currentChannel?.clan_id} />
									) : (
										<View />
									)}
								</BottomKeyboardPicker>
							)}
						</View>
					)}
				</Formik>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}
