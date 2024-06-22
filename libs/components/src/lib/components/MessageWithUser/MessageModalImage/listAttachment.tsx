import { AttachmentEntity } from "@mezon/store";
import { useEffect, useRef, useState } from "react";
import ItemAttachment from "./itemAttachment";

type ListAttachmentProps = {
    attachments: AttachmentEntity[];
    urlImg: string;
    setUrlImg: React.Dispatch<React.SetStateAction<string>>;
    handleDrag: (e: any) => void;
    setScale: React.Dispatch<React.SetStateAction<number>>;
    setPosition: React.Dispatch<React.SetStateAction<{
        x: number;
        y: number;
    }>>;
}

const ListAttachment = (props: ListAttachmentProps) => {
    const {attachments, urlImg, setUrlImg, setScale, setPosition, handleDrag} = props;

    const selectedImageRef = useRef<HTMLDivElement | null>(null);
	useEffect(() => {
		if (selectedImageRef.current) {
			selectedImageRef.current.scrollIntoView({ behavior: 'auto', block: 'nearest' });
			setPosition({
				x: 0,
				y: 0,
			});
			setScale(1);
		}
	}, [setPosition, setScale, urlImg]);

    const [previousDate, setPreviousDate] = useState('');

    return (
        <div className="w-full md:w-[250px] h-[120px] md:h-full dark:bg-[#0B0B0B] bg-bgLightModeSecond flex md:flex-col px-[10px] md:px-0 md:py-5 overflow-y-hidden gap-x-2 md:gap-y-5">
            <div className="w-full h-full dark:bg-[#0B0B0B] bg-bgLightModeSecond flex md:flex-col py-0 md:py-5 overflow-y-scroll gap-x-2 md:gap-y-5 hide-scrollbar items-center">
                {attachments.map((attachment) => 
                    <ItemAttachment 
                        key={attachment.id}
                        attachment={attachment} 
                        urlImg={urlImg} 
                        previousDate={previousDate} 
                        setPreviousDate={setPreviousDate} 
                        selectedImageRef={selectedImageRef}
                        setUrlImg={setUrlImg}
                        handleDrag={handleDrag}
                    />
                )}
            </div>
        </div>
    )
}

export default ListAttachment;