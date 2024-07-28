import { PinMessageEntity } from '@mezon/store';
import { useState } from 'react';
import MemberProfile from '../../../MemberProfile';
import MessageLine from '../../../MessageWithUser/MessageLine';
import { ModalDeletePinMess } from './DeletePinMessPopup';

type ItemPinMessageProps = {
	pinMessage: PinMessageEntity;
	contentString: string | undefined;
	handleUnPinMessage: (value: string) => void;
};

const ItemPinMessage = (props: ItemPinMessageProps) => {
	const { pinMessage, contentString, handleUnPinMessage } = props;
	const [openModalDelPin, setOpenModalDelPin] = useState(false);
	return (
		<div
			key={pinMessage.id}
			className="flex flex-row justify-between dark:hover:bg-bgSecondaryHover dark:bg-bgPrimary hover:bg-bgLightModeThird bg-white dark: py-3 px-3 mx-2 w-widthPinMess cursor-pointer rounded overflow-hidden border dark:border-gray-700 border-gray-300 group/item-pinMess"
		>
			<div className="flex items-start gap-2">
				<MemberProfile
					isHideUserName={true}
					avatar={pinMessage.avatar || ''}
					name={pinMessage.username ?? ''}
					isHideStatus={true}
					isHideIconStatus={true}
					textColor="#fff"
				/>
				<div className="flex flex-col gap-1 text-left">
					<div>
						<span className="font-medium dark:text-textDarkTheme text-textLightTheme">{pinMessage.username}</span>
					</div>
					<div>
						<MessageLine content={JSON.parse(pinMessage.content || '')} showOnchannelLayout={true} />
					</div>
				</div>
			</div>
			<button
				className="dark:bg-bgTertiary bg-bgLightModeButton mr-1 dark:text-contentPrimary text-colorTextLightMode rounded-full w-6 h-6 items-center justify-center text-[10px] px-3 py-2 flex opacity-0 group-hover/item-pinMess:opacity-100"
				onClick={() => {
					setOpenModalDelPin(true);
				}}
			>
				✕
			</button>
			{openModalDelPin && (
				<ModalDeletePinMess
					pinMessage={pinMessage}
					contentString={contentString}
					handlePinMessage={() => handleUnPinMessage(pinMessage.message_id || '')}
					closeModal={() => setOpenModalDelPin(false)}
				/>
			)}
		</div>
	);
};

export default ItemPinMessage;
