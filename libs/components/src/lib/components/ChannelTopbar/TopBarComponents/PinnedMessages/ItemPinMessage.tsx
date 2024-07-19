import { PinMessageEntity } from "@mezon/store";
import { useState } from "react";
import MemberProfile from "../../../MemberProfile";
import MessageLine from "../../../MessageWithUser/MessageLine";
import { ModalDeletePinMess } from "./DeletePinMessPopup";

type ItemPinMessageProps = {
	pinMessage: PinMessageEntity;
	contentString: string | undefined;
	handleUnPinMessage: (value: string) => void;
}

const ItemPinMessage = (props: ItemPinMessageProps) => {
	const {pinMessage, contentString, handleUnPinMessage} = props;
	const [openModalDelPin, setOpenModalDelPin] = useState(false);
	return (
		<div
			key={pinMessage.id}
			className="flex flex-row justify-between dark:hover:bg-bgSecondaryHover dark:bg-bgSecondary hover:bg-bgLightModeThird bg-bgLightMode dark: py-3 px-3 mx-2 w-widthPinMess cursor-pointer rounded overflow-hidden"
		>
			<div className="flex items-center gap-2">
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
					<span className="text-[11px]">
						<MessageLine line={contentString as string} />
					</span>
				</div>
			</div>
			<button
				className="dark:bg-bgTertiary bg-bgLightModeButton mr-1 dark:text-contentPrimary text-colorTextLightMode rounded-full w-6 h-6 flex items-center justify-center text-[10px] px-3 py-2"
				onClick={() => {
					setOpenModalDelPin(true);
				}}
			>
				✕
			</button>
			{openModalDelPin && <ModalDeletePinMess pinMessage={pinMessage} contentString={contentString} handlePinMessage={() => handleUnPinMessage(pinMessage.message_id || '')} closeModal={() => setOpenModalDelPin(false)}/>}
		</div>
	);
};

export default ItemPinMessage;
