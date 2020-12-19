import { useSteps } from './steps.js'
import { useConnectInfo } from './connectInfo.js'
import { useSensorSelect } from './sensorSelect.js'
import { useSensorAdder } from './sensorAdder.js'
import { useSensorRemover } from './sensorRemover.js'
import { useZWaveReset } from './zwaveReset.js'
import { useHubReset } from './hubReset.js'
import { useLedChecker } from './ledChecker.js'
import eventBus from './../services/event.js'
import socketClient from '../services/socketClient.js'

const App = {
    mounted: function() {
        document.getElementById('app').style.display = 'block';

        eventBus.on('toast', (data) => {
            //this.$toast(data);
        });
    },
    setup() {
        const { steps, currentStep, setStepState, getNextStep, EStep, EStepState } = useSteps();
        const { connectInfo, reqConnectInfo } = useConnectInfo();
        const { reqLedTest } = useLedChecker();
        const { ESensorType, sensorTypeOptions, sensorType } = useSensorSelect();
        const { sensorAddState, sensorState, sensorChangeState,
            ESensorAddState, ESensorState, ESensorChangeState,
            reqSensorAddMode, reqSensorStateChange } = useSensorAdder();
        const { sensorRemoveState, ESensorRemoveState, reqSensorRemoveMode } = useSensorRemover();
        const { zwaveResetState, EZwaveResetState } = useZWaveReset();
        const { hubResetState, EHubResetState } = useHubReset();

        Vue.watch(currentStep, (newValue, prevValue) => {
            if (newValue === EStep.STATE) {
                eventBus.trigger('resetAll');
                reqConnectInfo();
            } else if (newValue === EStep.LED) {
                reqLedTest();
            } else if (newValue === EStep.SENSOR_ADD) {
                reqSensorAddMode();
            } else if (newValue === EStep.SENSOR_REMOVE) {
                reqSensorRemoveMode();
            } else if (newValue === EStep.ZWAVE_RESET) {
                setTimeout(function() {
                    socketClient.reqZwaveReset();
                }, 2000)
            } else if (newValue === EStep.HUB_RESET) {
                setTimeout(function() {
                    socketClient.reqHubReset();
                }, 2000)
            }
        });

        window.addEventListener("keydown", (evt) => {
            if (evt.code === 'Space') {
                let isMovePossible = false;
                switch(currentStep.value) {
                    case EStep.STATE: isMovePossible = (connectInfo.firmware && connectInfo.serial); break;
                    case EStep.LED: isMovePossible = true; break;
                    case EStep.SENSOR_ADD: isMovePossible = (sensorChangeState.value === ESensorChangeState.CHANGED); break;
                    case EStep.SENSOR_REMOVE: isMovePossible = (sensorRemoveState.value === ESensorRemoveState.REMOVE_SUCCESS); break;
                    case EStep.ZWAVE_RESET: isMovePossible = (zwaveResetState.value === EZwaveResetState.SUCCESS); break;
                    case EStep.HUB_RESET: isMovePossible = (hubResetState.value === EHubResetState.SUCCESS); break;
                }
                if (isMovePossible) {
                    setStepState(getNextStep(), EStepState.ONGOING);
                }
            } else if (evt.code === 'Enter') {
                if (currentStep.value === EStep.SENSOR_ADD && sensorAddState.value === ESensorAddState.ADD_SUCCESS && sensorType.value === ESensorType.PLUG) {
                    reqSensorStateChange(sensorState.value === ESensorState.PLUG_ON ? ESensorState.PLUG_OFF : ESensorState.PLUG_ON)
                }
            }
        });

        setStepState(EStep.STATE, EStepState.ONGOING);

        return {
            /* Steps */
            steps, currentStep, setStepState, getNextStep, EStep, EStepState,
            /* Connect Info */
            connectInfo, reqConnectInfo,
            /* Sensor Select */
            ESensorType, sensorTypeOptions, sensorType,
            /* Sensor Adder */
            sensorAddState, sensorState, sensorChangeState,
            ESensorAddState, ESensorState, ESensorChangeState,
            reqSensorAddMode, reqSensorStateChange,
            /* Sensor Remover */
            sensorRemoveState, ESensorRemoveState, reqSensorRemoveMode,
            /* ZWave Reset */
            zwaveResetState, EZwaveResetState,
            /* Hub Reset */
            hubResetState, EHubResetState
        }
    }
}

const app = Vue.createApp(App);
app.use(DKToast, {
    duration: 2000,
    positionY: 'bottom',
    positionX: 'right',
    styles: {
        color: '#ffffff',
        backgroundColor: '#444444',
        borderRadius: '6px',
        //marginRight: '200px'
    }
});
app.mount('#app');