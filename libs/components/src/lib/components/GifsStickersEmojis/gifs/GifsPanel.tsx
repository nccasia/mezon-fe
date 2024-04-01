import { useChatSending } from '@mezon/core';
import { IMessageSendPayload, TabNamePopup } from '@mezon/utils';
import axios from 'axios';
import { Loading } from 'libs/ui/src/lib/Loading';
import { useCallback, useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { ApiMessageAttachment, ApiMessageMention, ApiMessageRef } from 'vendors/mezon-js/packages/mezon-js/api.gen';

type ChannelMessageBoxProps = {
	activeTab: TabNamePopup;
	channelId: string;
	channelLabel: string;
	controlEmoji?: boolean;
	clanId?: string;
	mode: number;
};

function GifsPanel({ activeTab, channelId, channelLabel, mode }: ChannelMessageBoxProps) {
	const [data, setData] = useState([]);
	// const [search, setSearch] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [isError, setIsError] = useState(false);

	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(25);
	const indexOfLastItem = currentPage * itemsPerPage;
	const indexOfFirstItem = indexOfLastItem - itemsPerPage;
	const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
	const { sendMessage } = useChatSending({ channelId, channelLabel, mode });
	const [valueSearchGif, setValueSearchGif] = useState('');
	const [valueInput, setValueInput] = useState<string>('');

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

	const fetchData = useCallback(async () => {
		setIsError(false);
		setIsLoading(true);
		try {
			const results = await axios(`${process.env.NX_CHAT_APP_API_GIPHY_TRENDING}`, {
				params: {
					api_key: `${process.env.NX_CHAT_APP_API_GIPHY_KEY}`,
					limit: 30,
				},
			});
			setData(results.data.data);
		} catch (err) {
			setIsError(true);
			setTimeout(() => setIsError(false), 4000);
		}

		setIsLoading(false);
	}, []);

	useEffect(() => {
		fetchData();
	}, []);

	const handleClickGif = (giftUrl: string) => {
		handleSend({ t: '' }, [], [{ url: giftUrl }], []);
	};

	const renderGifs = () => {
		if (isLoading) {
			return <Loading classProps="w-10 h-10" />;
		}
		return (
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1">
				{currentItems.map((gif: any, index) => (
					<div
						key={gif.id}
						className={`order-${index} overflow-hidden cursor-pointer`}
						onClick={() => handleClickGif(gif.images.original.url)}
					>
						<img src={gif.images.fixed_height.url} className="w-full h-auto" />
					</div>
				))}
			</div>
		);
	};

	const renderError = () => {
		if (isError) {
			return (
				<div className="alert alert-danger alert-dismissible fade show" role="alert">
					Unable to get Gifs, please try again in a few minutes
				</div>
			);
		}
	};

	const handleSubmit = async (value: string) => {
		setIsError(false);
		setIsLoading(true);

		try {
			const results = await axios(`${process.env.NX_CHAT_APP_API_GIPHY_SEARCH}`, {
				params: {
					api_key: `${process.env.NX_CHAT_APP_API_GIPHY_KEY}`,
					q: value,
					limit: 30,
				},
			});
			setData(results.data.data);
		} catch (err) {
			setIsError(true);
			setTimeout(() => setIsError(false), 4000);
		}

		setIsLoading(false);
	};

	const debouncedSetValueSearchGif = useDebouncedCallback((value) => {
		setValueSearchGif(value);
		handleSubmit(valueSearchGif);
	}, 300);

	useEffect(() => {
		if (activeTab === TabNamePopup.GIFS && valueInput !== '') {
			debouncedSetValueSearchGif(valueInput);
		} else {
			fetchData();
		}
	}, [activeTab, valueInput, debouncedSetValueSearchGif, setValueSearchGif, valueSearchGif]);

	// const pageSelected = (pageNumber: any) => {
	// 	setCurrentPage(pageNumber);
	// };

	return (
		<>
			{renderError()}
			<div className="mx-2 flex justify-center h-[400px] overflow-y-scroll hide-scrollbar flex-wrap">{renderGifs()}</div>
			{/* <Paginate pageSelected={pageSelected} currentPage={currentPage} itemsPerPage={itemsPerPage} totalItems={data.length} /> */}
		</>
	);
}

export default GifsPanel;
