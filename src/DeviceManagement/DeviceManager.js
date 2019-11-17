import TasmotaDeviceConnector from '../DeviceTypes/TasmotaDeviceConnector';

class DeviceManager {

    deviceConnectors = {};


    constructor() {
        this.devices = "devices" in localStorage ? JSON.parse(localStorage.getItem('devices')) : {};
        this.discoveredDevices = {};
        Object.keys(this.devices).forEach((key) => {
            if(!this.devices[key].status0Response) {
                let oldInfo = Object.assign({}, this.devices[key])
                this.devices[key] = { status0Response: oldInfo}
            }
        })

        this.saveDevices()
    }

    addDevice(macAddress, status0Response) {
        if (macAddress.length > 0) {
            this.devices[macAddress] = {
                status0Response: status0Response,
            }
            // if (this.discoveredDevices[macAddress]) {
            //     delete this.discoveredDevices[macAddress]
            // }
            this.saveDevices()
            return true;
        } 
        return false;
    }

    saveDevices() {
        localStorage.setItem('devices', JSON.stringify(this.devices));
    }

    addDiscoveredDevice(macAddress, status0Response) {
        if (macAddress.length > 0) {
            if (this.discoveredDevices[macAddress]) {
                this.discoveredDevices[macAddress].status0Response = status0Response
            } else {
                this.discoveredDevices[macAddress] = {
                    status0Response: status0Response,
                }
            }
            if (this.devices[macAddress]) {
                this.devices[macAddress].status0Response =  status0Response
                this.updateDeviceConnector(macAddress)
            }
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

    updateDeviceConnector(macAddress) {
        if (this.deviceConnectors[macAddress]) {
            this.deviceConnectors[macAddress].updateIpAddress(this.devices[macAddress].status0Response.StatusNET.IPAddress)
        }
    }

    updateDevice(macAddress, updatedInfo) {
        if (this.devices[macAddress]) {
            this.devices[macAddress] = {...this.devices[macAddress], ...updatedInfo}
            this.saveDevices()
        } else if (this.discoveredDevices[macAddress]) {
            this.discoveredDevices[macAddress] = {...this.discoveredDevices[macAddress], ...updatedInfo}
        }
        this.updateDeviceConnector(macAddress)
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