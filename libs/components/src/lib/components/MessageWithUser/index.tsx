import { RootState } from "@mezon/store";
import { IMessageWithUser } from "@mezon/utils";
import { useSelector } from "react-redux";
import * as Icons from "../Icons/index";
import { useMemo } from "react";
import Skeleton from "react-loading-skeleton";

export type MessageWithUserProps = {
    message: IMessageWithUser;
};

function MessageWithUser({ message }: MessageWithUserProps) {
    const isSending = useSelector((state: RootState) => state.messages.isSending);
    const content = useMemo(() => {
        if (typeof message.content === "string") {
            return message.content;
        }

        if (typeof message.content === "object") {
            if (typeof message.content.content === "string") {
                return message.content.content;
            }

            if (typeof message.content.content === "object") {
                return (message.content.content as unknown as any).content;
            }
        }
        return "";
    }, [message]);

    return (
        <div className="flex py-0.5 min-w-min mx-3 h-15 mt-3 hover:bg-gray-950/[.07] overflow-x-hidden cursor-pointer  flex-shrink-1">
            <div className="justify-start gap-3 inline-flex items-center  w-full relative">
                {message.user?.avatarSm ? (
                    <img className="w-[38px] h-[38px] rounded-full" src={message.user?.avatarSm || ""} alt={message.user?.username || ""} />
                ) : (
                    <div className="w-[38px] h-[38px] bg-bgDisable rounded-full flex justify-center items-center text-contentSecondary text-[16px]">
                        {message.user?.username.charAt(0).toUpperCase()}
                    </div>
                )}
                <div className="flex-col w-full flex justify-center items-start relative">
                    <div className="flex-row items-center w-full gap-4 flex">
                        <div className="font-thin font-['Manrope'] text-sm  text-green-400">{message.user?.username}</div>
                        <div className=" text-zinc-400 text-xs font-['Manrope'] ">{message?.date}</div>
                    </div>
                    <div className="w-full justify-start items-center gap-2 inline-flex">
                        <div className=" text-xs text-white font-['Manrope']">{content}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

MessageWithUser.Skeleton = () => {
    return (
        <div className="flex py-0.5 min-w-min mx-3 h-15 mt-3 hover:bg-gray-950/[.07] overflow-x-hidden cursor-pointer  flex-shrink-1">
            <Skeleton circle={true} width={38} height={38} />
        </div>
    );
};

export default MessageWithUser;
