import { useChatSending, useGifs } from "@mezon/core";
import { useState } from "react";
import { useEffect } from "react";
import { GifCategoriesEntity, fetchGifsDataSearch } from "@mezon/store-mobile";
import GifCategory from "./GifCategory";
import GiftItem from "./GifItem";
import { useCallback } from "react";
import { IMessageSendPayload } from "@mezon/utils";
import { ApiMessageAttachment, ApiMessageMention, ApiMessageRef } from "mezon-js/api.gen";

type ChannelMessageBoxProps = {
    channelId: string;
    channelLabel: string;
    mode: number;
    onDone: () => void
};

export default function GifSelector({ channelId, channelLabel, mode, onDone }: ChannelMessageBoxProps) {
    const [gifData, setGifData] = useState<any>();
    const { sendMessage } = useChatSending({ channelId, channelLabel, mode });

    const {
        dataGifCategories,
        dataGifsSearch,
        loadingStatusGifs,
        valueInputToCheckHandleSearch,
        dataGifsFeartured,
        trendingClickingStatus,
        setButtonArrowBack,
        setValueInputSearch
    } = useGifs();

    useEffect(() => {
        fetchGifsDataSearch('');
        setValueInputSearch('');
    }, [])

    useEffect(() => {
        if (dataGifsSearch.length > 0 && valueInputToCheckHandleSearch !== '') {
            setGifData(dataGifsSearch);
        } else if (trendingClickingStatus) {
            setGifData(dataGifsFeartured);
        } else if (valueInputToCheckHandleSearch === '') {
            setButtonArrowBack(false);
        }
    }, [dataGifsSearch, trendingClickingStatus, valueInputToCheckHandleSearch]);

    const handleSend = useCallback(
        (
            content: IMessageSendPayload,
            mentions?: Array<ApiMessageMention>,
            attachments?: Array<ApiMessageAttachment>,
            references?: Array<ApiMessageRef>,
        ) => {
            sendMessage(content, mentions, attachments, references);
        },
        [sendMessage],
    );

    function handleGifPress(url: string) {
        handleSend({ t: '' }, [], [{ url }], []);
        onDone && onDone();
    }

    return (
        valueInputToCheckHandleSearch === ''
            ? <GifCategory
                loading={loadingStatusGifs === "loading"}
                data={dataGifCategories as unknown as GifCategoriesEntity[]} />
            : <GiftItem
                loading={loadingStatusGifs === "loading"}
                data={gifData}
                onPress={handleGifPress} />
    )
}