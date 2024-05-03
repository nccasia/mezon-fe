import React from "react";
import { View } from "react-native";
import ClanList from "./ClanList";
import ChannelList from "./ChannelList";
import {styles} from "./styles";

const DrawerContent = React.memo((props: any) => {

    return (
        <View {...props.dProps} style={styles.containerDrawerContent}>
            <ClanList />
            <ChannelList navigation={props.dProps.navigation} />
        </View>
    )
})

export default DrawerContent;
