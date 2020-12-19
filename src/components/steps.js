export function useSteps() {
    const EStep = {
        NONE: -1,
        STATE: 0,
        LED: 1,
        SENSOR_ADD: 2,
        SENSOR_REMOVE: 3,
        ZWAVE_RESET: 4,
        HUB_RESET: 5
    };
    const EStepState = {
        NONE: 0,
        ONGOING: 1,
        PASS: 2
    };

    const currentStep = Vue.ref(EStep.NONE);
    const steps = Vue.ref([
        { id: EStep.STATE, state: EStepState.ONGOING, text: '연결상태' },
        { id: EStep.LED, state: EStepState.NONE, text: 'LED 확인' },
        { id: EStep.SENSOR_ADD, state: EStepState.NONE, text: '센서 추가' },
        { id: EStep.SENSOR_REMOVE, state: EStepState.NONE, text: '센서 삭제' },
        { id: EStep.ZWAVE_RESET, state: EStepState.NONE, text: 'Z-Wave 리셋' },
        { id: EStep.HUB_RESET, state: EStepState.NONE, text: 'IoT HUB 리셋' }
    ]);

    const setStepState = (step, state) => {
        if (!steps.value[step]) {
            return;
        }
        steps.value[step].state = state;
        if (state === EStepState.ONGOING) {
            currentStep.value = step;
            if (steps.value[step - 1]) {
                steps.value[step - 1].state = EStepState.PASS;
            } else {
                for (let i = 0, len = steps.value.length; i < len; i+=1) {
                    if (i !== step) {
                        steps.value[i].state = EStepState.NONE;
                    }
                }
            }
        }
    };

    const getNextStep = () => {
        let nextStep;

        switch(currentStep.value) {
            case EStep.STATE:
                nextStep = EStep.LED;
                break;
            case EStep.LED:
                nextStep = EStep.SENSOR_ADD;
                break;
            case EStep.SENSOR_ADD:
                nextStep = EStep.SENSOR_REMOVE;
                break;
            case EStep.SENSOR_REMOVE:
                nextStep = EStep.ZWAVE_RESET;
                break;
            case EStep.ZWAVE_RESET:
                nextStep = EStep.HUB_RESET;
                break;
            case EStep.HUB_RESET:
                nextStep = EStep.STATE;
                break;
            default:
                nextStep = EStep.STATE;
                break;
        }
        return nextStep;
    };

    return { steps, currentStep, setStepState, getNextStep, EStep, EStepState };
}