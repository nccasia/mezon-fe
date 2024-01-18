import { useState } from 'react';
import speaker from 'apps/chat/src/assets/SVG/ChannelListSVG/speak.svg';
import hashTag from 'apps/chat/src/assets/SVG/ChannelListSVG/hash-tag.svg';
import locked from 'apps/chat/src/assets/SVG/ChannelListSVG/locked.svg';
import shortCorner from 'apps/chat/src/assets/SVG/ChannelListSVG/short-corner.svg';
import longCorner from 'apps/chat/src/assets/SVG/ChannelListSVG/long-corner.svg';
import browseChannel from 'apps/chat/src/assets/SVG/ChannelListSVG/browse-channel.svg';
import eventIcon from 'apps/chat/src/assets/SVG/ChannelListSVG/event-icon.svg';
import arrow from 'apps/chat/src/assets/SVG/ChannelListSVG/arrow.svg';
import eventImage from 'apps/chat/src/assets/SVG/ChannelListSVG/image-default.png';
import arrowRight from 'apps/chat/src/assets/SVG/ChannelListSVG/arrow-right.svg';
import arrowDown from 'apps/chat/src/assets/SVG/ChannelListSVG/arrow-down.svg';

import {
  CategoryProps,
  RoomType,
  RoomStatus,
  ThreadProps,
  ChannelProps,
} from '../../../../../../utils/src/lib/interface/index';

export const Channel: React.FC<ChannelProps> = ({
  name,
  status,
  categories,
}) => {
  const [isOpenChannel, setIsOpen] = useState<boolean>(false);
  const toggleChannel = () => {
    setIsOpen(!isOpenChannel);
  };
  return (
    <>
      <div className="self-stretch justify-start items-center gap-1 inline-flex">
        <div className="w-5 h-5 relative">
          <button onClick={toggleChannel}>
            <div className="w-[16.67px] h-[16.67px] left-[1.67px] top-[1.67px] absolute">
              <img src={!isOpenChannel ? arrowRight : arrowDown}></img>
            </div>
          </button>
        </div>
        <div className="w-52 text-zinc-400 text-xs font-bold font-['Manrope'] leading-[18px]">
          <button onClick={toggleChannel}> {name.toLocaleUpperCase()}</button>
        </div>
      </div>

      {isOpenChannel &&
        categories &&
        Object.values(categories).map((category, key) => {
          return (
            <>
              <Category
                key={category.name}
                name={category.name}
                status={category.status}
                type={category.type}
              />
            </>
          );
        })}
    </>
  );
};

export const Category: React.FC<CategoryProps> = ({ name, status, type }) => {
  return (
    <div className="self-stretch px-4 justify-start items-center gap-3 inline-flex">
      <div className="grow  shrink basis-0 h-5 justify-start items-center gap-2 flex">
        <div className="w-5 h-5 relative">
          <div className="w-5 h-5 left-0 top-0 absolute">
            <div className="w-[16.67px] h-[16.67px] left-[1.67px] top-[1.67px] absolute">
              {<img src={type === RoomType.VOICE ? speaker : hashTag}></img>}
            </div>
          </div>
          {status === RoomStatus.LOCK && (
            <div className="w-[10px] h-[10px] left-[12.50px] top-[0.83px] absolute ">
              <div className="w-[20px] h-[20px] left-[0.56px] top-[0.56px] absolute">
                <img
                  className="bg-[#0B0B0B] pl-[2px] pb-[2px] w-2.5 h-2.5  rounded-bl-sm"
                  src={locked}
                ></img>
              </div>
            </div>
          )}
        </div>
        <div className="grow shrink basis-0 text-zinc-400 text-sm font-normal font-['Manrope'] leading-[18.20px]">
          {name}
        </div>
      </div>
    </div>
  );
};

export const Thread: React.FC<ThreadProps> = ({ name }) => {
  return (
    <div className="self-stretch px-4 justify-start items-center gap-3 inline-flex">
      <div className="grow shrink basis-0 h-5 justify-start items-center gap-2 flex">
        <div className="w-5 h-5 relative">
          <div className="w-5 h-5 left-0 top-0 absolute">
            <div className="w-[16.67px] h-[16.67px] left-[1.67px] top-[1.67px] absolute">
              {<img src={shortCorner}></img>}
            </div>
          </div>
        </div>
        <div className="grow shrink basis-0 text-zinc-400 text-sm font-normal font-['Manrope'] leading-[18.20px]">
          {name}
        </div>
      </div>
    </div>
  );
};

export const BrowseChannel = () => {
  return (
    <div className="self-stretch justify-start items-center gap-3 inline-flex">
      <div className="grow shrink basis-0 h-5 justify-start items-center gap-2 flex">
        <div className="w-5 h-5 relative">
          <div className="w-[16.67px] h-[16.67px] left-[1.67px] top-[1.67px] absolute">
            <img
              className="w-[16.67px] h-[16.67px] left-[1.67px] top-[1.67px] absolute"
              src={browseChannel}
            ></img>
          </div>
        </div>
        <div className="grow shrink basis-0 text-zinc-400 text-sm font-normal font-['Manrope'] leading-[18.20px]">
          Browse Channels
        </div>
      </div>
    </div>
  );
};

export const Events = () => {
  return (
    <div className="self-stretch justify-start items-center gap-3 inline-flex">
      <div className="grow shrink basis-0 h-5 justify-start items-center gap-2 flex">
        <div className="w-5 h-5 relative">
          <div className="w-[16.67px] h-[16.67px] left-[1.67px] top-[1.67px] absolute">
            <img
              className="w-[16.67px] h-[16.67px] left-[1.67px] top-[1.67px] absolute"
              src={eventIcon}
            ></img>
          </div>
        </div>
        <div className="w-[99px] h-[15px] text-zinc-400 text-sm font-normal font-['Manrope'] leading-[18.20px]">
          3 Events
        </div>
      </div>
      <div className="w-5 h-5 p-2 bg-red-600 rounded-[50px] flex-col justify-center items-center gap-2 inline-flex">
        <div className="text-white text-xs font-medium font-['Manrope'] leading-[18px]">
          1
        </div>
      </div>
    </div>
  );
};

export const EventBanner = () => {
  return (
    <div className="w-[272px] h-[152px] relative ">
      <img src={eventImage}></img>
      <div className="w-[272px] h-[72px] px-4 pt-4 pb-5 left-0 top-0 absolute flex-col justify-center items-center gap-2 inline-flex">
        <div className="self-stretch justify-start items-start gap-2 inline-flex">
          <div className="grow shrink basis-0 h-6 text-white text-xl font-bold font-['Manrope'] leading-relaxed">
            KOMU
          </div>
          <div className="w-6 h-6 relative">
            <img
              src={arrow}
              className="w-5 h-5 left-[2px] top-[2px] absolute"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const Mentions = () => {
  return (
    <div className="w-[272px] flex justify-center absolute  px-2 py-0.5 top-[152px]">
      <div className="px-2 py-0.5 left-[77px] top-[152px] bg-red-600 rounded-2xl justify-center items-center gap-2 inline-flex">
        <div className="text-white text-xs font-bold font-['Manrope'] leading-[18px]">
          4 NEW MENTIONS
        </div>
      </div>
    </div>
  );
};
