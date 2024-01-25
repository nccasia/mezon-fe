import { IChannel } from '@mezon/utils';
import * as Icons from '../Icons';
import { ChannelLable, ThreadLable, SearchMessage } from './TopBarComponents';
export type ChannelTopbarProps = {
  channel?: IChannel;
};

function ChannelTopbar({ channel }: ChannelTopbarProps) {
  return (
    <div className="flex h-[72px] min-w-0 items-center bg-bgSecondary border-b border-black px-3 pt-4 pb-6 flex-shrink ">
      <div className="justify-start items-center gap-1 flex">
        <ChannelLable
          ChannelType="voice"
          channelStatus="lock"
          name={channel?.channel_lable}
        />
        <ThreadLable name={channel?.channel_lable} />
      </div>

      {/* Desktop buttons */}
      <div className="hidden items-center h-[72px] ml-auto lg:flex">
        <div className="justify-end items-center gap-2 flex">
          <div className="justify-start items-center gap-[15px] flex">
            <button>
              <Icons.ThreadIcon />
            </button>

            <button>
              <Icons.MuteBell />
            </button>

            <button>
              <Icons.PinRight />
            </button>

            <button>
              <Icons.MemberList />
            </button>

            <button>
              <Icons.ThreeDot />
            </button>
          </div>
          <SearchMessage />
          <div className="justify-start items-start gap-4 flex">
            <button>
              <Icons.Inbox />
            </button>
            <button>
              <Icons.Help />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChannelTopbar;
