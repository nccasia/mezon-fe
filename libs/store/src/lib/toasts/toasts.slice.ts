import { createSlice, createEntityAdapter, PayloadAction, createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Toast, ToastPayload } from './types';
import { sleep } from '../helpers';



export const TOASTS_FEATURE_KEY = 'toasts';

// Create an adapter for the toasts
const toastsAdapter = createEntityAdapter<Toast>();

const initialState = toastsAdapter.getInitialState();

const addToast = createAsyncThunk(
  'toasts/addToast',
  async (payload: ToastPayload, thunkAPI) => {
    const id = Date.now();
    const newToast: Toast = {
      id,
      message: payload.message,
      position: payload.position || 'top-right',
      autoClose: payload.autoClose || 5000,
      hideProgressBar: payload.hideProgressBar || false,
      closeOnClick: payload.closeOnClick || true,
      pauseOnHover: payload.pauseOnHover || true,
      draggable: payload.draggable || true,
      theme: payload.theme || 'light',
      type: payload.type || 'info',
    };
    
    thunkAPI.dispatch(toastsSlice.actions.addOneToast(newToast));

    await sleep(3000)

    thunkAPI.dispatch(toastsSlice.actions.removeToast(id));
  },
  {
    condition: (toast, { getState }) => {
      const toasts = selectToasts(getState() as { toasts: typeof initialState });
      if (toasts.length >= 5) {
        return false;
      }

      // If the toast is a duplicate, don't add it
      if (toasts.find((t) => t.message === toast.message)) {
        return false;
      }
    },
  }
);

// Create the slice
export const toastsSlice = createSlice({
  name: TOASTS_FEATURE_KEY,
  initialState,
  reducers: {
    addOneToast: toastsAdapter.addOne,
    removeToast: (state, action: PayloadAction<number>) => {
      toastsAdapter.removeOne(state, action.payload);
    },
    clearToasts: (state) => {
      toastsAdapter.removeAll(state);
    },
  },
});

export const { addOneToast, removeToast, clearToasts } = toastsSlice.actions;

export const toastActions = {
  addToast,
  removeToast,
  clearToasts,
};

// Create selectors using the adapter's getSelectors method
export const {
  selectAll: selectToasts,
  selectById: selectToastById,
} = toastsAdapter.getSelectors((state: { toasts: typeof initialState }) => state.toasts);

export const toastsReducer = toastsSlice.reducer;
