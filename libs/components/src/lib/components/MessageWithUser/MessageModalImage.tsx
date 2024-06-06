import { useAttachments, useEscapeKey } from '@mezon/core';
import { selectAttachmentPhoto, selectOpenModalAttachment } from '@mezon/store';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import * as Icons from '../Icons';

const MessageModalImage = () => {
	const [scale, setScale] = useState(1);
	const [showList, setShowList] = useState(true);
	const attachments = useSelector(selectAttachmentPhoto());
	const { openModalAttachment, setOpenModalAttachment, attachment } = useAttachments();
	const [urlImg, setUrlImg] = useState(attachment);

	const handleShowList = () => {
		setShowList(!showList);
	};

	useEffect(() => {
		setShowList(true);
		setScale(1);
		setUrlImg(attachment);
	}, [openModalAttachment]);

	const handleDrag = (e: any) => {
		e.preventDefault();
		e.stopPropagation();
	};

	const handleWheel = (event: any) => {
		const deltaY = event.deltaY;
		setScale((prevScale) => {
			if (deltaY > 0) {
				return Math.max(1, prevScale - 0.05);
			} else {
				return Math.min(5, prevScale + 0.05);
			}
		});
	};

	const handleClickImg = (url: string) => {
		setUrlImg(url);
	};

	const closeModal = () => {
		setOpenModalAttachment(false);
	}

	useEscapeKey(closeModal);

	return (
		<div>
			{openModalAttachment ? (
				<div className="justify-center items-center flex flex-col md:flex-row fixed inset-0 z-50 outline-none focus:outline-none dark:bg-black bg-white dark:text-white text-colorTextLightMode">
					<div className="flex-1 flex justify-center items-center p-5 overflow-hidden h-full w-full">
						<img
							src={urlImg}
							alt={urlImg}
							className="md:max-h-[90vh] max-h-full object-contain rounded-[10px] cursor-default h-fit"
							onDragStart={handleDrag}
							onWheel={handleWheel}
							style={{ transform: `scale(${scale})`, transition: 'transform 0.3s ease' }}
						/>
					</div>
					<button
						className={`bg-[#AEAEAE] w-[30px] h-[30px] rounded-[50px] font-bold transform hover:scale-105 hover:bg-slate-400 transition duration-300 ease-in-out absolute top-5 ${showList ? 'md:right-[270px] right-5' : 'right-5'}`}
						onClick={closeModal}
					>
						X
					</button>
					<button
						className={`bg-[#AEAEAE] w-[30px] h-[30px] rounded-[50px] font-bold transform hover:scale-105 hover:bg-slate-400 transition duration-300 ease-in-out absolute flex justify-center items-center ${showList ? 'md:-rotate-90 md:top-5 md:right-[200px] md:left-auto left-5 bottom-[110px]' : 'md:rotate-90 md:top-[72px] md:right-5 md:left-auto rotate-180 left-5 bottom-5'}`}
						onClick={handleShowList}
					>
						<Icons.ArrowDown defaultFill="white" defaultSize="w-[20px] h-[30px]" />
					</button>
					{showList && (
						<div className="w-full md:w-[250px] h-[120px] md:h-full dark:bg-[#0B0B0B] bg-bgLightModeSecond flex md:flex-col px-[10px] md:px-0 md:py-5 overflow-y-hidden gap-x-2 md:gap-y-5">
							<div className="dark:bg-slate-700 bg-bgLightModeButton border flex items-center md:block">
								<img
									src={urlImg}
									alt={urlImg}
									className={`md:size-[150px] size-[100px] md:max-w-[150px] max-w-[100px] md:max-h-[150px] max-h-[100px] mx-auto gap-5 object-cover rounded cursor-pointer`}
									onDragStart={handleDrag}
								/>
							</div>
							<div className="w-full h-full dark:bg-[#0B0B0B] bg-bgLightModeSecond flex md:flex-col py-0 md:py-5 overflow-y-scroll gap-x-2 md:gap-y-5 hide-scrollbar items-center">
								{attachments.map((img, index) => {
									const url = img.url;
									return (
										<div className={url === urlImg ? 'hidden' : ''} key={`${img.id}_${index}`}>
											<img
												src={url}
												alt={url}
												className={`md:size-[150px] size-[100px] md:max-w-[150px] max-w-[100px] md:max-h-[150px] max-h-[100px] mx-auto gap-5 object-cover rounded cursor-pointer`}
												onDragStart={handleDrag}
												onClick={() => handleClickImg(url || '')}
												onKeyDown={(event) => {
													if (event.key === 'Enter') {
														handleClickImg(url || '');
													}
												}}
											/>
										</div>
									);
								})}
							</div>
						</div>
					)}
				</div>
			) : null}
		</div>
	);
};

export default MessageModalImage;
