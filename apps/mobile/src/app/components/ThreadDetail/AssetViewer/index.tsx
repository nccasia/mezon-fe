import { Dimensions, NativeScrollEvent, NativeSyntheticEvent, ScrollView, Text, View } from "react-native";
import styles from "./style"
import MemberListStatus from "../../MemberStatus";
import AssetsHeader from "../AssetsHeader";
import { useState, useRef } from "react";

const TabList = [
    "Members",
    "Media",
    "Pins",
    "Links",
    "Files"
]

export default function AssetsViewer() {
    const [pageID, setPageID] = useState<number>(0);
    const ref = useRef<ScrollView>();

    function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
        const currentOffsetX = event.nativeEvent.contentOffset.x;
        const windowWidth = Dimensions.get('window').width;

        const pageID_ = Math.round(currentOffsetX / windowWidth);
        if (pageID !== pageID_) {
            setPageID(pageID_);
        }
    }

    function handelHeaderTabChange(index: number) {
        const windowWidth = Dimensions.get('window').width;
        ref && ref.current && ref.current.scrollTo({ x: index * windowWidth, animated: true })
    }

    return (
        <>
            <AssetsHeader pageID={pageID} onChange={handelHeaderTabChange} titles={TabList} />
            <View style={styles.container}>
                <ScrollView horizontal pagingEnabled onScroll={handleScroll} ref={ref}>
                    <MemberListStatus />
                    <Page2 /> 
                    <Page2 /> 
                    <Page2 /> 
                    <Page2 />
                </ScrollView>
            </View >
        </>

    )
}

// Just for testing purposes
function Page2() {
    return (
        <View style={{ width: Dimensions.get("screen").width }}>
            <Text style={{ color: "white" }}>tab content</Text>
        </View>
    )
}