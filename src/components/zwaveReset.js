import eventBus from './../services/event.js'

export function useZWaveReset() {
    const EZwaveResetState = {
        NONE: 0,
        ONGOING: 1,
        SUCCESS: 2,
        FAIL: 3
    };

    const zwaveResetState = Vue.ref(EZwaveResetState.NONE);

    function onZwaveResetChanged(data) {
        if (data === 'RESET_ING') {
            zwaveResetState.value = EZwaveResetState.ONGOING;
        } else if (data === 'RESET_OK') {
            zwaveResetState.value = EZwaveResetState.SUCCESS;
        } else if (data === 'RESET_NOK') {
            zwaveResetState.value = EZwaveResetState.FAIL;
        }
    }
    eventBus.on('zwaveResetChanged', onZwaveResetChanged);
    eventBus.on('resetAll', () => {
        zwaveResetState.value = EZwaveResetState.NONE;
    });

    return {
        zwaveResetState,
        EZwaveResetState
    };
}