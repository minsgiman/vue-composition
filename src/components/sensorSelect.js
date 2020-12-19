export function useSensorSelect() {
    const sensorTypeKey = 'sensor-type-key';
    const ESensorType = {
        DOOR: 'door',
        PLUG: 'plug'
    };
    const sensorTypeOptions = [
        {
            value: ESensorType.DOOR,
            text: '문열림 센서'
        },
        {
            value: ESensorType.PLUG,
            text: '플러그 센서'
        }
    ];

    const localValue = localStorage.getItem(sensorTypeKey);
    const sensorType = Vue.ref(localValue ? localValue : ESensorType.DOOR);
    Vue.watch(sensorType, (newValue, oldValue) => {
        localStorage.setItem(sensorTypeKey, newValue);
    });

    return { ESensorType, sensorTypeOptions, sensorType };
}