import eventBus from './event.js';

function makeMsgId() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < 30; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

const realUrl = 'http://192.168.0.101:8443';

class socketClient {
    constructor() {
        this._socket = null;
        this._cameraId = '';
        this._sensorId = '';
    }

    /******** public **********/
    login() {
        this.logout();
        this._socket = io.connect(realUrl,{transports: ['xhr-polling', 'websocket'], forceNew:true});
        this._socket.on('LoginRequired', this._loginRequiredHandler.bind(this));
        this._socket.on('testerLogin', this._loginHandler.bind(this));
        this._socket.on('test', this._testHandler.bind(this));
        this._socket.on('sensor_event', this._sensorEventHandler.bind(this));
    }

    logout() {
        if (this._socket) {
            this._socket.disconnect();
            this._socket = null;
        }
        this._cameraId = '';
    }

    reqConnectInfo() {
        this._socket.emit('test', {
            "msgId": makeMsgId(),
            "type": "test",
            "object": "getCameraInfo",
            "userId": "web"
        });
    }

    reqLedTest() {
        this._socket.emit('test', {
            "msgId": makeMsgId(),
            "cameraId": this._cameraId,
            "type": "test",
            "object": "led"
        });
    }

    reqSensorAddMode() {
        this._socket.emit('test', {
            "msgId": makeMsgId(),
            "cameraId": this._cameraId,
            "type": "test",
            "object": "sensor",
            "status": "add"
        });
    }

    reqSensorRemoveMode() {
        this._socket.emit('test', {
            "msgId": makeMsgId(),
            "cameraId": this._cameraId,
            "type":"test",
            "object":"sensor",
            "status":"del"
        });
    }

    reqSensorStateChange() {
        this._socket.emit('test', {
            "msgid": makeMsgId(),
            "object":"sensor_control",
            "sensorid": this._sensorId,
            "type":"plug",
            "status":"on",
            "userId":"web"
        });
    }

    reqZwaveReset() {
        setTimeout(() => {
            eventBus.trigger('zwaveResetChanged', true);
        }, 1000);
    }

    reqHubReset() {
        setTimeout(() => {
            eventBus.trigger('hubResetChanged', true);
        }, 1000);
    }

    /******** private **********/
    _loginRequiredHandler(message) {
        this._socket.emit('testerLogin', {
            "msgId": makeMsgId(),
            "type": "cmd",
            "object": "testerLogin",
            "userId": "web"
        });
    }

    _loginHandler(msg) {
        eventBus.trigger('login', msg);
    }

    _testHandler(msg) {
        if (msg.fwVersion) {
            this._cameraId = msg.cameraId;
            eventBus.trigger('connectInfo', msg);
        } else if (msg.object === 'sensor') {
            switch(msg.result) {
                case 'INSTALL_OK':
                    this._sensorId = msg.sensorid;
                    eventBus.trigger('addStateChanged', msg.result);
                    break;
                case 'INSTALL_READY':
                case 'INSTALL_NOK':
                case 'INSTALL_ING':
                case 'INSTALL_STOP':
                    eventBus.trigger('addStateChanged', msg.result);
                    break;
                case 'REMOVE_READY':
                case 'REMOVE_NOK':
                case 'REMOVE_ING':
                case 'REMOVE_STOP':
                case 'REMOVE_OK':
                    eventBus.trigger('removeStateChanged', msg.result);
                    break;
                case 'RESET_NOK':
                case 'RESET_ING':
                case 'RESET_OK':
                    eventBus.trigger('zwaveResetChanged', msg.result);
                    break;
            }
        } else if (msg.object === 'end') {
            eventBus.trigger('hubResetChanged', msg.result);
        }
    }

    _sensorEventHandler(msg) {
        eventBus.trigger('sensorStateChanged', msg);
    }
}

export default new socketClient();