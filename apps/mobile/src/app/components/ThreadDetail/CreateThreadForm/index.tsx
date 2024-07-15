import { useReference, useThreadMessage, useThreads } from '@mezon/core';
import {
	ActionEmitEvent,
	STORAGE_DATA_CLAN_CHANNEL_CACHE,
	ThreadIcon,
	getUpdateOrAddClanChannelCache,
	save,
	STORAGE_CLAN_ID
} from '@mezon/mobile-components';
import { Colors, useAnimatedState } from '@mezon/mobile-ui';
import {
	RootState,
	channelsActions,
	clansActions,
	createNewChannel,
	getStoreAsync,
	selectCurrentChannel,
	selectCurrentChannelId,
	selectCurrentClanId,
	useAppDispatch,
} from '@mezon/store-mobile';
import { IChannel, IMessageSendPayload, ThreadValue } from '@mezon/utils';
import { useNavigation } from '@react-navigation/native';
import { Formik } from 'formik';
import { ChannelStreamMode, ChannelType } from 'mezon-js';
import { ApiChannelDescription, ApiCreateChannelDescRequest, ApiMessageAttachment, ApiMessageMention, ApiMessageRef } from 'mezon-js/api.gen';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, DeviceEventEmitter, Keyboard, KeyboardEvent, Platform, SafeAreaView, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { useSelector } from 'react-redux';
import UseMentionList from '../../../hooks/useUserMentionList';
import { APP_SCREEN } from '../../../navigation/ScreenTypes';
import ChatBox from '../../../screens/home/homedrawer/ChatBox';
import MessageItem from '../../../screens/home/homedrawer/MessageItem';
import { IModeKeyboardPicker } from '../../../screens/home/homedrawer/components';
import { EMessageActionType } from '../../../screens/home/homedrawer/enums';
import { validInput } from '../../../utils/validate';
import { ErrorInput } from '../../ErrorInput';
import { styles } from './CreateThreadForm.style';

