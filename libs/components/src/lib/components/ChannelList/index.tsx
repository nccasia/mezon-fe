import { useState } from 'react';
import { useChat } from '@mezon/core';
import { Arrow } from '../Icons';
import ChannelLink from '../ChannelLink';
import { ICategory, IChannel } from '@mezon/utils';
import {
  BrowseChannel,
  Category,
  Channel,
  EventBanner,
  Events,
  Mentions,
} from './SubChannelList';
import { HeaderChannelList } from './ChannelHeader';
import { RoomStatus, RoomType } from 'libs/utils/src/lib/interface';
import line from 'apps/chat/src/assets/SVG/behind-line.svg';

const channels = {
  loadingStatus: 'loaded',
  entities: {
    channel1: {
      id: 'channel1',
      name: 'Mezon',
      clanId: 'clan1',
      categories: {
        Category1: {
          name: 'Category-voice-1',
          status: 'lock',
          type: 'voice',
        },
        Category2: {
          name: 'Category-chat-1',
          status: 'lock',
          type: 'chat',
        },
      },
      description: 'Channel 1 description',
      unread: false,
      memberIds: [],
      threadIds: [],
    },
    channel2: {
      id: 'channel2',
      name: 'Process',
      clanId: 'clan1',
      categories: {
        Category1: {
          name: 'Category-voice-2',
          status: 'lock',
          type: 'voice',
        },
        Category2: {
          name: 'Category-chat-2',
          status: 'lock',
          type: 'chat',
        },
      },
      description: 'Channel 2 description',
      unread: false,
      memberIds: [],
      threadIds: [],
    },
  },
  ids: ['channel1', 'channel2', 'channel3'],
};

export type ChannelListProps = { className?: string };

function ChannelList() {
  const { categorizedChannels, currentChannelId } = useChat();
  const [categoriesState, setCategoriesState] = useState<
    Record<string, boolean>
  >({});

  function toggleCategory(categoryId: string) {
    setCategoriesState((state) => ({
      ...state,
      [categoryId]: state[categoryId] ? !state[categoryId] : false,
    }));
  }

  return (
    <>
      <div className="w-[1440px] h-[1024px] relative flex flex-grow">
        <div className="w-[272px]   flex-col justify-start items-start  inline-flex bg-[#0B0B0B]">
          <Mentions />
          <EventBanner />
          <div className=" self-stretch grow shrink basis-0 flex-col justify-start items-start gap-4 flex">
            <div className="self-stretch h-[52px] px-4 flex-col justify-start items-start gap-3 flex mt-[24px]">
              <Events />
              <BrowseChannel />
            </div>
            <img
              src={line}
              alt="line"
              className="bg-[#888888] h-[0.08px] w-[272px]"
            />
            <Category
              name="Music-1"
              type={RoomType.CHAT}
              status={RoomStatus.LOCK}
            />

            {Object.values(channels.entities).map((channel) => {
              return (
                <Channel
                  key={channel.id}
                  name={channel.name}
                  categories={channel.categories}
                />
              );
            })}
          </div>
        </div>
        <HeaderChannelList />
      </div>
    </>
  );
}

export default ChannelList;
