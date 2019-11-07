import TasmotaDeviceConnector from '../DeviceTypes/TasmotaDeviceConnector';

class DeviceManager {

    deviceConnectors = {};

    constructor() {
        this.devices = "devices" in localStorage ? JSON.parse(localStorage.getItem('devices')) : {};
        if (Array.isArray(this.devices)) {
            this.devices = {}
            localStorage.setItem('devices', JSON.stringify(this.devices));
        }
    }

    addDevice(macAddress, deviceInfo) {
        if (macAddress.length > 0) {
            this.devices[macAddress] = deviceInfo;
            localStorage.setItem('devices', JSON.stringify(this.devices));
            return true;
        } 
        return false;
    }

    removeDevice(macAddress) {
        if (this.devices[macAddress]) {
            delete this.devices[macAddress]
            localStorage.setItem('devices', JSON.stringify(this.devices));
        }
    }

    getDevice(macAddress) {
        return this.devices[macAddress];
    }

    getDevices() {
        return this.devices;
    }

    isDeviceKnown(macAddress) {
        return this.devices[macAddress] != null;
    }

    getDeviceConnector(macAddress, ipAddress) {
        if (this.deviceConnectors[macAddress]) {
            return this.deviceConnectors[macAddress];
        } else {
            let deviceConnector = new TasmotaDeviceConnector(ipAddress);
            this.deviceConnectors[macAddress] = deviceConnector;
            return deviceConnector;
        }
    }
}

export default DeviceManager;