export default function CreateThreadForm() {
	const dispatch = useAppDispatch();
	const [keyboardHeight, setKeyboardHeight] = useAnimatedState<number>(0);
	const { t } = useTranslation(['createThread']);
	const [isCheckValid, setIsCheckValid] = useState<boolean>(true);
	const currentClanId = useSelector(selectCurrentClanId);
	const currentChannel = useSelector(selectCurrentChannel);
	const currentChannelId = useSelector(selectCurrentChannelId);
	const navigation = useNavigation();
	const formikRef = useRef(null);
	const { openThreadMessageState } = useReference();
	const { valueThread, threadCurrentChannel } = useThreads();
	const listMentions = UseMentionList(currentChannelId || '');
	const { sendMessageThread } = useThreadMessage({
		channelId: threadCurrentChannel?.id as string,
		channelLabel: threadCurrentChannel?.channel_label as string,
		mode: ChannelStreamMode.STREAM_MODE_CHANNEL,
	});

	function keyboardWillShow(event: KeyboardEvent) {
		setKeyboardHeight(event.endCoordinates.height);
	}
	useEffect(() => {
		const keyboardListener = Keyboard.addListener('keyboardDidShow', keyboardWillShow);
		const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardHeight(0));
		return () => {
			keyboardListener.remove();
			keyboardDidHideListener.remove();
		};
	}, []);

	const sessionUser = useSelector((state: RootState) => state.auth.session);

	const createThread = useCallback(
		async (value: ThreadValue) => {
			const body: ApiCreateChannelDescRequest = {
				clan_id: currentClanId?.toString(),
				channel_label: value.nameValueThread,
				channel_private: value.isPrivate,
				parrent_id: currentChannelId as string,
				category_id: currentChannel?.category_id,
				type: ChannelType.CHANNEL_TYPE_TEXT,
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
		[currentChannel, currentChannelId, currentClanId, dispatch],
	);

	const handleSendMessageThread = useCallback(
		async (
			content: IMessageSendPayload,
			mentions?: Array<ApiMessageMention>,
			attachments?: Array<ApiMessageAttachment>,
			references?: Array<ApiMessageRef>,
			value?: ThreadValue,
		) => {
			if (sessionUser) {
				if (value?.nameValueThread) {
					const thread = await createThread(value);
					if (thread) {
						await dispatch(clansActions.joinClan({ clanId: currentClanId as string }));
						save(STORAGE_CLAN_ID, currentClanId);
						await sendMessageThread(content, mentions, attachments, references, thread as ApiChannelDescription);
					}
				}
			} else {
				console.error('Session is not available');
			}
		},
		[createThread, sendMessageThread, sessionUser, currentClanId, dispatch],
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
		navigation.navigate(APP_SCREEN.HOME as never);
		const channelId = thread?.channel_id;
		const clanId = thread?.clan_id;
		const dataSave = getUpdateOrAddClanChannelCache(clanId, channelId);
		save(STORAGE_DATA_CLAN_CHANNEL_CACHE, dataSave);
		store.dispatch(channelsActions.joinChannel({ clanId: clanId ?? '', channelId: channelId, noFetchMembers: false }));
	};

	const onShowKeyboardBottomSheet = (isShow: boolean, height: number, type?: IModeKeyboardPicker) => {};
	return (
		<View style={styles.createChannelContainer}>
			<ScrollView contentContainerStyle={{ flex: 1 }}>
				<Formik
					validate={(values) => {
						setIsCheckValid(validInput(values?.nameValueThread));
					}}
					innerRef={formikRef}
					initialValues={{ nameValueThread: null, isPrivate: false }}
					onSubmit={() => {}}
				>
					{({ setFieldValue, handleChange, handleBlur, handleSubmit, values, touched, errors }) => (
						<View style={styles.createChannelContent}>
							<View style={styles.iconContainer}>
								<ThreadIcon width={22} height={22} />
							</View>
							<Text style={styles.threadName}>{t('threadName')}</Text>
							<SafeAreaView style={styles.inputContainer}>
								<TextInput
									onChangeText={handleChange('nameValueThread')}
									onBlur={handleBlur('nameValueThread')}
									value={values.nameValueThread}
									placeholderTextColor="#7e848c"
									placeholder="New Thread"
									style={styles.inputThreadName}
									maxLength={64}
								/>
								{!isCheckValid && <ErrorInput style={styles.errorMessage} errorMessage={t('errorMessage')} />}
							</SafeAreaView>
							{!openThreadMessageState && (
								<View style={styles.threadPolicy}>
									<View style={styles.threadPolicyInfo}>
										<Text style={styles.threadPolicyTitle}>{t('privateThread')}</Text>
										<Text style={styles.threadPolicyContent}>{t('onlyPeopleInviteThread')}</Text>
									</View>
									<Switch
										value={values.isPrivate}
										trackColor={{ false: '#676b73', true: '#5a62f4' }}
										thumbColor={'white'}
										ios_backgroundColor="#3e3e3e"
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
										mode={ChannelStreamMode.STREAM_MODE_CHANNEL}
										channelId={currentChannel.channel_id}
										isNumberOfLine={true}
										preventAction
									/>
								</View>
							)}
							<ChatBox
								messageAction={EMessageActionType.CreateThread}
								channelId={currentChannel.channel_id}
								channelLabel={currentChannel?.channel_label || ''}
								mode={ChannelStreamMode.STREAM_MODE_CHANNEL}
								onShowKeyboardBottomSheet={onShowKeyboardBottomSheet}
								hiddenIcon={{
									threadIcon: true,
								}}
							/>
							<View
								style={{
									height: Platform.OS === 'ios' ? keyboardHeight : 0,
									backgroundColor: Colors.secondary,
								}}
							/>
						</View>
					)}
				</Formik>
			</ScrollView>
		</View>
	);
}
