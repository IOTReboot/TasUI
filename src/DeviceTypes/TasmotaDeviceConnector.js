import axios from '../Utils/AxiosClient';

class TasmotaDeviceConnector {

    deviceIPAddress = "";
    deviceListener = "";

    constructor(ipAddress) {
        this.deviceIPAddress = ipAddress;
    }

    connect(listener) {
        this.deviceListener = listener;
        this.getStatus0();
    }

    disconnect() {

    }

    async getStatus0() {
        try {
            // Load async data from an inexistent endpoint.
            let response = await axios.get('http://' +  this.deviceIPAddress  + '/cm?cmnd=Status0');
            this.deviceListener.onStatus0(response);
            } catch (e) {
                console.log(`😱 Axios request failed: ${e}`);
            }

    }
}

export default TasmotaDeviceConnector;