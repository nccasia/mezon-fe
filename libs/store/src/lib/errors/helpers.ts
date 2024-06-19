import { ToastPayload } from "../toasts";
import { ThunkErrorRejectMeta } from "./types";

export function withError(payload: string | boolean | ToastPayload = true): ThunkErrorRejectMeta {
    return {
        error: {
            toast: payload,
        }
    }
}