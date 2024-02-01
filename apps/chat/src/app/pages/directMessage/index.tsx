import { ChannelTopbar, DirectMessageList, FooterProfile, ServerHeader } from "@mezon/components";
import ChannelMessages from "../channel/ChanneMessages";
import { ChannelMessageBox } from "../channel/ChannelMessageBox";
import { useChat } from "@mezon/core";
import { useState } from "react";
import Setting from "../setting";
import { useSelector } from "react-redux";
import { RootState } from "@mezon/store";
import { useParams } from "react-router-dom";
export default function Direct() {
    const { currentChanel, userProfile } = useChat();
    const [openSetting, setOpenSetting] = useState(false);
    const currentDirectMess = true; //get form store
    const handleOpenCreate = () => {
        setOpenSetting(true);
    };
    const dmGroupId = "64ec3a99-84a8-4d63-a711-f925bdb13f0a";

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
                        <div className="overflow-y-scroll flex-1">{dmGroupId && <ChannelMessages channelId={dmGroupId} />}</div>
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
