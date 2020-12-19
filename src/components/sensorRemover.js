import eventBus from './../services/event.js'
import socketClient from '../services/socketClient.js';

export function useSensorRemover() {
    const ESensorRemoveState = {
        NONE: 0,
        MODE_WAIT: 1,
        MODE_ON_SUCCESS: 2,
        MODE_ON_FAIL: 3,
        REMOVE_WAIT: 4,
        REMOVE_SUCCESS: 5,
        REMOVE_FAIL: 6
    };

    const sensorRemoveState = Vue.ref(ESensorRemoveState.NONE);

    const reqSensorRemoveMode = () => {
        socketClient.reqSensorRemoveMode();
        sensorRemoveState.value = ESensorRemoveState.MODE_WAIT;
    };

    function onRemoveStateChanged(data) {
        if (data === 'REMOVE_READY') {
            sensorRemoveState.value = ESensorRemoveState.MODE_ON_SUCCESS;
        } else if (data === 'REMOVE_ING') {
            sensorRemoveState.value = ESensorRemoveState.REMOVE_WAIT;
        } else if (data === 'REMOVE_OK') {
            sensorRemoveState.value = ESensorRemoveState.REMOVE_SUCCESS;
            eventBus.trigger('toast', '센서 삭제가 완료되었습니다.');
        } else if (data === 'REMOVE_NOK' || data === 'REMOVE_STOP') {
            sensorRemoveState.value = ESensorRemoveState.MODE_ON_FAIL;
        }
    }
    eventBus.on('removeStateChanged', onRemoveStateChanged);
    eventBus.on('resetAll', () => {
        sensorRemoveState.value = ESensorRemoveState.NONE;
    });

    return {
        sensorRemoveState,
        ESensorRemoveState,
        reqSensorRemoveMode
    };
}