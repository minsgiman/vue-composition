import socketClient from '../services/socketClient.js';

export function useLedChecker() {
    const reqLedTest = () => {
        socketClient.reqLedTest();
    };

    return { reqLedTest };
}