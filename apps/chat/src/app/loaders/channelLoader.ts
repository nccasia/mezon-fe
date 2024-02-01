import { LoaderFunction, ShouldRevalidateFunction } from "react-router-dom";
import { channelsActions, getStoreAsync } from "@mezon/store";

export const channelLoader: LoaderFunction = async ({ params }) => {
    const { channelId } = params;

    const store = await getStoreAsync();
    if (!channelId) {
        throw new Error("Channel ID null");
    }
    // store.dispatch(channelsActions.joinChanel(channelId));
    return null;
};

export const dmGroupMessaage: LoaderFunction = async ({ params }) => {
    const { dmGroupId } = params;
    const store = await getStoreAsync();
    if (!dmGroupId) {
        throw new Error("dmGroupId ID null");
    }
    store.dispatch(channelsActions.joinChanel(dmGroupId));
    return null;
};

export const shouldRevalidateChannel: ShouldRevalidateFunction = (ctx) => {
    const { currentParams, nextParams } = ctx;
    const { channelId: currentChannelId } = currentParams;
    const { channelId: nextChannelId } = nextParams;

    return currentChannelId !== nextChannelId;
};
