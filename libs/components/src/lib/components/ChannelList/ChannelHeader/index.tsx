import {
  CategoryNameHeader,
  ThreadNameHeader,
  Icons,
  SearchMessage,
} from './SubChannelHeader';
import thread from 'apps/chat/src/assets/SVG/ChannelListSVG/thread.svg';
import muteBell from 'apps/chat/src/assets/SVG/ChannelListSVG/mute-bell.svg';
import pin from 'apps/chat/src/assets/SVG/ChannelListSVG/pin.svg';
import threePeople from 'apps/chat/src/assets/SVG/ChannelListSVG/three-people.svg';
import threeDot from 'apps/chat/src/assets/SVG/ChannelListSVG/three-dot.svg';
import search from 'apps/chat/src/assets/SVG/ChannelListSVG/search.svg';
import inbox from 'apps/chat/src/assets/SVG/ChannelListSVG/inbox.svg';
import help from 'apps/chat/src/assets/SVG/ChannelListSVG/help.svg';

export const HeaderChannelList = () => {
  return (
    <div className="w-[1576px] flex-1 h-[72px] px-3 pt-4 pb-6 left-[272px] top-0 absolute bg-[#151515] border-b border-black justify-between items-center inline-flex">
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
