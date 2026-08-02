export {};

declare global {

    interface Window {

        showPopup?: (

            title: string,

            message: string,

            onConfirm?: () => void,

            onCancel?: () => void

        ) => void;

    }

}