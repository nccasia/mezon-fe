import { Icons } from '@mezon/components';
import { useAuth, useThreads } from '@mezon/core';
import { gifsStickerEmojiActions, reactionActions, referencesActions, selectCurrentChannel, threadsActions, useAppDispatch } from '@mezon/store';
import { ETypeChannel, IMessageWithUser, SubPanelName, findParentByClass, useMenuBuilder, useMenuBuilderPlugin } from '@mezon/utils';
import clx from 'classnames';
import { memo, useCallback, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

type ChannelMessageOptProps = {
  message: IMessageWithUser;
  handleContextMenu: (event: React.MouseEvent<HTMLElement>, props: any) => void;
  type: string;
};

const ChannelMessageOpt = ({ type, message, handleContextMenu }: ChannelMessageOptProps) => {
  const currentChannel = useSelector(selectCurrentChannel);
  const refOpt = useRef<HTMLDivElement>(null);

  const isThread = currentChannel?.parrent_id !== undefined && Number(currentChannel?.parrent_id) !== 0;

  const replyMenu = useMenuReplyMenuBuilder(message);
  const editMenu = useEditMenuBuilder(message);
  const reactMenu = useReactMenuBuilder(message);
  const threadMenu = useThreadMenuBuilder(message, isThread);
  const optionMenu = useOptionMenuBuilder(handleContextMenu);


  const items = useMenuBuilder([reactMenu, replyMenu, editMenu, threadMenu, optionMenu]);

  return (
    <div className={`chooseForText z-[1] absolute h-8 p-0.5 rounded block -top-4 right-6 w-fit`}>
      <div className="flex justify-between dark:bg-bgPrimary bg-bgLightMode border border-bgSecondary rounded">
        <div className="w-fit h-full flex justify-between" ref={refOpt}>
          {items.map((item, index) => {
            if (type !== ETypeChannel.DM || index !== 2) {
              return (
                <button
                  key={index}
                  onClick={(e) => (item?.handleItemClick ? item?.handleItemClick(e) : undefined)}
                  className={clx('h-full p-1 cursor-pointer popup-btn', item.classNames)}
                >
                  {item.icon}
                </button>
              )
            }
          })}
        </div>
      </div>
    </div>
  );
};

export default memo(ChannelMessageOpt);

// Menu items plugins
// maybe should be moved to separate files
function useMenuReplyMenuBuilder(message: IMessageWithUser) {
  const dispatch = useAppDispatch();
  const { userId } = useAuth();
  const messageId = message.id;

  const handleItemClick = useCallback(() => {
    dispatch(referencesActions.setOpenReplyMessageState(true));
    dispatch(referencesActions.setIdReferenceMessageReply(message.id));
    dispatch(referencesActions.setIdMessageToJump(''));
    dispatch(gifsStickerEmojiActions.setSubPanelActive(SubPanelName.NONE));
  }, [dispatch, messageId]);

  return useMenuBuilderPlugin((builder) => {
    builder.when(userId !== message.sender_id, (builder) => {
      builder.addMenuItem('reply', 'reply', handleItemClick, <Icons.Reply />, null, false, false, 'rotate-180');
    });
  });
}

function useEditMenuBuilder(message: IMessageWithUser) {
  const dispatch = useAppDispatch();
  const { userId } = useAuth();
  const messageId = message.id;

  const handleItemClick = useCallback(() => {
    dispatch(referencesActions.setOpenReplyMessageState(false));
    dispatch(reactionActions.setReactionRightState(false));
    dispatch(referencesActions.setOpenEditMessageState(true));
    dispatch(referencesActions.setIdReferenceMessageEdit(messageId));
    dispatch(referencesActions.setIdMessageToJump(''));
  }, [dispatch, messageId]);

  return useMenuBuilderPlugin((builder) => {
    builder.when(userId === message.sender_id, (builder) => {
      builder.addMenuItem('edit', 'edit', handleItemClick, <Icons.PenEdit />);
    });
  });
}

function useReactMenuBuilder(message: IMessageWithUser) {
  const dispatch = useAppDispatch();

  const handleItemClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      dispatch(referencesActions.setIdReferenceMessageReaction(message.id));
      dispatch(gifsStickerEmojiActions.setSubPanelActive(SubPanelName.EMOJI_REACTION_RIGHT));
      event.stopPropagation();
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      const distanceToBottom = window.innerHeight - rect.bottom;

      if (distanceToBottom > 550) {
        dispatch(reactionActions.setReactionTopState(true));
      } else {
        dispatch(reactionActions.setReactionTopState(false));
      }
    },
    [dispatch],
  );

  return useMenuBuilderPlugin((builder) => {
    builder.addMenuItem('react', 'react', handleItemClick, <Icons.Smile defaultSize="w-5 h-5" />);
  });
}

function useThreadMenuBuilder(message: IMessageWithUser, isThread: boolean) {
  const [thread, setThread] = useState(false);
  const dispatch = useAppDispatch();
  const { setIsShowCreateThread, setOpenThreadMessageState, setValueThread } = useThreads();

  const handleItemClick = useCallback(() => {
    setThread(!thread);
    setIsShowCreateThread(true);
    setOpenThreadMessageState(true);
    dispatch(threadsActions.setOpenThreadMessageState(true));
    setValueThread(message);
  }, [dispatch, message, setIsShowCreateThread, setOpenThreadMessageState, setThread, thread, setValueThread]);

  return useMenuBuilderPlugin((builder) => {
    builder.when(!isThread, (builder) => {
      builder.addMenuItem('thread', 'thread', handleItemClick, <Icons.ThreadIcon isWhite={thread} />);
    });
  });
}

function useOptionMenuBuilder(handleContextMenu: Function) {
  const useHandleClickOption = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const target = event.target as HTMLElement;
      const btn = findParentByClass(target, 'popup-btn');
      const btnX = btn?.getBoundingClientRect()?.left ?? 0;
      const btnY = btn?.getBoundingClientRect()?.top ?? 0;
      const y = btnY;
      const x = btnX - 220;
      const position = { x, y };
      const props = { position };
      handleContextMenu(event, props);
    },
    [handleContextMenu],
  );

  return useMenuBuilderPlugin((builder) => {
    builder.addMenuItem('option', 'option', useHandleClickOption, <Icons.ThreeDot />);
  });
}
