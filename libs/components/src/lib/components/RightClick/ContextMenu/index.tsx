import { useRightClick } from '@mezon/core';
import { selectMessageByMessageId } from '@mezon/store';
import { listClickImageInViewer, listClickMessageText } from '@mezon/ui';
import { RightClickPost } from '@mezon/utils';
import { Fragment, useLayoutEffect, useRef, useState } from 'react';
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
	const messageRClicked = useSelector(selectMessageByMessageId(getMessageIdRightClicked));

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
			className="fixed h-fit border flex flex-col border-green-400 bg-[#111214] rounded z-40 w-[12rem]  "
			style={{ top: topMenu, bottom: bottomMenu, left: leftMenu, right: rightMenu }}
			onClick={onClose}
		>
			<ul className="m-0 p-2 h-fit flex flex-col">
				{listClickMessageText?.map((item: any) => {
					return (
						<Fragment key={item.name}>
							<CopyToClipboard text={urlData}>
								<MenuItem urlData={urlData} item={item} />
							</CopyToClipboard>
						</Fragment>
					);
				})}
			</ul>
			<ul className="m-0 p-2 h-fit flex flex-col z-50">
				{posClick === RightClickPost.IMAGE_ON_CHANNEL &&
					listClickImageInViewer?.map((item: any) => {
						return (
							<Fragment key={item.name}>
								<CopyToClipboard text={urlData}>
									<MenuItem urlData={urlData} item={item} />
								</CopyToClipboard>
							</Fragment>
						);
					})}
			</ul>
		</div>
	);
};

export default ContextMenu;
