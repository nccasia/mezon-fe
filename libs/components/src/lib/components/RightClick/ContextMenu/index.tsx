import { useRightClick } from '@mezon/core';
import { listClickImageInViewer, listClickMessageText } from '@mezon/ui';
import { RightClickPost } from '@mezon/utils';
import { Fragment, useEffect, useRef, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import MenuItem from '../ItemContextMenu';
interface IContextMenuProps {
	onClose: () => void;
	urlData: string;
	posClick: RightClickPost;
}

const ContextMenu: React.FC<IContextMenuProps> = ({ onClose, urlData, posClick }) => {
	// const { rightClickXy } = useRightClick();
	const menuRef = useRef<HTMLDivElement | null>(null);
	const menuRefHeight = menuRef.current && menuRef.current?.getBoundingClientRect().height;
	const WINDOW_HEIGHT = window.innerHeight;
	// const distanceCursorToBottom = WINDOW_HEIGHT - rightClickXy?.y;
	const [topMenu, setTopMenu] = useState<any>();
	const [bottomMenu, setBottomMenu] = useState<any>();
	const [listMenu, setListMenu] = useState<any>();

	console.log(posClick);

	// useEffect(() => {
	// 	if (distanceCursorToBottom < menuRefHeight!) {
	// 		setTopMenu('auto');
	// 		setBottomMenu(30);
	// 	} else {
	// 		setTopMenu(rightClickXy.y);
	// 		setBottomMenu('auto');
	// 	}
	// }, [rightClickXy]);

	useEffect(() => {
		if (posClick === RightClickPost.IMAGE_ON_CHANNEL) {
			setListMenu([...listClickMessageText, ...listClickImageInViewer]);
		} else if (posClick === RightClickPost.MESSAGE_ON_CHANNEL) {
			setListMenu(listClickMessageText);
		} else if (posClick === RightClickPost.IMAGE_VIEWER) {
			setListMenu(listClickImageInViewer);
		}
	}, [posClick]);

	return (
		<div
			ref={menuRef}
			className="fixed h-fit    bg-[#111214] rounded   z-50 w-[12rem]"
			// style={{ top: topMenu, bottom: bottomMenu, left: rightClickXy?.x }}
			onClick={onClose}
		>
			<ul className="list-none m-0  p-2 ">
				{listMenu?.map((item: any) => {
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
