import { Icons } from "@mezon/components";
import { ChannelsEntity } from "@mezon/store";
import { ChannelStatusEnum } from "@mezon/utils";
import { channel } from "diagnostics_channel";
import { ChannelType } from "mezon-js";

export type ModalProps = {
	children: React.ReactNode;
	showModal: boolean;
	title?: string;
	onClose: () => void;
	confirmButton?: () => void;
	titleConfirm?: string;
	disableButtonConfirm?: boolean;
	classNameBox?: string;
	subTitleBox?: string;
	classSubTitleBox?: string;
	borderBottomTitle?: string;
	classNameWrapperChild?: string;
	hasChannel?: ChannelsEntity ;
};

const Modal = (props: ModalProps) => {
	const { showModal, onClose, confirmButton, title, children, titleConfirm, disableButtonConfirm, classNameBox, subTitleBox, classSubTitleBox, classNameWrapperChild,hasChannel } =
		props;
	return (
		showModal &&
			<>
				<div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-black bg-opacity-80 dark:text-white text-black hide-scrollbar overflow-hidden">
					<div className={`relative w-full max-w-[684px] sm:h-auto ${classNameBox}`}>
						<div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full dark:bg-bgPrimary bg-bgLightModeSecond  outline-none focus:outline-none h-full sm:h-auto">
							<div className={`flex items-start justify-between p-4 border-solid dark:border-borderDefault border-b rounded-t`}>
								<div>
									<h3 className="text-[22px] font-semibold cursor-default">{title}</h3>
									{ hasChannel &&
										<div className="inline-flex gap-x-2">
											{hasChannel.channel_private === ChannelStatusEnum.isPrivate && hasChannel.type === ChannelType.CHANNEL_TYPE_VOICE && (
												<Icons.SpeakerLocked defaultSize="w-5 h-5" />
											)}
											{hasChannel.channel_private === ChannelStatusEnum.isPrivate && hasChannel.type === ChannelType.CHANNEL_TYPE_TEXT && (
												<Icons.HashtagLocked defaultSize="w-5 h-5 " />
											)}
											{hasChannel.channel_private === undefined && hasChannel.type === ChannelType.CHANNEL_TYPE_VOICE && <Icons.Speaker defaultSize="w-5 5-5" />}
											{hasChannel.channel_private === undefined && hasChannel.type === ChannelType.CHANNEL_TYPE_TEXT && <Icons.Hashtag defaultSize="w-5 h-5" />}
											<p>{hasChannel.channel_label}</p>
										</div>
									}
									<p className={`${classSubTitleBox}`}>{subTitleBox}</p>
								</div>
								<button className="flex items-center justify-center opacity-50" onClick={() => {onClose();}}>
									<span className="text-5xl leading-3 dark:hover:text-white hover:text-black">×</span>
								</button>
							</div>

							{/*body*/}
							<div className="relative px-5 py-4 flex-auto bg-transparent max-h-[500px] overflow-auto hide-scrollbar">
								<div className={`dark:bg-[#323232] bg-bgLightModeSecond rounded-[5px] bg-transparent ${classNameWrapperChild}`}>{children}</div>
							</div>
							{/*footer*/}
							{confirmButton && title !== 'Invite friends to KOMU' && (
								<div className="flex items-center p-4 border-t border-solid dark:border-borderDefault rounded-b justify-between">
									<button
										className="text-contentBrandLight background-transparent font-semibold px-4 py-2
										text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all
										duration-150 text-[16px] leading-6 rounded-lg"
										onClick={onClose}
									>
										Back
									</button>
									{titleConfirm &&
										<button
											className={`text-white font-semibold text-sm px-4 py-2 shadow hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150 bg-primary text-[16px] leading-6 rounded ${disableButtonConfirm ? 'opacity-50 cursor-not-allowed' : ''}`}
											onClick={() => {
												confirmButton();
												onClose();
											}}
											disabled={disableButtonConfirm}
										>
											{titleConfirm}
										</button>
									}
								</div>
							)}
						</div>
					</div>
				</div>
				<div className="opacity-25 fixed inset-0 z-40 dark:bg-black bg-bgLightModeSecond"></div>
			</>	
	);
};

export default Modal;
