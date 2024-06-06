import { useReference, useThreadMessage, useThreads } from '@mezon/core';
import { ActionEmitEvent, ThreadIcon } from '@mezon/mobile-components';
import { Colors, useAnimatedState } from '@mezon/mobile-ui';
import {
	RootState,
	channelsActions,
	createNewChannel,
	getStoreAsync,
	messagesActions,
	selectCurrentChannel,
	selectCurrentChannelId,
	selectCurrentClanId,
	useAppDispatch,
} from '@mezon/store-mobile';
import { useMezon } from '@mezon/transport';
import { IChannel, IMessageSendPayload, ThreadValue } from '@mezon/utils';
import { useNavigation } from '@react-navigation/native';
import { Formik } from 'formik';
import { ChannelStreamMode, ChannelType } from 'mezon-js';
import { ApiCreateChannelDescRequest, ApiMessageAttachment, ApiMessageMention, ApiMessageRef } from 'mezon-js/api.gen';
import React, { useCallback, useEffect, useRef } from 'react';
import {
	Alert,
	DeviceEventEmitter,
	Keyboard,
	KeyboardAvoidingView,
	KeyboardEvent,
	Platform,
	SafeAreaView,
	ScrollView,
	Switch,
	Text,
	TextInput,
	View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { APP_SCREEN } from '../../../navigation/ScreenTypes';
import ChatBox from '../../../screens/home/homedrawer/ChatBox';
import MessageItem from '../../../screens/home/homedrawer/MessageItem';
import { IModeKeyboardPicker } from '../../../screens/home/homedrawer/components';
import { EMessageActionType } from '../../../screens/home/homedrawer/enums';
import { styles } from './CreateThreadForm.style';

export default function CreateThreadForm() {
	const dispatch = useAppDispatch();
	const [keyboardHeight, setKeyboardHeight] = useAnimatedState<number>(110);
	const currentClanId = useSelector(selectCurrentClanId);
	const currentChannel = useSelector(selectCurrentChannel);
	const currentChannelId = useSelector(selectCurrentChannelId);
	const navigation = useNavigation();
	const formikRef = useRef(null);
	const { threadRef } = useMezon();
	const { openThreadMessageState } = useReference();
	const { valueThread } = useThreads();
	const thread = threadRef.current;
	const { sendMessageThread } = useThreadMessage({
		channelId: thread?.id as string,
		channelLabel: thread?.chanel_label as string,
		mode: ChannelStreamMode.STREAM_MODE_CHANNEL,
	});

	function keyboardWillShow(event: KeyboardEvent) {
		setKeyboardHeight(110);
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
					await createThread(value);
				}
				await sendMessageThread(content, mentions, [], []);
			} else {
				console.error('Session is not available');
			}
		},
		[createThread, sendMessageThread, sessionUser],
	);

	useEffect(() => {
		const sendMessage = DeviceEventEmitter.addListener(ActionEmitEvent.SEND_MESSAGE, ({ content }) => {
			const { isPrivate, nameValueThread } = formikRef.current.values;
			const valueForm = { isPrivate: isPrivate ? 1 : 0, nameValueThread: nameValueThread ?? valueThread?.content.t };
			const contentMessage = openThreadMessageState ? { t: valueThread.content.t, contentThread: content.t } : { t: content.t };

			if (nameValueThread) {
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
		store.dispatch(messagesActions.jumpToMessage({ messageId: '', channelId: channelId }));
		store.dispatch(channelsActions.joinChannel({ clanId: clanId ?? '', channelId: channelId, noFetchMembers: false }));
	};

	const onShowKeyboardBottomSheet = (isShow: boolean, height: number, type?: IModeKeyboardPicker) => {};
	return (
		<View style={styles.createChannelContainer}>
			<KeyboardAvoidingView style={styles.createChannelContainer} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
				<ScrollView contentContainerStyle={{ flex: 1 }}>
					<Formik innerRef={formikRef} initialValues={{ nameValueThread: null, isPrivate: false }} onSubmit={() => {}}>
						{({ setFieldValue, handleChange, handleBlur, handleSubmit, values }) => (
							<View style={styles.createChannelContent}>
								<View style={styles.iconContainer}>
									<ThreadIcon width={22} height={22} />
								</View>
								<Text style={styles.threadName}>Thread Name</Text>
								<SafeAreaView>
									<TextInput
										onChangeText={handleChange('nameValueThread')}
										onBlur={handleBlur('nameValueThread')}
										value={values.nameValueThread}
										placeholderTextColor="#7e848c"
										placeholder="New Thread"
										style={styles.inputThreadName}
									/>
								</SafeAreaView>
								{!openThreadMessageState && (
									<View style={styles.threadPolicy}>
										<View style={styles.threadPolicyInfo}>
											<Text style={styles.threadPolicyTitle}>Private Thread</Text>
											<Text style={styles.threadPolicyContent}>Only people you invite and moderators can see this thread</Text>
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
											message={valueThread}
											mode={ChannelStreamMode.STREAM_MODE_CHANNEL}
											channelId={currentChannel.channel_id}
											channelLabel={currentChannel?.channel_label}
										/>
									</View>
								)}
								<ChatBox
									messageAction={EMessageActionType.CreateThread}
									channelId={currentChannel.channel_id}
									channelLabel={currentChannel?.channel_label || ''}
									mode={ChannelStreamMode.STREAM_MODE_CHANNEL}
									onShowKeyboardBottomSheet={onShowKeyboardBottomSheet}
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
			</KeyboardAvoidingView>
		</View>
	);
}
