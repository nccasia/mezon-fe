import React from "react";
import { View } from "react-native";
import ServerList from "./ServerList";
import ChannelList from "./ChannelList";
import {styles} from "./styles";

const DrawerContent = React.memo((props: any) => {

    return (
        <View {...props.dProps} style={styles.containerDrawerContent}>
            <ServerList />
            <ChannelList navigation={props.dProps.navigation} />
        </View>
    )
})

export default DrawerContent;
