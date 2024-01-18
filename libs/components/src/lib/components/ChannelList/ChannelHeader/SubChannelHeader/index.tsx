import thread from 'apps/chat/src/assets/SVG/ChannelListSVG/thread.svg';
import muteBell from 'apps/chat/src/assets/SVG/ChannelListSVG/mute-bell.svg';
import pin from 'apps/chat/src/assets/SVG/ChannelListSVG/pin.svg';
import threePeople from 'apps/chat/src/assets/SVG/ChannelListSVG/three-people.svg';
import threeDot from 'apps/chat/src/assets/SVG/ChannelListSVG/three-dot.svg';
import inbox from 'apps/chat/src/assets/SVG/ChannelListSVG/inbox.svg';
import help from 'apps/chat/src/assets/SVG/ChannelListSVG/help.svg';
import search from 'apps/chat/src/assets/SVG/ChannelListSVG/search.svg';
import speaker from 'apps/chat/src/assets/SVG/ChannelListSVG/speak.svg';
import hashTag from 'apps/chat/src/assets/SVG/ChannelListSVG/hash-tag.svg';
import locked from 'apps/chat/src/assets/SVG/ChannelListSVG/locked.svg';
import arrowThread from 'apps/chat/src/assets/SVG/ChannelListSVG/arrow-thread.svg';

import {
  CategoryNameProps,
  RoomType,
  RoomStatus,
  ThreadNameProps,
  IconProps,
  SearchMessageProps,
} from '../../../../../../../utils/src/lib/interface/index';

export const HeaderChannelList = () => {
  return (
    <div className="w-[1576px] flex-1 h-[72px] px-3 pt-4 pb-6 left-[272px] top-0 absolute bg-[#1E1E1E] border-b border-black justify-between items-center inline-flex">
      <div className="justify-start items-center gap-1 flex">
        <CategoryNameHeader
          roomType="voice"
          statusRoom="lock"
          name="Ô tô"
        />
        <ThreadNameHeader name="Xe điện" />
      </div>

      <div className="grow shrink basis-0 h-8 justify-end items-center gap-2 flex">
        <div className="justify-start items-center gap-[15px] flex">
          <Icons url={thread} />
          <Icons url={muteBell} />
          <Icons url={pin} />
          <Icons url={threePeople} />
          <Icons url={threeDot} />
        </div>
        <SearchMessage url={search} />
        <div className="justify-start items-start gap-4 flex">
          <Icons url={inbox} />
          <Icons url={help} />
        </div>
      </div>
    </div>
  );
};

export const CategoryNameHeader: React.FC<CategoryNameProps> = ({
  statusRoom,
  roomType,
  name,
}) => {
  return (
    <>
      <div className="flex items-center">
        <div className="justify-start items-center gap-1 flex ">
          <div className="w-[149px] py-1 justify-start items-center gap-2 flex">
            <div className="h-6 justify-start items-center gap-1 flex ">
              <div className="w-6 h-6 relative flex">
                <div className="w-6 h-6 left-0 top-0 absolute">
                  <div className="w-6 h-6 z-20 left-[3.50px] top-1 absolute text-zinc-400 text-lg font-normal font-['Manrope'] leading-normal">
                    {
                      <img
                        src={roomType === RoomType.VOICE ? speaker : hashTag}
                      ></img>
                    }
                  </div>
                </div>
                {statusRoom === RoomStatus.LOCK && (
                  <div className="mr-3 w-[20px] h-[20px] left-[15px] top-[0.83px] absolute">
                    <div className="w-[20px] h-[20px] left-[0.56px] top-[0.3px] absolute bg-[#151515]">
                      <img
                        className="bg-[#151515] w-[15px] h-[15px] pl-[0px] pb-[5px]"
                        src={locked}
                      ></img>
                    </div>
                  </div>
                )}
              </div>
              <div className="ml-3 grow shrink basis-0 font-bold  text-zinc-400 text-base  font-['Manrope'] leading-normal">
                {name}
              </div>
            </div>
          </div>
        </div>
        <div className="w-4 h-4 relative">
          <div className="w-[13.33px] h-[13.33px] left-[1.33px] top-[1.33px] absolute">
            <img
              className="w-[13.33px] h-[13.33px] left-[1.33px] top-[1.33px] absolute"
              src={arrowThread}
            ></img>
          </div>
        </div>
      </div>
    </>
  );
};

export const ThreadNameHeader: React.FC<ThreadNameProps> = ({ name }) => {
  return (
    <>
      <div className="w-[137px] py-1 justify-start items-center gap-3 flex">
        <div className="justify-start items-center gap-1 flex">
          <div className="w-6 h-6 relative">
            <div className="w-5 h-5 left-[2px] top-[2px] absolute">
              <div className="w-5 h-5 left-0 top-0 absolute">
                <img
                  className="w-5 h-5 left-0 top-0 absolute"
                  src={thread}
                ></img>
              </div>
            </div>
          </div>
          <div className="text-white text-base font-bold font-['Manrope'] leading-normal">
            {name}
          </div>
        </div>
      </div>
    </>
  );
};

export const SearchMessage: React.FC<SearchMessageProps> = ({ url }) => {
  return (
    <div className="w-40 h-8 flex-col justify-start items-start gap-2 inline-flex">
      <div className="self-stretch grow shrink basis-0 flex-col justify-start items-start gap-3 flex">
        <div className="self-stretch grow shrink basis-0 flex-col justify-start items-start flex">
          <div className="w-40 h-8 pl-4 pr-2 py-3 bg-[#0B0B0B] rounded justify-start items-center gap-2 inline-flex relative">
            <input
              type="text"
              placeholder="Search"
              className="grow shrink basis-0 text-[#AEAEAE] text-sm font-normal font-['Manrope'] placeholder-[#AEAEAE] leading-[18.20px] border-none outline-none bg-transparent w-full"
            />
            <div className="w-5 h-5 absolute right-2 top-1/2 transform -translate-y-1/2">
              <img className="w-5 h-5" src={url} alt="Search Icon" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Icons: React.FC<IconProps> = ({ url }) => {
  return (
    <div className="w-6 h-6 relative">
      <div className="w-5 h-5 left-[2px] top-[2px] absolute">
        <img className="w-5 h-5 left-[2px] top-[2px] absolute" src={url}></img>
      </div>
    </div>
  );
};
