import { useEffect, useState } from "react";
import { useAppNavigation, useChat } from "@mezon/core";
import ChannelLink from "../ChannelLink";
import { IChannel, ICategoryChannel, ICategory } from "@mezon/utils";
import { Events, BrowseChannel } from "./ChannelListComponents";
import { RootState, channelsActions, useAppDispatch } from "@mezon/store";
import * as Icons from "../Icons";
import { CreateNewChannelModal } from "libs/components/src/lib/components/CreateChannelModal/index";
import { Modal } from "@mezon/ui";
import { useSelector } from "react-redux";


export type ChannelListProps = { className?: string };
export type CategoriesState = Record<string, boolean>;

function ChannelList() {

  const { categorizedChannels, currentChanel } = useChat();
  const [categoriesState, setCategoriesState] = useState<CategoriesState>(
    categorizedChannels.reduce((acc, category) => {
      acc[category.id] = false;
      return acc;
    }, {} as CategoriesState),
  );

  const handleToggleCategory = (
    category: ICategoryChannel,
    setToTrue?: boolean,
  ) => {
    if (setToTrue) {
      setCategoriesState((prevState) => ({
        ...prevState,
        [category.id]: prevState[category.id],
      }));
    } else {
      setCategoriesState((prevState) => ({
        ...prevState,
        [category.id]: !prevState[category.id],
      }));
    }
  };

  const { currentClan, createLinkInviteUser } = useChat();
  const dispatch = useAppDispatch();
  const openModalCreateNewChannel = (paramCategory: ICategory) => {
    dispatch(channelsActions.openCreateNewModalChannel(true));
    dispatch(channelsActions.getCurrentCategory(paramCategory));
  };

  const [openInvite, setOpenInvite] = useState(false);

  const [urlInvite, setUrlInvite] = useState("");

  const handleOpenInvite = (
    currentServerId: string,
    currentChannelId: string,
  ) => {
    setOpenInvite(true);
    createLinkInviteUser(
      currentServerId ?? "",
      currentChannelId ?? "",
      10,
    ).then((res) => {
      if (res && res.invite_link) {
        setUrlInvite(window.location.origin + "/invite/" + res.invite_link);
      }
    });
  };

  const unsecuredCopyToClipboard = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
    } catch (err) {
      console.error('Unable to copy to clipboard', err);
    }
    document.body.removeChild(textArea);
  };

  const handleCopyToClipboard = (content: string) => {
    if (window.isSecureContext && navigator.clipboard) {
      navigator.clipboard.writeText(content);
    } else {
      unsecuredCopyToClipboard(content);
    }
  };

  return (
    <>
      {<CreateNewChannelModal />}
      <div className="self-stretch h-[52px] px-4 flex-col justify-start items-start gap-3 flex mt-[24px]">
        <Events />
        <BrowseChannel />
      </div>
      <hr className="h-[0.08px] w-[272px] mt-[24px] border-[#1E1E1E]" />

      <div className="overflow-y-scroll flex-1 pt-3 space-y-[21px] font-medium text-gray-300 scrollbar-hide ">
        {categorizedChannels.map((category: ICategoryChannel) => (
          <div key={category.id}>
            {category.category_name && (
              <div className="flex flex-row px-2 relative">
                <button
                  onClick={() => {
                    handleToggleCategory(category);
                  }}
                  className="font-['Manrope'] text-[#AEAEAE] font-bold flex items-center px-0.5 w-full font-title text-xs tracking-wide hover:text-gray-100 uppercase"
                >
                  {!categoriesState[category.id] ? (
                    <Icons.ArrowDown />
                  ) : (
                    <Icons.ArrowRight />
                  )}

                  {category.category_name}
                </button>
                <button
                  onClick={() => {
                    handleToggleCategory(category, true);
                    openModalCreateNewChannel(category);
                  }}
                >
                  <Icons.Plus />
                </button>
              </div>
            )}
            {!categoriesState[category.id] && (
              <div className="mt-[5px] space-y-0.5 font-['Manrope'] text-[#AEAEAE]">
                {category?.channels
                  ?.filter((channel: IChannel) => {
                    const categoryIsOpen = !categoriesState[category.id];
                    return categoryIsOpen || channel?.unread;
                  })
                  .map((channel: IChannel) => (
                    <ChannelLink
                      serverId={channel?.clan_id}
                      channel={channel}
                      active={currentChanel?.id === channel.id}
                      key={channel.id}
                      createInviteLink={handleOpenInvite}
                    />
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <Modal
        title="Invite friend"
        onClose={() => {
          setOpenInvite(false);
        }}
        showModal={openInvite}
        confirmButton={() => handleCopyToClipboard(urlInvite)}
        titleConfirm="Copy"
      >
        <p>
          <span>{urlInvite}</span>
        </p>
      </Modal>
    </>
  );
}

export default ChannelList;
