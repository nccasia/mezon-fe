/* eslint-disable prettier/prettier */
import { AttachmentEntity } from '@mezon/store';
import { useEffect, useRef } from 'react';
import ItemAttachment from './itemAttachment';

type ListAttachmentProps = {
  attachments: AttachmentEntity[];
  urlImg: string;
  setUrlImg: React.Dispatch<React.SetStateAction<string>>;
  handleDrag: (e: any) => void;
  setScale: React.Dispatch<React.SetStateAction<number>>;
  setPosition: React.Dispatch<
    React.SetStateAction<{
      x: number;
      y: number;
    }>
  >;
  setCurrentIndexAtt: React.Dispatch<React.SetStateAction<number>>;
  currentIndexAtt: number;
};

const ListAttachment = (props: ListAttachmentProps) => {
  const { attachments, urlImg, setUrlImg, setScale, setPosition, handleDrag, setCurrentIndexAtt, currentIndexAtt } = props;

  const selectedImageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (selectedImageRef.current) {
      selectedImageRef.current.scrollIntoView({ behavior: 'auto', block: 'center' });
      setPosition({
        x: 0,
        y: 0,
      });
      setScale(1);
    }
  }, [setPosition, setScale, urlImg]);

  let previousDate: any;

  return (
    <div className="w-fit h-full bg-[#0B0B0B] text-white flex md:flex-col px-[10px] overflow-y-hidden gap-y-5">
      <div className="w-fit h-full flex flex-col py-5 overflow-y-scroll gap-y-5 hide-scrollbar items-center">
        {attachments.map((attachment, index) => {
          const currentDate = new Date(attachment.create_time || '').toLocaleDateString();
          const showDate = previousDate !== currentDate;
          previousDate = currentDate;
          return (
            <ItemAttachment
              key={attachment.id}
              attachment={attachment}
              previousDate={currentDate}
              selectedImageRef={selectedImageRef}
              showDate={showDate}
              setUrlImg={setUrlImg}
              handleDrag={handleDrag}
              index={index}
              setCurrentIndexAtt={setCurrentIndexAtt}
              currentIndexAtt={currentIndexAtt}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ListAttachment;
