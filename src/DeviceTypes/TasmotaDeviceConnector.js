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

    onCommandResponse(cmnd, response) {
        switch(cmnd) {
            case commands.Status0:
                this.deviceListener.onStatus0(response);
                break
        }

    }

    performCommandOnDevice(cmnd) {
        this.performCommandOnDeviceDirect(cmnd);
        this.getStatus0();
    }

    async performCommandOnDeviceDirect(cmnd) {
        try {
            // Load async data from an inexistent endpoint.
            let response = await axios.get('http://' +  this.deviceIPAddress  + '/cm?cmnd=' + encodeURI(cmnd));
            this.onCommandResponse(cmnd, response)
        } catch (e) {
            console.log(`Cmnd : ${cmnd} request failed: ${e}`);
        }

    }
}

export default TasmotaDeviceConnector;