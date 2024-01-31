import { LoaderFunction, ShouldRevalidateFunction } from "react-router-dom";
import { channelsActions, getStoreAsync } from "@mezon/store";

export const channelLoader: LoaderFunction = async ({ params }) => {
  const { channelId } = params;

  const store = await getStoreAsync();
  if (!channelId) {
    throw new Error("Channel ID null");
  }
  store.dispatch(channelsActions.joinChanel(channelId));
  return null;
};

// export const directMessageLoader: LoaderFunction = async ({ params }) => {
//   console.log("channel-loader", params);
//   const { channelId } = params;

//   const store = await getStoreAsync();
//   if (!channelId) {
//     throw new Error("Channel ID null");
//   }
//   store.dispatch(channelsActions.joinChanelDM(channelId));
//   return null;
// };

export const shouldRevalidateChannel: ShouldRevalidateFunction = (ctx) => {
  const { currentParams, nextParams } = ctx;
  const { channelId: currentChannelId } = currentParams;
  const { channelId: nextChannelId } = nextParams;

  return currentChannelId !== nextChannelId;
};
