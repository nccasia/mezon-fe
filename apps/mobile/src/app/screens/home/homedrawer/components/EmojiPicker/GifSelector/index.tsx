import { useChatSending, useGifs, useGifsStickersEmoji } from "@mezon/core";
import { useCallback } from "react";
import { useState } from "react";
import { useEffect } from "react";
import { Text, View } from "react-native";
import { ApiMessageAttachment, ApiMessageMention, ApiMessageRef } from 'mezon-js/api.gen';
import { IGifCategory, IMessageSendPayload, SubPanelName } from '@mezon/utils';
import { fetchGifsDataSearch, gifsActions } from "libs/store/src/lib/giftStickerEmojiPanel/gifs.slice";
import { getStoreAsync } from "@mezon/store-mobile";

type ChannelMessageBoxProps = {
    channelId: string;
    channelLabel: string;
    mode: number;
};

export default function GifSelector({ channelId, channelLabel, mode }: ChannelMessageBoxProps) {
    console.log({ channelId, channelLabel, mode });

    const { sendMessage } = useChatSending({ channelId, channelLabel, mode });
    const { setSubPanelActive } = useGifsStickersEmoji();
    const [dataToRenderGifs, setDataToRenderGifs] = useState<any>();

    const {
        dataGifCategories,
        dataGifsSearch,
        loadingStatusGifs,
        valueInputToCheckHandleSearch,
        dataGifsFeartured,
        trendingClickingStatus,
        setClickedTrendingGif,
        categoriesStatus,
        setShowCategories,
        setButtonArrowBack,
    } = useGifs();

    useEffect(() => {
        fetchGifsDataSearch('s')
        if (dataGifsSearch.length > 0 && valueInputToCheckHandleSearch !== '') {
            setDataToRenderGifs(dataGifsSearch);
            setShowCategories(false);
            setButtonArrowBack(true);
        } else if (trendingClickingStatus) {
            setDataToRenderGifs(dataGifsFeartured);
        } else if (valueInputToCheckHandleSearch === '') {
            setButtonArrowBack(false);
        }

        console.log(dataGifsSearch);
        console.log(dataGifsFeartured);

    }, [dataGifsSearch, trendingClickingStatus, valueInputToCheckHandleSearch]);

    const handleSend = useCallback(
        (
            content: IMessageSendPayload,
            mentions?: Array<ApiMessageMention>,
            attachments?: Array<ApiMessageAttachment>,
            references?: Array<ApiMessageRef>,
        ) => { sendMessage(content, mentions, attachments, references) },
        [sendMessage],
    );

    const handleClickGif = (giftUrl: string) => {
        handleSend({ t: '' }, [], [{ url: giftUrl }], []);
        setSubPanelActive(SubPanelName.NONE);
    };

    const renderGifCategories = () => {
        if (loadingStatusGifs === 'loading') {
            return <Text>"Loading"</Text>;
        }

        return (
            <View>
                {/* <FeaturedGifs
                    onClickToTrending={() => ontrendingClickingStatus()}
                    channelId={channelId}
                    channelLabel={channelLabel}
                    mode={mode}
                /> */}

                {Array.isArray(dataGifCategories) &&
                    dataGifCategories.map((item: IGifCategory, index: number) => (
                        // <GifCategory gifCategory={item} key={index + item.name} />)
                        <Text>aa</Text>
                    ))
                }
            </View>
        );
    };

    const renderGifs = () => {
        if (loadingStatusGifs === 'loading') {
            return <Text>"Loading"</Text>;
        }

        return (
            // <div className="mx-2 flex justify-center h-[400px] overflow-y-scroll hide-scrollbar flex-wrap">
            //     <div className="grid grid-cols-3  gap-1">
            //         {dataToRenderGifs &&
            //             dataToRenderGifs.map((gif: any, index: number) => (
            //                 <div
            //                     key={gif.id}
            //                     className={`order-${index} overflow-hidden cursor-pointer`}
            //                     onClick={() => handleClickGif(gif.media_formats.gif.url)}
            //                     role="button"
            //                 >
            //                     <img src={gif.media_formats.gif.url} alt={gif.media_formats.gif.url} className="w-full h-auto" />
            //                 </div>
            //             ))}
            //     </div>
            // </div>
            <Text>heheh</Text>
        );
    };

    return (
        categoriesStatus || (valueInputToCheckHandleSearch === '' && !trendingClickingStatus) ? renderGifCategories() : renderGifs()
    )
}