import { ToastPayload } from "../toasts";

export type ThunkErrorRejectMeta = {
    error?: {
        toast?: string | boolean | ToastPayload;
    };
};

export type ThunkConfigWithError = {
    rejectedMeta: ThunkErrorRejectMeta;
};
