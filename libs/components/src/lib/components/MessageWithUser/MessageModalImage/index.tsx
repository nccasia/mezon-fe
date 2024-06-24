import { Icons } from '@mezon/components';
import { useAttachments } from '@mezon/core';
import { selectAttachment, selectAttachmentPhoto, selectOpenModalAttachment } from '@mezon/store';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import ListAttachment from './listAttachment';

const MessageModalImage = () => {
	const [scale, setScale] = useState(1);
	const [showList, setShowList] = useState(true);
	const attachments = useSelector(selectAttachmentPhoto());
	const { setOpenModalAttachment } = useAttachments();
	const openModalAttachment = useSelector(selectOpenModalAttachment);
	const attachment = useSelector(selectAttachment);
	const [urlImg, setUrlImg] = useState(attachment);
	const [currentIndexAtt, setCurrentIndexAtt] = useState(attachments.findIndex((img) => img.url === urlImg));
	const attLength = attachments.length;
	const checkNumberAtt = attLength > 1;

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

	const closeModal = () => {
		setOpenModalAttachment(false);
	};

	const handleKeyDown = (event: any) => {
		if (event.key === 'Escape') {
			console.log('close view img');
			closeModal();
		}
		if (event.key === 'ArrowUp') {
			const newIndex = currentIndexAtt > 0 ? currentIndexAtt - 1 : attLength - 1;
      		setUrlImg(attachments[newIndex]?.url || '');
		}
		if(event.key === "ArrowDown"){
			const newIndex = currentIndexAtt < attLength - 1 ? currentIndexAtt + 1 : 0;
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

	return (
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
				<ListAttachment attachments={attachments} urlImg={urlImg} setUrlImg={setUrlImg} handleDrag={handleDrag} setScale={setScale} setPosition={setPosition}/>
			)}
		</div>
	);
};

export default MessageModalImage;
