export type ModalProps = {
    children: React.ReactNode
    showModal: boolean;
    title?: string;
    onClose: () => void;
    confirmButton?: () => void;
    titleConfirm?: string;
    disableButtonConfirm?: boolean;
};

const Modal = (props: ModalProps) => {
    const { showModal, onClose, confirmButton, title, children, titleConfirm, disableButtonConfirm } = props
    return (
        <>
            {showModal ? (
                <>
                    <div
                        className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
                    >
                        <div className="relative w-auto my-6 mx-auto max-w-3xl ">
                            <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-bgDisable outline-none focus:outline-none">
                                <div className="flex items-center justify-between p-3  border-solid border-borderDefault rounded-t">
                                    <h3 className="text-[22px] font-semibold">
                                        {title}
                                    </h3>
                                    <button
                                        className="flex items-center justify-center opacity-50"
                                        onClick={onClose}
                                    >
                                        <span className="text-3xl">
                                            ×
                                        </span>
                                    </button>
                                </div>
                                <div className="border-b border-solid border-borderDefault rounded-t pl-[20px] pb-[10px]">
                                    Send a channel invite link to a friend
                                </div>
                                {/*body*/}
                                <div className="relative px-6 py-4 flex-auto">
                                    <div className="bg-black p-[10px] rounded-[5px]">
                                        {children}
                                    </div>
                                </div>
                                {/*footer*/}
                                {confirmButton && (
                                    <div className="flex items-center justify-end p-3 border-t border-solid border-borderDefault rounded-b">
                                        <button
                                            className="text-black-500 background-transparent font-semibold px-4 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                            onClick={onClose}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            className={`text-white font-semibold text-sm px-4 py-2 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 ${disableButtonConfirm ? 'bg-bgDisable' : 'bg-primary'}`}
                                            onClick={() => { confirmButton(), onClose() }}
                                            disabled={disableButtonConfirm}
                                        >
                                            {titleConfirm}
                                        </button>
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>
                    <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
                </>
            ) : null}
        </>
    );
}

export default Modal