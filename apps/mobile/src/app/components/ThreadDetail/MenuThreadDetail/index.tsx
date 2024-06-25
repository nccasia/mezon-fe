import React, { useMemo, createContext } from 'react'
import { View} from 'react-native'
import { styles } from './style';
import { ChannelsEntity, selectCurrentChannel } from '@mezon/store-mobile';
import { useSelector } from 'react-redux';

import ActionRow from '../ActionRow';
import AssetsViewer from '../AssetViewer';
import { IChannel } from '@mezon/utils';
import { ThreadHeader } from '../ThreadHeader';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@mezon/mobile-ui';
import SearchMessageChannel from '../SearchMessageChannel';
import { useState } from 'react';
import { EOpenThreadDetailFrom } from '../../../screens/home/homedrawer/HomeDefault';
import { useEffect } from 'react';
import UseMentionList from '../../../hooks/useUserMentionList';
import { Suggestions } from '../../Suggestions';
import { useMentions } from 'react-native-controlled-mentions';
import { triggersConfig } from '../../../screens/home/homedrawer/ChatBox';

export const threadDetailContext = createContext<IChannel | ChannelsEntity>(null);

export default function MenuThreadDetail(props: { route: any }) {

    //NOTE: from DirectMessageDetail component
    const directMessage = props.route?.params?.directMessage as IChannel;
    const [isSearchMessageChannel, setIsSearchMessageChannel] = useState<boolean>(false);
    const currentChannel = useSelector(selectCurrentChannel);

    const channel = useMemo(() => {
        if (directMessage?.id) {
            return directMessage;
        }
        return currentChannel;
    }, [directMessage, currentChannel])

     useEffect(()=>{
      setIsSearchMessageChannel(props?.route?.params?.openThreadDetailFrom === EOpenThreadDetailFrom.SearchChannel)
    },[props?.route?.params?.openThreadDetailFrom])
	const listMentions = UseMentionList(currentChannel?.id);


	const [mentionTextValue, setMentionTextValue] = useState('');

  const { textInputProps, triggers } = useMentions({
		value: mentionTextValue,
		onChange: (newValue) => {console.log('newValue: ',newValue);
    },
		triggersConfig,
	});


    return (
        <threadDetailContext.Provider value={channel}>
            <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: Colors.secondary }}>
                <View style={styles.container}>
                   {
                    isSearchMessageChannel ? ( <SearchMessageChannel />) :
                   (
                    <View>
                     <ThreadHeader />
                     <ActionRow />
                    </View>
                   )
                   }
                    <AssetsViewer />
			    {/* <Suggestions suggestions={listMentions} {...triggers.mention} /> */}

                </View>
            </SafeAreaView>
        </threadDetailContext.Provider>
    )
}
