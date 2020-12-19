import eventBus from './../services/event.js'
import socketClient from '../services/socketClient.js';

export function useSensorAdder() {
    const ESensorAddState = {
        NONE: 0,
        MODE_WAIT: 1,
        MODE_ON_SUCCESS: 2,
        MODE_ON_FAIL: 3,
        ADD_WAIT: 4,
        ADD_SUCCESS: 5,
        ADD_FAIL: 6
    };
    const ESensorState = {
        PLUG_ON: 0,
        PLUG_OFF: 1,
        DOOR_OPEN: 2,
        DOOR_CLOSE: 3
    };
    const ESensorChangeState = {
        NONE: 0,
        CHANGING: 1,
        CHANGED: 2
    };

    const sensorAddState = Vue.ref(ESensorAddState.NONE);
    const sensorState = Vue.ref(ESensorState.PLUG_ON);
    const sensorChangeState = Vue.ref(ESensorChangeState.NONE);


    const reqSensorAddMode = () => {
        socketClient.reqSensorAddMode();
        sensorAddState.value = ESensorAddState.MODE_WAIT;
    };
    const reqSensorStateChange = (state) => {
        if (sensorChangeState.value === ESensorChangeState.CHANGING) {
            return;
        }
        sensorChangeState.value = ESensorChangeState.CHANGING;
        socketClient.reqSensorStateChange(state);
    };

    function onAddStateChanged(data) {
        if (data === 'INSTALL_READY') {
            sensorAddState.value = ESensorAddState.MODE_ON_SUCCESS;
        } else if (data === 'INSTALL_ING') {
            sensorAddState.value = ESensorAddState.ADD_WAIT;
        } else if (data === 'INSTALL_OK') {
            sensorAddState.value = ESensorAddState.ADD_SUCCESS;
            eventBus.trigger('toast', '센서 추가가 완료되었습니다.');
        } else if (data === 'INSTALL_NOK' || data === 'INSTALL_STOP') {
            sensorAddState.value = ESensorAddState.ADD_FAIL;
        }
    }
    function onSensorStateChanged(data) {
        sensorChangeState.value = ESensorChangeState.CHANGED;
        if (data.sensortype === 'PLUG') {
            if (data.status === 'on') {
                sensorState.value = ESensorState.PLUG_ON;
                eventBus.trigger('toast', '플러그가 켜졌습니다.');
            } else {
                sensorState.value = ESensorState.PLUG_OFF;
                eventBus.trigger('toast', '플러그가 꺼졌습니다.');
            }
        } else if (data.sensortype === 'MAGNETIC') {
            if (data.isopen) {
                sensorState.value = ESensorState.DOOR_OPEN;
                eventBus.trigger('toast', '문이 열렸습니다.');
            } else {
                sensorState.value = ESensorState.DOOR_CLOSE;
                eventBus.trigger('toast', '문이 닫혔습니다.');
            }
        }
    }
    eventBus.on('addStateChanged', onAddStateChanged);
    eventBus.on('sensorStateChanged', onSensorStateChanged);
    eventBus.on('resetAll', () => {
        sensorAddState.value = ESensorAddState.NONE;
        sensorState.value = ESensorState.PLUG_ON;
        sensorChangeState.value = ESensorChangeState.NONE;
    });

    return {
        sensorAddState,
        sensorState,
        sensorChangeState,
        ESensorAddState,
        ESensorState,
        ESensorChangeState,
        reqSensorAddMode,
        reqSensorStateChange
    };
}