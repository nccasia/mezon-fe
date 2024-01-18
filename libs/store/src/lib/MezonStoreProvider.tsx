import { Provider } from 'react-redux';
import { Store } from 'redux';
import { RootState } from './store';
import { PersistGate } from 'redux-persist/integration/react';
import { Persistor } from 'redux-persist';

type Props = {
  children: React.ReactNode;
  store: Store<RootState>;
  loading: React.ReactNode;
  persistor: Persistor;
};

export function MezonStoreProvider({ children, store, loading, persistor }: Props) {
  return (
    <Provider store={store}>
      <PersistGate loading={loading} persistor={persistor}>{children}</PersistGate>
    </Provider>
  );
}
