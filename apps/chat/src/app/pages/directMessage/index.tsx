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
    console.log("crrr", currentChanel);
    const [openSetting, setOpenSetting] = useState(false);
    const currentDirectMess = true; //get form store
    const handleOpenCreate = () => {
        setOpenSetting(true);
    };
    const dmGroupId = "21ea6d0d-7f22-4882-8466-90aa882aa180";

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
