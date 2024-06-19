import { useState } from "react";
import { ReactNode } from "react";
import { useEffect } from "react";
import { useRef } from "react";
import { Dimensions, NativeScrollEvent, NativeSyntheticEvent, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

interface IMezonTabViewProps {
    views: ReactNode[],
    onChange?: (pageIndex: number) => void;
    pageIndex: number;
}

export default function MezonTabView({ views, onChange, pageIndex }: IMezonTabViewProps) {
    const [page, setPage] = useState<number>(pageIndex);
    const [pageIns, setPageIns] = useState<number>(pageIndex);
    const ref = useRef<ScrollView>(null);
    const windowWidth = Dimensions.get('window').width;

    useEffect(() => {
        if (pageIndex !== pageIns) {
            setPageIns(pageIndex);
            ref && ref.current && ref.current.scrollTo({ x: pageIndex * windowWidth, animated: true })
        }
    }, [pageIndex])

    function handleScrollTabView(event: NativeSyntheticEvent<NativeScrollEvent>) {
        const currentOffsetX = event.nativeEvent.contentOffset.x;
        const pageIndex_ = Math.round(currentOffsetX / windowWidth);
        if (page !== pageIndex_) {
            setPage(pageIndex_);
            onChange(pageIndex_);
        }
    }
    return (
        <ScrollView
            horizontal
            pagingEnabled
            snapToAlignment='center'
            onScroll={handleScrollTabView}
            showsHorizontalScrollIndicator={false}
            ref={ref}>
            {views.map((view, index) =>
                <ScrollView key={index.toString()}>
                    <View style={{ width: Dimensions.get("screen").width }}>
                        {view}
                    </View>
                </ScrollView>
            )}
        </ScrollView>
    )
}