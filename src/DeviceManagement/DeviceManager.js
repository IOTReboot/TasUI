import TasmotaDeviceConnector from '../DeviceTypes/TasmotaDeviceConnector';

class DeviceManager {

    deviceConnectors = {};


    constructor() {
        this.devices = "devices" in localStorage ? JSON.parse(localStorage.getItem('devices')) : {};
        this.discoveredDevices = {};
        if (Array.isArray(this.devices)) {
            this.devices = {}
            localStorage.setItem('devices', JSON.stringify(this.devices));
        }
    }

    addDevice(macAddress, deviceInfo) {
        if (macAddress.length > 0) {
            this.devices[macAddress] = deviceInfo;
            // if (this.discoveredDevices[macAddress]) {
            //     delete this.discoveredDevices[macAddress]
            // }
            localStorage.setItem('devices', JSON.stringify(this.devices));
            return true;
        } 
        return false;
    }

    addDiscoveredDevice(macAddress, deviceInfo) {
        if (macAddress.length > 0) {
            this.discoveredDevices[macAddress] = deviceInfo;
            return true
        }
        return false
    }

    clearDiscoveredDevices() {
        for (let deviceMac in Object.keys(this.discoveredDevices)) {
            if (this.deviceConnectors[deviceMac]) {
                this.deviceConnectors[deviceMac].disconnect();
                delete this.deviceConnectors[deviceMac] 
            }
        }
        this.discoveredDevices = {};
    }

    updateDevice(macAddress, deviceInfo) {
        if (this.devices[macAddress]) {
            return this.addDevice(macAddress, deviceInfo)
        } else if (this.discoveredDevices[macAddress]) {
            return this.addDiscoveredDevice(macAddress, deviceInfo)
        }
    }

    removeDevice(macAddress) {
        if (this.devices[macAddress]) {
            delete this.devices[macAddress]
            localStorage.setItem('devices', JSON.stringify(this.devices));
        }
    }

    getDevice(macAddress) {
        if (this.devices[macAddress]) {
            return this.devices[macAddress];
        } else if (this.discoveredDevices[macAddress]) {
            return this.discoveredDevices[macAddress]
        } else {
            return null
        }
    }

    getDevices() {
        return this.devices;
    }

    getDiscoveredDevices() {
        return this.discoveredDevices;
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