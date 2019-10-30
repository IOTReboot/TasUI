import axios from '../Utils/AxiosClient';

const commands = {
    Status0 : 'Status 0'
}

class TasmotaDeviceConnector {

    deviceIPAddress = "";
    deviceListener = "";
    // responseMap = [{}];

    constructor(ipAddress) {
        this.deviceIPAddress = ipAddress;
    }

    connect(listener) {
        this.deviceListener = listener;
        this.getStatus0();
    }

    disconnect() {
        this.deviceListener = null;
    }

    getStatus0() {
        this.performCommandOnDevice(commands.Status0);
    }

    onCommandResponse(cmnd, response) {
        switch(cmnd) {
            case commands.Status0:
                this.deviceListener.onStatus0(response);
                break
        }

    }

    async performCommandOnDevice(cmnd) {
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