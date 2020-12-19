import eventBus from './../services/event.js'
import socketClient from '../services/socketClient.js';

export function useConnectInfo() {
    const connectInfo = Vue.reactive({
        country: '',
        serial: '',
        firmware: '',
        ipAddress: '',
        macAddress: '',
        networkType: '',
        zwaveId: '',
        bluetooth: ''
    });

    const reqConnectInfo = () => {
        socketClient.login();
    };

    eventBus.on('login', (msg) => {
        socketClient.reqConnectInfo();
    });

    eventBus.on('connectInfo', (msg) => {
        connectInfo.country = msg.country;
        connectInfo.serial = msg.cameraId;
        connectInfo.firmware = msg.fwVersion;
        connectInfo.ipAddress = msg.ipAddr;
        connectInfo.macAddress = msg.macAddr;
        connectInfo.networkType = 'Wi-Fi(dummy)';
        connectInfo.zwaveId = msg.homeId;
        connectInfo.bluetooth = 'Toasthub_' + (msg.macAddr ? msg.macAddr.replace(/:/g, "") : '');
    });

    eventBus.on('resetAll', () => {
        connectInfo.serial = '';
        connectInfo.firmware = '';
        connectInfo.ipAddress = '';
        connectInfo.macAddress = '';
        connectInfo.networkType = '';
        connectInfo.zwaveId = '';
        connectInfo.bluetooth = '';
    });

    return { connectInfo, reqConnectInfo };
}