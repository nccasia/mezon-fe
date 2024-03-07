import { ModalProvider as ReactHookModalProvider } from "react-modal-hook";

type ModalProviderProps = {
    children: React.ReactNode;
};

const ModalProvider = ({ children }: ModalProviderProps) => {
    return (
        <ReactHookModalProvider>
            {children}
        </ReactHookModalProvider>
    )
}

export default ModalProvider;
