import { useAttachments } from '@mezon/core';
import { selectAttachmentPhoto } from '@mezon/store';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import * as Icons from '../Icons';

const MessageModalImage = () => {
	const [scale, setScale] = useState(1);
	const [showList, setShowList] = useState(true);
	const attachments = useSelector(selectAttachmentPhoto());
	const { openModalAttachment, setOpenModalAttachment, attachment } = useAttachments();
	const [urlImg, setUrlImg] = useState(attachment);
	const [currentIndexAtt, setCurrentIndexAtt] = useState(attachments.findIndex((img) => img.url === urlImg));
	const attLenght = attachments.length;
	const checkNumberAtt = attLenght > 1;

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
			const newScale = deltaY > 0 ? Math.max(1, prevScale - 0.05) : Math.min(5, prevScale + 0.05);
			return newScale;
		});
		if (scale === 1) {
			setPosition({
				x: 0,
				y: 0,
			});
		}
	};

	const handleClickImg = (url: string) => {
		setUrlImg(url);
	};

	const closeModal = () => {
		setOpenModalAttachment(false);
	};

	const selectedImageRef = useRef<HTMLDivElement | null>(null);
	useEffect(() => {
		if (selectedImageRef.current) {
			selectedImageRef.current.scrollIntoView({ behavior: 'auto', block: 'nearest' });
			setPosition({
				x: 0,
				y: 0,
			});
			setScale(1);
		}
	}, [urlImg, openModalAttachment]);

	const handleKeyDown = (event: any) => {
		if (event.key === 'Escape') {
			console.log('close view img');
			closeModal();
		}
		if (event.key === 'ArrowUp') {
			const newIndex = currentIndexAtt > 0 ? currentIndexAtt - 1 : attLenght - 1;
      		setUrlImg(attachments[newIndex]?.url || '');
		}
		if(event.key === "ArrowDown"){
			const newIndex = currentIndexAtt < attLenght - 1 ? currentIndexAtt + 1 : 0;
      		setUrlImg(attachments[newIndex]?.url || '');
		}
	};

	useEffect(() => {
		window.addEventListener('keydown', handleKeyDown);

		setCurrentIndexAtt(attachments.findIndex((img) => img.url === urlImg));

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [urlImg, currentIndexAtt]);

	const [position, setPosition] = useState({ x: 0, y: 0 });
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
	const [dragging, setDragging] = useState(false);
	const handleMouseDown = (event: any) => {
		setDragging(true);
		setDragStart({
			x: event.clientX - position.x,
			y: event.clientY - position.y,
		});
	};

	const handleMouseMove = (event: any) => {
		if (dragging && scale !== 1) {
			setPosition({
				x: event.clientX - dragStart.x,
				y: event.clientY - dragStart.y,
			});
		}
	};

	const handleMouseUp = () => {
		setDragging(false);
	};

	let previousDate:any;
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
							onMouseUp={handleMouseUp}
							onMouseMove={handleMouseMove}
							onMouseDown={handleMouseDown}
							onMouseLeave={handleMouseUp}
							style={{
								transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
								transition: `${dragging ? '' : 'transform 0.2s ease'}`,
							}}
						/>
					</div>
					<button
						className={`bg-[#AEAEAE] w-[30px] h-[30px] rounded-[50px] font-bold transform hover:scale-105 hover:bg-slate-400 transition duration-300 ease-in-out absolute top-5 ${showList && checkNumberAtt ? 'md:right-[270px] right-5' : 'right-5'} ${checkNumberAtt ? '' : 'right-5'}`}
						onClick={closeModal}
					>
						X
					</button>
					{checkNumberAtt && (
						<button
							className={`bg-[#AEAEAE] w-[30px] h-[30px] rounded-[50px] font-bold transform hover:scale-105 hover:bg-slate-400 transition duration-300 ease-in-out absolute flex justify-center items-center ${showList ? 'md:-rotate-90 md:top-5 md:right-[200px] md:left-auto left-5 bottom-[110px]' : 'md:rotate-90 md:top-[72px] md:right-5 md:left-auto rotate-180 left-5 bottom-5'}`}
							onClick={handleShowList}
						>
							<Icons.ArrowDown defaultFill="white" defaultSize="w-[20px] h-[30px]" />
						</button>
					)}
					{showList && checkNumberAtt && (
						<div className="w-full md:w-[250px] h-[120px] md:h-full dark:bg-[#0B0B0B] bg-bgLightModeSecond flex md:flex-col px-[10px] md:px-0 md:py-5 overflow-y-hidden gap-x-2 md:gap-y-5">
							<div className="w-full h-full dark:bg-[#0B0B0B] bg-bgLightModeSecond flex md:flex-col py-0 md:py-5 overflow-y-scroll gap-x-2 md:gap-y-5 hide-scrollbar items-center">
								{attachments.map((img, index) => {
									const url = img.url;
									const isSelected = url === urlImg;
									const currentDate = new Date(img.create_time || '').toLocaleDateString();
									const showDate = previousDate !== currentDate;
        							previousDate = currentDate;
									return (
										<div
											className={`border ${isSelected ? 'dark:bg-slate-700 bg-bgLightModeButton w-full h-fit dark:border-white border-colorTextLightMode' : 'border-transparent'}`}
											key={`${img.id}_${index}`}
											ref={isSelected ? selectedImageRef : null}
										>
											{showDate && <div className={`dark:text-white text-black mb-1 text-center sbm:block hidden`}>{currentDate}</div>}
											<div className={isSelected ? 'flex items-center' : 'relative'} onClick={() => handleClickImg(url || '')}>
												<img
													src={url}
													alt={url}
													className={`md:size-[150px] size-[100px] md:max-w-[150px] max-w-[100px] md:max-h-[150px] max-h-[100px] mx-auto gap-5 object-cover rounded cursor-pointer ${isSelected ? '' : 'overlay'}`}
													onDragStart={handleDrag}
													onKeyDown={(event) => {
														if (event.key === 'Enter') {
															handleClickImg(url || '');
														}
													}}
												/>
												{!isSelected && <div className="absolute inset-0 bg-black opacity-50 rounded"></div>}
											</div>
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
