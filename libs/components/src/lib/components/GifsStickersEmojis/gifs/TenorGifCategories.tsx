import { useChatSending, useGifs, useGifsStickersEmoji } from '@mezon/core';
import { IGifCategory, IMessageSendPayload, SubPanelName } from '@mezon/utils';
import { Loading } from 'libs/ui/src/lib/Loading';
import { ApiMessageAttachment, ApiMessageMention, ApiMessageRef } from 'mezon-js/api.gen';
import { useCallback, useEffect, useState } from 'react';
import FeaturedGifs from './FeaturedGifs';
import GifCategory from './GifCategory';

type ChannelMessageBoxProps = {
	// activeTab use TenorGifCategories
	activeTab: SubPanelName;
	channelId: string;
	channelLabel: string;
	mode: number;
};

function TenorGifCategories({ channelId, channelLabel, mode }: ChannelMessageBoxProps) {
	const { sendMessage } = useChatSending({ channelId, channelLabel, mode });
	const {
		dataGifCategories,
		dataGifsSearch,
		loadingStatusGifs,
		dataGifsFeartured,
		trendingClickingStatus,
		setClickedTrendingGif,
		categoriesStatus,
		setShowCategories,
		setButtonArrowBack,
	} = useGifs();
	const { valueInputToCheckHandleSearch } = useGifsStickersEmoji();
	const [dataToRenderGifs, setDataToRenderGifs] = useState<any>();
	const { setSubPanelActive } = useGifsStickersEmoji();
	const ontrendingClickingStatus = () => {
		setClickedTrendingGif(true);
		setShowCategories(false);
		setButtonArrowBack(true);
	};

	useEffect(() => {
		if (dataGifsSearch.length > 0 && valueInputToCheckHandleSearch !== '') {
			setDataToRenderGifs(dataGifsSearch);
			setShowCategories(false);
			setButtonArrowBack(true);
		} else if (trendingClickingStatus) {
			setDataToRenderGifs(dataGifsFeartured);
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

	const handleClickGif = (giftUrl: string) => {
		handleSend({ t: '' }, [], [{ url: giftUrl }], []);
		setSubPanelActive(SubPanelName.NONE);
	};

	const renderGifCategories = () => {
		if (loadingStatusGifs === 'loading') {
			return <Loading />;
		}
		return (
			<div className="mx-2 grid grid-cols-2 justify-center h-[400px] overflow-y-scroll hide-scrollbar gap-2">
				<FeaturedGifs onClickToTrending={() => ontrendingClickingStatus()} channelId={channelId} channelLabel={channelLabel} mode={mode} />

				{Array.isArray(dataGifCategories) &&
					dataGifCategories.map((item: IGifCategory, index: number) => <GifCategory gifCategory={item} key={index + item.name} />)}
			</div>
		);
	};

	const renderGifs = () => {
		if (loadingStatusGifs === 'loading') {
			return <Loading />;
		}
		return (
			<div className="mx-2 flex justify-center h-[400px] overflow-y-scroll hide-scrollbar flex-wrap">
				<div className="grid grid-cols-3  gap-1">
					{dataToRenderGifs &&
						dataToRenderGifs.map((gif: any, index: number) => (
							<div
								key={gif.id}
								className={`order-${index} overflow-hidden cursor-pointer`}
								onClick={() => handleClickGif(gif.media_formats.gif.url)}
								role="button"
							>
								<img src={gif.media_formats.gif.url} alt={gif.media_formats.gif.url} className="w-full h-auto" />
							</div>
						))}
				</div>
			</div>
		);
	};

	return (
		<>{categoriesStatus || (valueInputToCheckHandleSearch === '' && trendingClickingStatus === false) ? renderGifCategories() : renderGifs()}</>
	);
}

export default TenorGifCategories;
