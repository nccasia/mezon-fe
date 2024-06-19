import React, { useEffect } from 'react';
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

    useEffect(() => {
        toasts.forEach((toast) => {
            const toastFn = getToastFn(toast.type);
            toastFn(toast.message, {
                position: toast.position,
                autoClose: toast.autoClose,
                hideProgressBar: toast.hideProgressBar,
                closeOnClick: toast.closeOnClick,
                pauseOnHover: toast.pauseOnHover,
                draggable: toast.draggable,
                theme: toast.theme,
                toastId: toast.id,
            });
        });
    }, [toasts, dispatch]);

    return (
        <ToastContainer />
    );
};

export default ToastController;
