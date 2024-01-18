
import React, { useCallback } from 'react';
import { useChannels } from './useChannels';
import { useMessages } from './useMessages';
import { useClans } from './useClans';
import { useThreads } from './useThreads';
import { useMezon } from '@mezon/transport';
import { useSelector } from 'react-redux';
import {
  selectChannelsEntities,
  selectCurrentChannel,
  selectCurrentChannelId,
  selectCurrentClanId,
  clansActions,
  channelsActions,
  messagesActions,
  selectCurrentClan,
  selectClansEntities,
  authActions,
  accountActions,
  useAppDispatch,
  ClansEntity,
} from '@mezon/store';
import { IChannel, IMessage } from '@mezon/utils';

export function useChat() {
  const { clientRef, createClient } = useMezon();
  const { channels } = useChannels();
  const { clans } = useClans();
  const { threads } = useThreads();

  const client = clientRef.current;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const ChannelsEntities = useSelector(selectChannelsEntities);
  const chanEntities = useSelector(selectClansEntities);

  const currentClan = useSelector(selectCurrentClan);
  const currentChanel = useSelector(selectCurrentChannel);
  const currentChannelId = useSelector(selectCurrentChannelId);
  const currentClanId = useSelector(selectCurrentClanId);

  const { messages } = useMessages({ channelId: currentChannelId });

  const dispatch = useAppDispatch();

  const categorizedChannels = React.useMemo(() => {
    const categories = currentClan?.categories || [];

    const results = categories.map((category) => {
      const categoryChannels = channels.filter(
        (channel) => channel && channel?.categoryId === category.id
      ) as IChannel[];

      return {
        ...category,
        channels: categoryChannels,
      };
    });

    return results;
  }, [currentClan, channels]);

  const changeCurrentClan = React.useCallback(
    (optionalId?: string) => {
      let clanId = optionalId;
      if (!clanId) {
        clanId = clans[0]?.id;
      }
      if (!clanId) {
        return;
      }
      const clan = chanEntities[clanId];
      if (!clan) {
        return;
      }
      const channelIds = clan.channelIds || [];

      dispatch(clansActions.changeCurrentClan(clanId));

      const channelId = channelIds[0];
      if (!channelId) {
        return;
      }
      dispatch(channelsActions.changeCurrentChanel(channelId));
    },
    [clans, chanEntities, dispatch]
  );

  const fetchClans = React.useCallback(
    async () => {
      const action = await dispatch(clansActions.fetchClans());
      const payload = action.payload as ClansEntity[];
      if (payload.length > 0) {
        const defaultClanId = payload[0].id;
        dispatch(clansActions.changeCurrentClan(defaultClanId));
      }

      return payload;
    },
    [dispatch]
  );

  const changeCurrentChannel = React.useCallback(
    (optionalId?: string) => {
      let channelId = optionalId;
      if (!channelId) {
        channelId = channels[0]?.id;
      }
      if (!channelId) {
        return;
      }
      dispatch(channelsActions.changeCurrentChanel(channelId));
    },
    [channels, dispatch]
  );

  const sendMessage = React.useCallback(
    (message: IMessage) => {
      // TODO: send message to server using nakama client
      const payload = {
        ...message,
        id: Math.random().toString(),
        date: new Date().toLocaleString(),
        user: {
          name: 'My self',
          username: 'myself',
          id: 'myself',
          avatarSm:
            'https://cdn.pixabay.com/photo/2016/11/18/23/38/child-1837375_640.png',
        },
      };

      if (!payload.channelId) {
        payload.channelId = currentChannelId || '';
      }

      if (!payload.clanId) {
        payload.clanId = currentClanId || '';
      }

      dispatch(messagesActions.add(payload));
    },
    [currentChannelId, currentClanId, dispatch]
  );

  const init = useCallback(() => {
    createClient();
  }, [createClient]);


  const loginEmail = useCallback(
    async (username: string, password: string) => {
      const action = await dispatch(
        authActions.authenticateEmail({ username, password })
      );
      const session = action.payload;
      dispatch(accountActions.setAccount(session))
    },
    [dispatch]
  );

  const loginByGoogle = useCallback(
    async (token: string) => {
      const action = await dispatch(authActions.authenticateGoogle(token));
      const session = action.payload;
      dispatch(accountActions.setAccount(session))
    },
    [dispatch]
  );

  React.useEffect(() => {
    if (!currentClan) {
      return;
    }
    const channels = currentClan.channelIds || [];
    if (!channels.length) {
      return;
    }
    const channelId = channels[0];
    if (!channelId) {
      return;
    }
    dispatch(channelsActions.changeCurrentChanel(channelId));
  }, [currentClan, dispatch]);

  return {
    client,
    channels,
    messages,
    clans,
    threads,
    categorizedChannels,
    currentClan,
    currentChanel,
    currentChannelId,
    init,
    sendMessage,
    changeCurrentClan,
    changeCurrentChannel,
    loginEmail,
    loginByGoogle,
    fetchClans
  };
}
