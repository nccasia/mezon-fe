import { useThreads } from '@mezon/core';
import { size, useTheme } from '@mezon/mobile-ui';
import { threadsActions, useAppDispatch } from '@mezon/store-mobile';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { APP_SCREEN, MenuThreadScreenProps } from '../../navigation/ScreenTypes';
import EmptyThread from './EmptyThread';
import GroupThread from './GroupThread';
import ThreadAddButton from './ThreadAddButton';
import ThreadItem from './ThreadItem';
import { style } from './styles';

type CreateThreadModalScreen = typeof APP_SCREEN.MENU_THREAD.CREATE_THREAD;
export default function CreateThreadModal({ navigation, route }: MenuThreadScreenProps<CreateThreadModalScreen>) {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const { channelThreads } = route.params || {};
	const { threadChannel, threadChannelOld, threadChannelOnline } = useThreads();
	const { t } = useTranslation(['createThread']);
	const { setValueThread } = useThreads();
	// const { setOpenThreadMessageState } = useReference();
	const dispatch = useAppDispatch();
	navigation.setOptions({
		headerShown: true,
		headerTitle: t('threads', { ns: 'createThread' }),
		headerTitleAlign: 'center',
		headerRight: () => <ThreadAddButton onPress={handleNavigateCreateForm} />
	});

	const handleNavigateCreateForm = useCallback(() => {
		dispatch(threadsActions.setOpenThreadMessageState(false));
		setValueThread(null);
		navigation.navigate(APP_SCREEN.MENU_THREAD.STACK, {
			screen: APP_SCREEN.MENU_THREAD.CREATE_THREAD_FORM_MODAL,
			params: {
				channelThreads: channelThreads
			}
		});
	}, []);

	return (
		// TODO: MezonMenu??
		<View style={styles.createChannelContainer}>
			<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: size.s_50, paddingTop: size.s_10 }}>
				{threadChannelOnline?.length ? (
					<GroupThread title={`${t('joinedThreads')} - ${threadChannelOnline?.length}`}>
						{threadChannelOnline?.map((thread) => <ThreadItem thread={thread} key={thread.id} />)}
					</GroupThread>
				) : null}
				{threadChannelOld?.length ? (
					<GroupThread title={t('otherThreads')}>
						{threadChannelOld?.map((thread) => <ThreadItem thread={thread} key={thread.id} />)}
					</GroupThread>
				) : null}
			</ScrollView>
			{threadChannel?.length === 0 && <EmptyThread onPress={handleNavigateCreateForm} />}
		</View>
	);
}
