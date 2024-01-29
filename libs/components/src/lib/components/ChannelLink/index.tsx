import { Link } from 'react-router-dom';
import { ChannelTypeEnum, IChannel } from '@mezon/utils';
import { AddPerson, Hashtag, Speaker } from '../Icons';
import * as Icons from '../Icons';

export type ChannelLinkProps = {
  serverId?: string;
  channel: IChannel;
  active?: boolean;
  createInviteLink: (serverId: string, channelId: string) => void;
};

function ChannelLink({
  serverId,
  channel,
  active,
  createInviteLink,
}: ChannelLinkProps) {
  const state = active
    ? 'active'
    : channel?.unread
      ? 'inactiveUnread'
      : 'inactiveRead';

  const classes = {
    active: 'flex flex-row items-center px-2 mx-2 rounded relative p-1',
    inactiveUnread:
      'flex flex-row items-center px-2 mx-2 rounded relative p-1 hover:bg-[#36373D]',
    inactiveRead:
      'flex flex-row items-center px-2 mx-2 rounded relative p-1 hover:bg-[#36373D]',
  };

  const handleCreateLinkInvite = () => {
    createInviteLink(serverId || '', channel.channel_id || '');
  };

  return (
    <div className="relative group ">
      <Link to={`/chat/servers/${serverId}/channels/${channel.id}`}>
        <span className={`${classes[state]} ${active ? 'bg-[#36373D]' : ''}`}>
          {state === 'inactiveUnread' && (
            <div className="absolute left-0 -ml-2 w-1 h-2 bg-white rounded-r-full"></div>
          )}
          <div className="relative">
            {channel.type === ChannelTypeEnum.CHANNEL_TEXT ? (
              <Hashtag />
            ) : (
              <Speaker />
            )}
            <div className="absolute left-3 top-0">
              {channel.channel_private === 1 && (
                <Icons.Private defaultSize="w-3 h-3" defaultFill="#FFFFFF" />
              )}
            </div>
          </div>

          <p
            className={`ml-2 text-[#AEAEAE] w-full hover:text-white text-sm focus:bg-[#36373D] ${active ? 'text-white' : ''}`}
          >
            {channel?.channel_lable}
          </p>
        </span>
      </Link>
      <AddPerson
        className={`absolute ml-auto w-4 h-4  top-[6px] right-3 group-hover:text-white  ${active ? 'text-white' : 'text-[#0B0B0B]'}`}
        onClick={handleCreateLinkInvite}
      />
    </div>
  );
}

export default ChannelLink;
