import { LoaderFunction, ShouldRevalidateFunction } from 'react-router-dom';
import { channelsActions, getStoreAsync } from '@mezon/store';

export const channelLoader: LoaderFunction = async ({ params }) => {
  const { channelId } = params;
  const store = await getStoreAsync();
  if (!channelId) {
    //  throw new Error('Channel ID null')
    store.dispatch(
      channelsActions.joinChannelDirectMessage(
        '64aa49ae-62a8-4aab-ab63-f6e1364b762e',
      ),
    );
  }
  store.dispatch(channelsActions.joinChanel(channelId ?? ''));
  return null;
};

export const shouldRevalidateChannel: ShouldRevalidateFunction = (ctx) => {
  const { currentParams, nextParams } = ctx;
  const { channelId: currentChannelId } = currentParams;
  const { channelId: nextChannelId } = nextParams;

  return currentChannelId !== nextChannelId;
};
