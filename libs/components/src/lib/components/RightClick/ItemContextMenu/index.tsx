import { RightClickList } from '@mezon/utils';
import CopyToClipboard from 'react-copy-to-clipboard';

interface IMenuItem {
	item: any;
	urlData: string;
}

const MenuItem: React.FC<IMenuItem> = ({ item, urlData }) => {
	const clickItem = () => {
		if (item.name === RightClickList.COPY_IMAGE) {
			return handleCopyImage(urlData);
		}
		if (item.name === RightClickList.SAVE_IMAGE) {
			return handleSaveImage();
		}
		if (item.name === RightClickList.COPY_LINK) {
			return handleCopyLink();
		}
		if (item.name === RightClickList.OPEN_LINK) {
			return handleOpenLink();
		}
	};

	const convertImageToBlobFile = async (urlData: string): Promise<Blob | null> => {
		try {
			const response = await fetch(urlData);
			const blob = await response.blob();
			return blob;
		} catch (error) {
			console.error('Error converting image to blob:', error);
			return null;
		}
	};

	const handleCopyImage = async (urlData: string) => {
		try {
			const blob = await convertImageToBlobFile(urlData);
			if (!blob) {
				console.error('Failed to fetch or convert image');
				return;
			}

			const file = new File([blob], 'image.png', { type: 'image/png' });
			if (navigator.clipboard && navigator.clipboard.write) {
				try {
					const clipboardItem = new ClipboardItem({ 'image/png': file });
					await navigator.clipboard.write([clipboardItem]);
				} catch (error) {
					console.error('Failed to write image to clipboard:', error);
				}
			} else {
				console.warn('Clipboard API not supported. Image data not copied.');
			}
		} catch (error) {
			console.error('Error fetching or converting image:', error);
		}
	};

	const handleSaveImage = () => {
		const a = document.createElement('a');
		a.href = urlData;
		a.download = 'image.png';
		a.click();
	};
	const handleCopyLink = () => {};
	const handleOpenLink = () => {
		window.open(urlData, '_blank');
	};

	return (
		<div>
			{item.name === RightClickList.COPY_LINK ? (
				<CopyToClipboard text={urlData}>
					<span
						onClick={clickItem}
						className="flex justify-between items-center text-sm pl-1 py-1
				cursor-pointer rounded-sm text-[#81858A] hover:text-[#FFFFFF] 
				dark:hover:bg-[#4B5CD6] hover:bg-bgLightModeButton font-medium"
					>
						<span className="w-[90%]">{item.name}</span>
						<span className="w-[10%] flex justify-end mr-1">{item.symbol}</span>
					</span>
				</CopyToClipboard>
			) : (
				<span
					onClick={clickItem}
					className="flex justify-between items-center text-sm pl-1 py-1
				cursor-pointer rounded-sm text-[#81858A] hover:text-[#FFFFFF] 
				dark:hover:bg-[#4B5CD6] hover:bg-bgLightModeButton font-medium"
				>
					<span className="w-[90%]">{item.name}</span>
					<span className="w-[10%] flex justify-end mr-1">{item.symbol}</span>
				</span>
			)}
		</div>
	);
};

export default MenuItem;
