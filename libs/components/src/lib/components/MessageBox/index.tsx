import { IMessage } from '@mezon/utils';
import {
  useCallback, useState,
  ChangeEvent,
  FormEvent
} from 'react';
import * as Icons from '../Icons';


export type MessageBoxProps = {
  onSend: (mes: IMessagePayload) => void;
  onTyping?: () => void;
};

export type IMessagePayload = IMessage & {
  channelId: string;
};

function MessageBox(props: MessageBoxProps) {
  // const dispatch = useDispatch();
  const [content, setContent] = useState('');
  const { onSend, onTyping } = props;

  const handleSend = useCallback(() => {
    if (!content.trim()) {
      return;
    }
    onSend({
      content: { content },
      id: '',
      channel_id: '',
      body: { text: '' },
      channelId: '',
    });
    setContent('');
  }, [onSend, content]);

  const handleInputChanged = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      setContent(event.target.value);
    },
    [],
  );
  const getLineNumber = (position: number, text: string) => {
    const lines = text.substr(0, position).split('\n');
    return lines.length;
  };

  const [rowNumber, setRowNumber] = useState<number>(1);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && event.shiftKey) {
        event.preventDefault();
        const selectionStart = event.currentTarget.selectionStart;
        const selectionEnd = event.currentTarget.selectionEnd;
        setContent((prevContent) => {
          const newContent =
            prevContent.substring(0, selectionStart) +
            '\n' +
            prevContent.substring(selectionEnd);
          return newContent;
        });
        setRowNumber((prevRowNumber) => prevRowNumber + 1);

        event.currentTarget.setSelectionRange(
          selectionStart + 1,
          selectionStart + 1,
        );
      } else if (event.key === 'Enter') {
        event.preventDefault();
        handleSend();
        setRowNumber(1);
      } else if (event.key === 'Delete') {
        const cursorPosition = event.currentTarget.selectionStart;
        const isRightCharPresent = cursorPosition < content.length - 1;
        const newLineNumber = getLineNumber(cursorPosition, content);
        const selectionEnd = event.currentTarget.selectionEnd;

        if (isRightCharPresent) {
          return;
        }

        if (!isRightCharPresent) {
          event.currentTarget.setSelectionRange(selectionEnd, selectionEnd);
          return setRowNumber(newLineNumber);
        }
      }
    },
    [handleSend, content, setContent, setRowNumber],
  );

  const handleSubmitted = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      handleSend();
    },
    [handleSend],
  );

  const handleTyping = useCallback(() => {
    if (typeof onTyping === 'function') {
      onTyping();
    }
  }, [onTyping]);

  return (
    <div className="self-stretch h-fit px-4 mb-[8px] mt-[8px] flex-col justify-end items-start gap-2 flex overflow-hidden">
      <form
        onSubmit={handleSubmitted}
        className="self-stretch p-2 bg-neutral-950 rounded-lg justify-start gap-2 inline-flex items-center"
      >
        <div
          className={`flex flex-row h-full  ${rowNumber > 1 ? 'items-end' : 'items-center'}`}
        >
          <div className="flex flex-row  justify-end h-fit">
            <Icons.AddCircle />
          </div>
        </div>

        <div
          className="grow self-stretch justify-start items-center gap-2 flex"
          onSubmit={handleSubmitted}
        >
          <textarea
            placeholder="Write your thoughts here..."
            className="grow text-white text-sm font-['Manrope'] placeholder-[#AEAEAE] h-fit border-none focus:border-none outline-none bg-transparent overflow-hidden w-full resize-none"
            id="message"
            onInput={handleTyping}
            onBlur={handleInputChanged}
            onChange={handleInputChanged}
            onKeyDown={handleKeyDown}
            value={content}
            autoComplete="off"
            rows={rowNumber}
          />
        </div>
        <div
          className={`flex flex-row h-full  ${rowNumber > 1 ? 'items-end' : 'items-center'}`}
        >
          <div className="flex flex-row gap-1">
            <Icons.Gif />
            <Icons.Help />
          </div>
        </div>
      </form>
    </div>
  );
}

MessageBox.Skeleton = () => {
  return (
    <div className="self-stretch h-fit px-4 mb-[8px] mt-[8px] flex-col justify-end items-start gap-2 flex overflow-hidden">
      <form
        className="self-stretch p-2 bg-neutral-950 rounded-lg justify-start gap-2 inline-flex items-center"
      >
        <div className="flex flex-row h-full items-center">
          <div className="flex flex-row  justify-end h-fit">
            <Icons.AddCircle />
          </div>
        </div>

        <div
          className="grow self-stretch justify-start items-center gap-2 flex"
        >
          <textarea
            placeholder="Write your thoughts here..."
            className="grow text-white text-sm font-['Manrope'] placeholder-[#AEAEAE] h-fit border-none focus:border-none outline-none bg-transparent overflow-hidden w-full resize-none"
            id="message"
            rows={1}
          />
        </div>
        <div className="flex flex-row h-full items-center gap-1">
          <Icons.Gif />
          <Icons.Help />
        </div>
      </form>
    </div>
  );
}

export default MessageBox;
