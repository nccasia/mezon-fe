import React, { useState } from "react";
import * as Icons from "../Icons";
import { ModalCreateDM } from "./ModalCreateDM";
import { Modal } from "@mezon/ui";
import { ModalProps } from "libs/ui/src/lib/Modal";

function DirectMessageList() {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const onClickOpenModal = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="overflow-y-scroll flex-1 pt-3 space-y-[21px] h-32 flex flex-row justify-center text-gray-300 scrollbar-hide font-bold font-['Manrope']">
            <div className="flex flex-row items-center w-full gap-4 h-fit">
                <div>List Direct Message</div>
                <Icons.AddIcon onClick={onClickOpenModal} className="w-4 h-4 cursor-pointer" />
                <ModalCreateDM onClose={onClickOpenModal} isOpen={isOpen} />
            </div>
        </div>
    );
}

export default DirectMessageList;
