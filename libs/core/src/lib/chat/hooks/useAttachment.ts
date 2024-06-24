import { attachmentActions, useAppDispatch } from "@mezon/store";
import { useCallback, useMemo } from "react";

export function useAttachments() {
    const dispatch = useAppDispatch();

    const setAttachment = useCallback(
		(status: string) => {
			dispatch(attachmentActions.setAttachment(status));
		},
		[dispatch],
	);

    const setOpenModalAttachment = useCallback(
		(status: boolean) => {
			dispatch(attachmentActions.setOpenModalAttachment(status));
		},
		[dispatch],
	);

    return useMemo(
		() => ({
            setAttachment,
            setOpenModalAttachment,
		}),
		[
            setAttachment,
            setOpenModalAttachment,
		],
	);
}