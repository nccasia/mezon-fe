import { appActions, canvasActions, canvasAPIActions, selectCanvasEntityById, useAppDispatch } from '@mezon/store';
import { useSelector } from 'react-redux';

type GroupCanvasProps = {
	canvasId: string;
	channelId?: string;
	clanId: string;
	onClose: () => void;
};

const GroupCanvas = ({ canvasId, channelId, clanId, onClose }: GroupCanvasProps) => {
	const canvas = useSelector((state) => selectCanvasEntityById(state, channelId, canvasId));
	const dispatch = useAppDispatch();

	const handleOpenCanvas = async () => {
		dispatch(appActions.setIsShowCanvas(true));
		dispatch(canvasActions.setIdCanvas(canvasId));
		onClose();
		if (canvasId && channelId && clanId) {
			const body = {
				id: canvasId,
				channel_id: channelId,
				clan_id: clanId
			};
			const results = await dispatch(canvasAPIActions.getChannelCanvasDetail(body));
			const dataUpdate = results?.payload;
			dispatch(canvasAPIActions.updateCanvas({ channelId, dataUpdate }));
		}
	};

	return (
		<div
			className="p-4 cursor-pointer rounded-lg dark:bg-bgPrimary bg-bgLightPrimary border border-transparent dark:hover:border-bgModifierHover hover:border-bgModifierHover hover:bg-bgLightModeButton"
			onClick={handleOpenCanvas}
			role="button"
		>
			<div className="h-6 text-xs one-line font-semibold leading-6 dark:text-bgLightPrimary text-bgPrimary">
				{canvas.title ? canvas.title : 'Untitled'}
			</div>
		</div>
	);
};

export default GroupCanvas;
