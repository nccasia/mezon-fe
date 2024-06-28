import { createContext, useCallback, useContext, useMemo, useState } from "react";
import MessageContextMenu from "./MessageContextMenu";
import { useContextMenu } from "react-contexify";

const MESSAGE_CONTEXT_MENU_ID = 'message-context-menu';

type MessageContextMenuContextValue = {
    messageId: string;
    showMessageContextMenu: (event: React.MouseEvent<HTMLElement>, messageId: string, props?: MessageContextMenuProps) => void;
    preloadMessageContextMenu: (messageId: string) => void;
}

type MessageContextMenuProps = {
	messageId: string;
};

export const MessageContextMenuContext = createContext<MessageContextMenuContextValue>({
    messageId: '',
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    showMessageContextMenu: () => {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    preloadMessageContextMenu: () => {},
});

function isEventFromImage(event: React.MouseEvent<HTMLElement>) {
    return (event.target as HTMLElement).tagName === 'IMG';
}

export const MessageContextMenuProvider = ({ children }: { children: React.ReactNode }) => {
    const [messageId, setMessageId] = useState('');
    const [imageTarget, setImageTarget] = useState<HTMLImageElement | null>(null);

    const { show } = useContextMenu({
		id: MESSAGE_CONTEXT_MENU_ID,
	});

    const menu = useMemo(() => {

        if (!messageId) return null;

        return <MessageContextMenu id={MESSAGE_CONTEXT_MENU_ID} messageId={messageId} imgTarget={imageTarget} />;
    }, [messageId, imageTarget]);

    const preloadMessageContextMenu = useCallback(
        (messageId: string) => {
            setMessageId(messageId);
        },
        [],
    );

    const showContextMenu = useCallback(
        (event: React.MouseEvent<HTMLElement>, props: MessageContextMenuProps) => {
            show({
                event,
                props: {
                    key: 'value',
                },
            });
        },
        [show],
    );

	const showMessageContextMenu = useCallback(
		(event: React.MouseEvent<HTMLElement>, messageId: string, props?: MessageContextMenuProps) => {
            setMessageId(messageId);

            if (isEventFromImage(event)) {
                setImageTarget(event.target as HTMLImageElement);
            }

            const niceProps = {
                messageId,
                ...props,
            }
			showContextMenu(event,niceProps)
		},
		[showContextMenu],
	);


    const value = useMemo(() => ({
        messageId,
        showMessageContextMenu,
        preloadMessageContextMenu,
    }), [showMessageContextMenu, preloadMessageContextMenu, messageId]);

    return (
        <MessageContextMenuContext.Provider value={value}>
            {children}
            {menu}
        </MessageContextMenuContext.Provider>
    );
}

export const useMessageContextMenu = () => useContext(MessageContextMenuContext);
