import { useAuth, useClans, useRightClick } from '@mezon/core';
import { selectMessageByMessageId } from '@mezon/store';
import { listClickImageInViewer, listClickMessageText } from '@mezon/ui';
import { RightClickPost } from '@mezon/utils';
import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { useSelector } from 'react-redux';
import MenuItem from '../ItemContextMenu';
interface IContextMenuProps {
	onClose: () => void;
	urlData: string;
	posClick: RightClickPost;
}

const ContextMenu: React.FC<IContextMenuProps> = ({ onClose, urlData, posClick }) => {
	const { rightClickXy } = useRightClick();
	const menuRef = useRef<HTMLDivElement | null>(null);
	const [topMenu, setTopMenu] = useState<number | 'auto'>('auto');
	const [bottomMenu, setBottomMenu] = useState<number | 'auto'>('auto');
	const [rightMenu, setRightMenu] = useState<number | 'auto'>('auto');
	const [leftMenu, setLeftMenu] = useState<number | 'auto'>('auto');
	const WINDOW_HEIGHT = window.innerHeight;
	const WINDOW_WIDTH = window.innerWidth;
	const { getMessageIdRightClicked } = useRightClick();

	const [hasOwnerClan, setHasOwnerClan] = useState<boolean>(false);
	const [hasOwnerMess, setHasOwnerMess] = useState<boolean>(false);
	const [hasReaction, setHasReaction] = useState<boolean>(false);
	const messageRClicked = useSelector(selectMessageByMessageId(getMessageIdRightClicked));
	const { currentClan } = useClans();
	const { userId } = useAuth();

	useEffect(() => {
		if (currentClan?.creator_id === userId) {
			setHasOwnerClan(true);
		}
	}, [currentClan, userId]);

	console.log(messageRClicked);

	useLayoutEffect(() => {
		const menuRefHeight = menuRef.current?.getBoundingClientRect().height || 0;
		const menuRefWidth = menuRef.current?.getBoundingClientRect().width || 0;
		const distanceCursorToBottom = WINDOW_HEIGHT - rightClickXy?.y;
		const distanceCursorToRight = WINDOW_WIDTH - rightClickXy?.x;

		if (menuRefHeight && menuRefWidth) {
			const isBottomLimit = distanceCursorToBottom < menuRefHeight;
			const isRightLimit = distanceCursorToRight < menuRefWidth;

			if (isBottomLimit && isRightLimit) {
				setTopMenu('auto');
				setBottomMenu(30);
				setLeftMenu('auto');
				setRightMenu(30);
			} else if (!isBottomLimit && isRightLimit) {
				setTopMenu(rightClickXy.y);
				setBottomMenu('auto');
				setLeftMenu('auto');
				setRightMenu(30);
			} else if (isBottomLimit && !isRightLimit) {
				setTopMenu('auto');
				setBottomMenu(30);
				setLeftMenu(rightClickXy.x);
				setRightMenu('auto');
			} else if (!isBottomLimit && !isRightLimit) {
				setTopMenu(rightClickXy.y);
				setBottomMenu('auto');
				setLeftMenu(rightClickXy.x);
				setRightMenu('auto');
			}
		}
	}, [rightClickXy, WINDOW_HEIGHT, WINDOW_WIDTH, getMessageIdRightClicked]);

	return (
		<div
			ref={menuRef}
			className="fixed h-fit flex flex-col bg-[#111214] rounded z-40 w-[12rem] p-2"
			style={{ top: topMenu, bottom: bottomMenu, left: leftMenu, right: rightMenu }}
			onClick={onClose}
		>
			{listClickMessageText.map((item: any) => {
				return (
					<Fragment key={item.name}>
						<CopyToClipboard text={urlData}>
							<MenuItem urlData={urlData} item={item} />
						</CopyToClipboard>
					</Fragment>
				);
			})}
			{posClick === RightClickPost.IMAGE_ON_CHANNEL && <hr className="h-[1px] bg-white my-2"></hr>}
			{posClick === RightClickPost.IMAGE_ON_CHANNEL &&
				listClickImageInViewer.map((item: any) => {
					return (
						<Fragment key={item.name}>
							<CopyToClipboard text={urlData}>
								<MenuItem urlData={urlData} item={item} />
							</CopyToClipboard>
						</Fragment>
					);
				})}
		</div>
	);
};

export default ContextMenu;
