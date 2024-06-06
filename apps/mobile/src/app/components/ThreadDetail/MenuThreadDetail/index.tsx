import React, { useMemo, createContext } from 'react'
import { View} from 'react-native'
import { styles } from './style';
import { ChannelsEntity, selectCurrentChannel } from '@mezon/store-mobile';
import { useSelector } from 'react-redux';

import ActionRow from '../ActionRow';
import AssetsViewer from '../AssetViewer';
import { IChannel } from '@mezon/utils';
import { ThreadHeader } from '../ThreadHeader';

export const threadDetailContext = createContext<IChannel | ChannelsEntity>(null);

export default function MenuThreadDetail(props: { route: any }) {
    //NOTE: from DirectMessageDetail component
    const directMessage = props.route?.params?.directMessage as IChannel;
    const currentChannel = useSelector(selectCurrentChannel);

    const channel = useMemo(() => {
        if (directMessage?.id) {
            return directMessage;
        }
        return currentChannel;
    }, [directMessage, currentChannel])

    return (
        <threadDetailContext.Provider value={channel}>
            <View style={styles.container}>
                <ThreadHeader />
                <ActionRow />
                <AssetsViewer />
            </View>
        </threadDetailContext.Provider>
    )
}
