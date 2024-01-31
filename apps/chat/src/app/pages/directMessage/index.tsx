import {
  ChannelTopbar,
  DirectMessageList,
  FooterProfile,
  ServerHeader,
} from "@mezon/components";
import ChannelMessages from "../channel/ChanneMessages";
import { ChannelMessageBox } from "../channel/ChannelMessageBox";
import { useChat } from "@mezon/core";
import { useEffect, useState } from "react";
import Setting from "../setting";
export default function Direct() {
  const { userProfile } = useChat();
  const [openSetting, setOpenSetting] = useState(false);
  const currentDirectMess = true; //get form store
  const handleOpenCreate = () => {
    setOpenSetting(true);
  };
  return (
    <>
      <div className="hidden flex-col w-60 bg-bgSurface md:flex">
        <ServerHeader type={"direct"} />
        <DirectMessageList />
        <FooterProfile
          name={userProfile?.user?.username || ""}
          status={userProfile?.user?.online}
          avatar={userProfile?.user?.avatar_url || ""}
          openSetting={handleOpenCreate}
        />
      </div>
      <div className="flex flex-col flex-1 shrink min-w-0 bg-bgSecondary">
        <ChannelTopbar channel={undefined} />
        {currentDirectMess ? (
          <>
            <div className="overflow-y-scroll flex-1">
              <ChannelMessages.Skeleton />
            </div>
            <div className="flex-shrink-0 bg-bgSecondary">
              <ChannelMessageBox typeChatDirectMessage={true} />
            </div>
          </>
        ) : (
          <></>
        )}
      </div>
      <Setting
        open={openSetting}
        onClose={() => {
          setOpenSetting(false);
        }}
      />
    </>
  );
}


export const TypingText = (text: string) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let index = 0;
    const intervalId = setInterval(() => {
      setDisplayedText((prevText) => prevText + text.charAt(index));
      index++;

      if (index === text.length) {
        clearInterval(intervalId);
      }
    }, 100);

    return () => clearInterval(intervalId);
  }, [text]);

  return (
    <div className="text-2xl font-bold text-gray-800">{displayedText}</div>
  );
};
