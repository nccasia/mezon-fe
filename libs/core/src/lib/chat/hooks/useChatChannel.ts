import React, { useMemo } from "react";
import { useChannelMembers } from "./useChannelMembers";
import { useMessages } from "./useMessages";
import { useThreads } from "./useThreads";
import { useSelector } from "react-redux";
import {
  selectCurrentClanId,
  clansActions,
  useAppDispatch,
  selectAllAccount,
  selectUnreadMessageIdByChannelId,
  selectLastMessageIdByChannelId,
  messagesActions,
  selectTypingUserIds,
  selectChannelMemberByUserIds,
} from "@mezon/store";
import { IMessage } from "@mezon/utils";
import { useMezon } from "@mezon/transport";
import { checkMessageSendingAction } from "@mezon/store";
import {
  ApiInviteUserRes,
  ApiLinkInviteUser,
} from "vendors/mezon-js/packages/mezon-js/dist/api.gen";

export function useChatChannel(channelId: string) {
  const { clientRef, sessionRef, socketRef, channelRef } = useMezon();
  // const { clans } = useClans();
  const { threads } = useThreads();
  // TODO: maybe add hook for current clan
  const currentClanId = useSelector(selectCurrentClanId);
  const { userProfile } = useSelector(selectAllAccount);
  const { messages } = useMessages({ channelId });
  const { members } = useChannelMembers({ channelId });
  const typingUsersIds = useSelector(selectTypingUserIds)
  const typingUsers = useSelector(selectChannelMemberByUserIds(channelId, typingUsersIds || []))
  
  const unreadMessageId = useSelector(
    selectUnreadMessageIdByChannelId(channelId),
  );
  const lastMessageId = useSelector(selectLastMessageIdByChannelId(channelId));

  const client = clientRef.current;
  const dispatch = useAppDispatch();

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


  const sendMessageTyping = React.useCallback(
    async () => {
      dispatch(messagesActions.sendTypingUser({ channelId }));
    }, [channelId, dispatch]);

  const sendMessage = React.useCallback(
    async (message: IMessage) => {
      // TODO: send message to server using nakama client
      const session = sessionRef.current;
      const client = clientRef.current;
      const socket = socketRef.current;
      const channel = channelRef.current;

      if (!client || !session || !socket || !channel || !currentClanId) {
        console.log(client, session, socket, channel, currentClanId);
        throw new Error("Client is not initialized");
      }

      const payload = {
        ...message,
        id: Math.random().toString(),
        date: new Date().toLocaleString(),
        user: {
          name: userProfile?.user?.display_name || "",
          username: userProfile?.user?.username || "",
          id: userProfile?.user?.id || "idUser",
          avatarSm: userProfile?.user?.avatar_url || "",
        },
      };
      if (!payload.channel_id) {
        payload.channel_id = channelId || "";
      }
      // dispatch(messagesActions.add(payload));
      const ack = await socket.writeChatMessage(
        currentClanId,
        channel.id,
        payload,
      );
      ack && dispatch(checkMessageSendingAction());
    },
    [
      sessionRef,
      clientRef,
      socketRef,
      channelRef,
      currentClanId,
      userProfile?.user?.display_name,
      userProfile?.user?.username,
      userProfile?.user?.id,
      userProfile?.user?.avatar_url,
      dispatch,
      channelId,
    ],
  );

  return useMemo(
    () => ({
      client,
      messages,
      threads,
      members,
      unreadMessageId,
      lastMessageId,
      typingUsers,
      sendMessage,
      createLinkInviteUser,
      inviteUser,
      sendMessageTyping,
    }),
    [
      client,
      messages,
      threads,
      members,
      unreadMessageId,
      lastMessageId,
      typingUsers,
      sendMessage,
      createLinkInviteUser,
      inviteUser,
      sendMessageTyping,
    ],
  );
}
