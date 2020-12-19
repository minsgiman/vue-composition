import eventBus from './../services/event.js'

export function useHubReset() {
    const EHubResetState = {
        NONE: 0,
        ONGOING: 1,
        SUCCESS: 2,
        FAIL: 3
    };

    const hubResetState = Vue.ref(EHubResetState.NONE);

    function onHubResetChanged(data) {
        if (data === 'RESET_ING') {
            hubResetState.value = EHubResetState.ONGOING;
        } else if (data === 'RESET_OK') {
            hubResetState.value = EHubResetState.SUCCESS;
        } else if (data === 'RESET_NOK') {
            hubResetState.value = EHubResetState.FAIL;
        }
    }
    eventBus.on('hubResetChanged', onHubResetChanged);
    eventBus.on('resetAll', () => {
        hubResetState.value = EHubResetState.NONE;
    });

    return {
        hubResetState,
        EHubResetState
    };
}