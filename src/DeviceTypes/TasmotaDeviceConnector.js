import axios from '../Utils/AxiosClient';

const commands = {
    Status0 : 'Status 0'
}

class TasmotaDeviceConnector {

    deviceIPAddress = "";
    deviceListener = "";
    timer = null;
    // responseMap = [{}];

    constructor(ipAddress) {
        this.deviceIPAddress = ipAddress;
    }

    connect(listener) {
        this.deviceListener = listener;
        this.resume();
    }

    disconnect() {
        this.pause();
        this.deviceListener = null;
    }

    pause() {
        if(this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    resume() {
        this.pause(); // Clear previous Timer
        this.timer = setInterval(this.getStatus0.bind(this), 10000);
        this.getStatus0();
    }

    getStatus0() {
        this.performCommandOnDeviceDirect(commands.Status0);
    }

    onCommandResponse(args) {
        if (args.success) {
            switch(args.key) {
                case commands.Status0:
                    this.deviceListener.onStatus0(args.response);
                    break
            }
        } else {
            console.log(`Command ${args.key} failed. Url : ${args.url} Response: ${args.response}`)
        }

    }

    performCommandOnDevice(cmnd) {
        this.performCommandOnDeviceDirect(cmnd);
        this.getStatus0();
    }

    performCommandOnDeviceDirect(cmnd) {
        var callback = function(response) {
            this.onCommandResponse({key: this.cmnd, response: response, success: this.success});
        }

        axios.get('http://' +  this.deviceIPAddress  + '/cm?cmnd=' + encodeURI(cmnd))
        .then(callback.bind({onCommandResponse: this.onCommandResponse.bind(this), cmnd: cmnd, success: true}))
        .catch(callback.bind({onCommandResponse: this.onCommandResponse.bind(this), cmnd: cmnd, success: false}));

    }
}

export default TasmotaDeviceConnector;