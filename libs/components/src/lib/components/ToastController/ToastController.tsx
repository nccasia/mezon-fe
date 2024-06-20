import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectToasts } from '@mezon/store';
import { ToastContainer, toast as showToast } from 'react-toastify';
import { ToastPayload } from 'libs/store/src/lib/toasts';

function getToastFn(type: ToastPayload['type']) {
    switch (type) {
        case 'success':
            return showToast.success;
        case 'error':
            return showToast.error;
        case 'info':
            return showToast.info;
        case 'warning':
            return showToast.warning;
        default:
            return showToast;
    }
}

const ToastController: React.FC = () => {
    const dispatch = useDispatch();
    const toasts = useSelector(selectToasts);
    const trackedToasts = useRef<any>({});

    useEffect(() => {
        for (const toast of toasts) {
            if (trackedToasts.current[toast.id]) {
                continue;
            }

            const toastFn = getToastFn(toast.type);

            const id = toastFn(toast.message, {
                position: toast.position,
                autoClose: toast.autoClose,
                hideProgressBar: toast.hideProgressBar,
                closeOnClick: toast.closeOnClick,
                pauseOnHover: toast.pauseOnHover,
                draggable: toast.draggable,
                theme: toast.theme,
                toastId: toast.id,
            });

            trackedToasts.current[toast.id] = id;
        }
    }, [toasts, trackedToasts, dispatch]);

    return (
        <ToastContainer
            position="top-right"
            autoClose={2200}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
        />
    );
};

export default ToastController;
