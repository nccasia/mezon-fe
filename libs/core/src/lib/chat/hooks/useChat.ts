import React, { useMemo } from 'react';
import { useChannels } from './useChannels';
import { useChannelMembers } from './useChannelMembers';
import { useMessages } from './useMessages';
import { useThreads } from './useThreads';
import { useSelector } from 'react-redux';
import {
    selectCurrentChannel,
    selectCurrentChannelId,
    selectCurrentClanId,
    clansActions,
    userClanProfileActions,
    selectAllUserClanProfile,
    selectUserClanProfileByClanID,
    channelsActions,
    selectCurrentClan,
    useAppDispatch,
    ClansEntity,
    selectAllClans,
    selectAllCategories,
    selectAllAccount,
} from '@mezon/store';
import { ICategoryChannel, IChannel, IMessage } from '@mezon/utils';
import { useMezon } from '@mezon/transport';
import {
    ApiInviteUserRes,
    ApiLinkInviteUser,
} from 'vendors/mezon-js/packages/mezon-js/dist/api.gen';

// @deprecated
// TODO: refactor this hook into useChatChannel
export function useChat() {
    const { clientRef, sessionRef, socketRef, channelRef } = useMezon();
    const { channels } = useChannels();
    const { threads } = useThreads();
    const clans = useSelector(selectAllClans);
    const currentClan = useSelector(selectCurrentClan);
    const currentChanel = useSelector(selectCurrentChannel);
    const currentChannelId = useSelector(selectCurrentChannelId);
    const currentClanId = useSelector(selectCurrentClanId);
    const categories = useSelector(selectAllCategories);
    const userClansProfile = useSelector(selectAllUserClanProfile);
    const { messages } = useMessages({ channelId: currentChannelId });
    const { members } = useChannelMembers({ channelId: currentChannelId });
    const { userProfile } = useSelector(selectAllAccount);

    const client = clientRef.current;
    const dispatch = useAppDispatch();

    const categorizedChannels = React.useMemo(() => {
        const results = categories.map((category) => {
            const categoryChannels = channels.filter(
                (channel) => channel && channel?.category_id === category.id,
            ) as IChannel[];
            return {
                ...category,
                channels: categoryChannels,
            };
        });

        return results as ICategoryChannel[];
    }, [channels, categories]);

    const changeCurrentClan = React.useCallback(
        async (clanId: string) => {
            await dispatch(clansActions.changeCurrentClan({ clanId }));
        },
        [dispatch],
    );

    const getUserClanProfile = React.useCallback(
        async (clanId: string) => {
            await dispatch(
                userClanProfileActions.fetchUserClanProfile({ clanId }),
            );
        },
        [dispatch],
    );

    const updateUserClanProfile = React.useCallback(
        async (clanId: string, name: string, logoUrl: string) => {
            const action = await dispatch(
                userClanProfileActions.updateUserClanProfile({
                    clanId,
                    username: name,
                    avatarUrl: logoUrl,
                }),
            );
            const payload = action.payload;
            return payload;
        },
        [dispatch],
    );

    const createClans = React.useCallback(
        async (name: string, logoUrl: string) => {
            const action = await dispatch(
                clansActions.createClan({ clan_name: name, logo: logoUrl }),
            );
            const payload = action.payload as ClansEntity;
            if (payload && payload.clan_id) {
                changeCurrentClan(payload.clan_id);
            }
            return payload;
        },
        [changeCurrentClan, dispatch],
    );

    const updateUser = React.useCallback(
        async (name: string, logoUrl: string, displayName: string) => {
            const action = await dispatch(
                clansActions.updateUser({
                    user_name: name,
                    avatar_url: logoUrl,
                    display_name: displayName,
                }),
            );
            const payload = action.payload as ClansEntity;
            return payload;
        },
        [dispatch],
    );

    const createLinkInviteUser = React.useCallback(
        async (clan_id: string, channel_id: string, expiry_time: number) => {
            const action = await dispatch(
                clansActions.createLinkInviteUser({
                    clan_id: clan_id,
                    channel_id: channel_id,
                    expiry_time: expiry_time,
                }),
            );
            const payload = action.payload as ApiLinkInviteUser;
            return payload;
        },
        [dispatch],
    );

    const inviteUser = React.useCallback(
        async (invite_id: string) => {
            const action = await dispatch(
                clansActions.inviteUser({ inviteId: invite_id }),
            );
            const payload = action.payload as ApiInviteUserRes;
            return payload;
        },
        [dispatch],
    );

    const getLinkInvite = React.useCallback(
        async (invite_id: string) => {
            const action = await dispatch(
                clansActions.getLinkInvite({ inviteId: invite_id }),
            );
            const payload = action.payload as ApiInviteUserRes;
            return payload;
        },
        [dispatch],
    );

    const sendMessage = React.useCallback(
        async (message: IMessage) => {
            // TODO: send message to server using mezon client
            const session = sessionRef.current;
            const client = clientRef.current;
            const socket = socketRef.current;
            const channel = channelRef.current;

            if (!client || !session || !socket || !channel || !currentClanId) {
                console.log(client, session, socket, channel, currentClanId);
                throw new Error('Client is not initialized');
            }

            const payload = {
                ...message,
                id: Math.random().toString(),
                date: new Date().toLocaleString(),
                user: {
                    name: userProfile?.user?.display_name || '',
                    username: userProfile?.user?.username || '',
                    id: userProfile?.user?.id || 'idUser',
                    avatarSm: userProfile?.user?.avatar_url || '',
                },
            };
            if (!payload.channel_id) {
                payload.channel_id = currentChannelId || '';
            }
            // dispatch(messagesActions.add(payload));
            const ack = await socket.writeChatMessage(
                currentClanId,
                channel.id,
                payload,
            );
        },
        [
            channelRef,
            clientRef,
            currentChannelId,
            currentClanId,
            dispatch,
            sessionRef,
            socketRef,
            userProfile?.user?.avatar_url,
            userProfile?.user?.display_name,
            userProfile?.user?.id,
            userProfile?.user?.username,
        ],
    );

    return useMemo(
        () => ({
            client,
            channels,
            messages,
            clans,
            threads,
            categorizedChannels,
            members,
            currentClan,
            currentChanel,
            userProfile,
            userClansProfile,
            getUserClanProfile,
            updateUserClanProfile,
            sendMessage,
            changeCurrentClan,
            createClans,
            updateUser,
            createLinkInviteUser,
            inviteUser,
            currentClanId,
            getLinkInvite,
        }),
        [
            client,
            channels,
            messages,
            clans,
            threads,
            categorizedChannels,
            members,
            currentClan,
            currentChanel,
            userProfile,
            sendMessage,
            changeCurrentClan,
            userClansProfile,
            getUserClanProfile,
            updateUserClanProfile,
            createClans,
            updateUser,
            createLinkInviteUser,
            inviteUser,
            currentClanId,
            getLinkInvite,
        ],
    );
}
