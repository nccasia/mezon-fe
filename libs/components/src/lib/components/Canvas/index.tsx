import { useAuth } from '@mezon/core';
import {
	canvasActions,
	createEditCanvas,
	selectCanvasEntityById,
	selectContent,
	selectCurrentChannelId,
	selectCurrentClanId,
	selectIdCanvas,
	selectTheme,
	selectTitle
} from '@mezon/store';
import 'quill/dist/quill.snow.css';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CanvasContent from './CanvasContent';

const Canvas = () => {
	const dispatch = useDispatch();
	const title = useSelector(selectTitle);
	const content = useSelector(selectContent);
	const idCanvas = useSelector(selectIdCanvas);
	const currentChannelId = useSelector(selectCurrentChannelId);
	const currentClanId = useSelector(selectCurrentClanId);
	const canvasById = useSelector((state) => selectCanvasEntityById(state, currentChannelId, idCanvas));
	const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
	const appearanceTheme = useSelector(selectTheme);
	const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
	const { userProfile } = useAuth();
	const isEditCanvas = canvasById?.creator_id === userProfile?.user?.id;

	useEffect(() => {
		if (textAreaRef.current) {
			textAreaRef.current.style.height = 'auto';
			textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
		}
	}, [title]);

	const callCreateEditCanvas = async () => {
		if (currentChannelId && currentClanId) {
			const body: any = {
				channel_id: currentChannelId,
				clan_id: currentClanId?.toString(),
				content: content,
				id: idCanvas || null,
				title: title
			};
			const response = await dispatch(createEditCanvas(body) as any);
			if (response) {
				dispatch(canvasActions.setIdCanvas(response?.payload?.id));
			}
		}
	};

	useEffect(() => {
		if ((title && title !== canvasById?.title) || (content && content !== canvasById?.content)) {
			if (debounceTimer) {
				clearTimeout(debounceTimer);
			}

			const timer = setTimeout(() => {
				callCreateEditCanvas();
			}, 1000);

			setDebounceTimer(timer);

			return () => clearTimeout(timer);
		}
	}, [title, content]);

	useEffect(() => {
		if (canvasById) {
			dispatch(canvasActions.setTitle(canvasById?.title || ''));
			dispatch(canvasActions.setContent(canvasById?.content || ''));
			dispatch(canvasActions.setIdCanvas(canvasById?.id || ''));
		}
	}, [canvasById]);

	const handleInputChange = (e: { target: { value: any } }) => {
		if (isEditCanvas) {
			const newTitle = e.target.value;
			dispatch(canvasActions.setTitle(newTitle));
		}
	};

	return (
		<div className="w-full h-[calc(100vh-60px)] max-w-[80%]">
			<textarea
				ref={textAreaRef}
				placeholder="Your canvas title"
				value={title || ''}
				style={{ color: appearanceTheme === 'light' ? 'rgb(51, 51, 51)' : 'white' }}
				onChange={handleInputChange}
				rows={1}
				disabled={!isEditCanvas}
				className="w-full px-4 py-2 mt-[25px] bg-inherit focus:outline-none text-[28px] resize-none leading-[34px] font-bold text-inherit"
			/>
			<div className="w-full">
				<CanvasContent
					key={idCanvas}
					idCanvas={idCanvas || ''}
					isLightMode={appearanceTheme === 'light'}
					content={content || ''}
					isEditCanvas={isEditCanvas}
				/>
			</div>
		</div>
	);
};

export default Canvas;
