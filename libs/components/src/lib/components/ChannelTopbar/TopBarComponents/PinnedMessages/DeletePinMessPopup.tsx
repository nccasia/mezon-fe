import { PinMessageEntity } from "@mezon/store";
import MemberProfile from "../../../MemberProfile";
import MessageLine from "../../../MessageWithUser/MessageLine";

type ModalDeletePinMessProps = {
    pinMessage: PinMessageEntity;
	contentString: string | undefined;
	closeModal: () => void;
    handlePinMessage: () => void;
};
export const ModalDeletePinMess = (props: ModalDeletePinMessProps) => {
    const { pinMessage, contentString, closeModal, handlePinMessage } = props;
    return(
        <div className="w-[100vw] h-[100vh] overflow-hidden fixed top-0 left-0 z-50 bg-black bg-opacity-80 flex flex-row justify-center items-center">
			<div className="w-fit h-fit dark:bg-bgPrimary bg-bgLightModeThird rounded-lg flex-col justify-start  items-start gap-3 inline-flex overflow-hidden max-w-[440px]">
				<div className="dark:text-white text-black">
					<div className="p-4 pb-0">
						<h3 className="font-semibold pb-4 text-xl">Unpin Message</h3>
						<p>You sure you want to remove this pinned message?</p>
					</div>
					<div className="p-4 flex">
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
					<div className="w-full dark:bg-bgSecondary bg-bgLightSecondary p-4 flex justify-end gap-x-4">
						<button onClick={closeModal} className="px-4 py-2 hover:underline rounded">
							Cancel
						</button>
						<button onClick={() => {handlePinMessage(); closeModal();}} className="px-4 py-2 hover:bg-opacity-85 rounded bg-[#DA363C]">
                            Oh yeah. Pin it
						</button>
					</div>
				</div>
			</div>
		</div>
    );
}