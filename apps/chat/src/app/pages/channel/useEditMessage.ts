import { useState, useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useChatSending } from '@mezon/core';
import { referencesActions, selectIdMessageRefEdit, selectOpenEditMessageState } from '@mezon/store';
import { IMessageWithUser } from '@mezon/utils';

export const useEditMessage = (channelId: string, channelLabel: string, mode: number, message: IMessageWithUser) => {
  const dispatch = useDispatch();
  const { EditSendMessage } = useChatSending({ channelId: channelId || '', channelLabel: channelLabel || '', mode });

  const openEditMessageState = useSelector(selectOpenEditMessageState);
  const idMessageRefEdit = useSelector(selectIdMessageRefEdit);

  const [editMessage, setEditMessage] = useState(message.content.t);
  const [content, setContent] = useState(editMessage);

  const handleCancelEdit = useCallback(() => {
    dispatch(referencesActions.setOpenEditMessageState(false));
    dispatch(referencesActions.setIdReferenceMessageEdit(''));
    // dispatch(rightClickAction.setMessageRightClick(''))
  }, [dispatch]);

  const handleSend = useCallback(
    (editMessage: string, messageId: string) => {
      const content = editMessage.trim();
      EditSendMessage(content, messageId);
      setEditMessage(content);
    },
    [EditSendMessage]
  );

  return {
    openEditMessageState,
    idMessageRefEdit,
    editMessage,
    setEditMessage,
    content,
    setContent,
    handleCancelEdit,
    handleSend
  };
};
