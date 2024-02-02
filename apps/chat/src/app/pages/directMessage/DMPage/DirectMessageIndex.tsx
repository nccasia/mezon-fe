import { ChannelList, ChannelTopbar, FooterProfile, MemberList, ServerHeader } from "@mezon/components";
import { useAppNavigation, useAppParams } from "@mezon/core";
import { selectDefaultChannelIdByClanId } from "@mezon/store";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import ChannelMessages from "../../channel/ChanneMessages";
import { ChannelMessageBox } from "../../channel/ChannelMessageBox";

export function DirectMessageIndex() {
    const { serverId } = useAppParams();
    const defaultChannelId = useSelector(selectDefaultChannelIdByClanId(serverId || ''))
    const { navigate } = useAppNavigation();

    useEffect(() => {
        if (defaultChannelId) {
            navigate(`./${defaultChannelId}`)
        }
    }, [defaultChannelId, navigate])

    return (
        <div className="flex flex-col flex-1 shrink min-w-0 bg-bgSecondary h-[100%]">
            <ChannelTopbar channel={null} />
            <div className="flex h-screen">
                <div className="flex flex-col flex-1">
                    <div className="overflow-y-auto bg-[#1E1E1E] h-[751px]">
                        <ChannelMessages.Skeleton />
                    </div>
                    <div className="flex-shrink-0 bg-bgSecondary">
                        <ChannelMessageBox.Skeleton />
                    </div>
                </div>
                <div className="w-[268px] bg-bgSurface md:flex">
                    <MemberList />
                </div>
            </div>
        </div>
    )
}