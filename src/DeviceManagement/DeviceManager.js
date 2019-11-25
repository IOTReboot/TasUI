import TasmotaDeviceConnector from '../DeviceTypes/TasmotaDeviceConnector';
import getConfigurationForVersion from '../Configuration/TasmotaVersionedConfig'

class DeviceManager {

    deviceConnectors = {};


    constructor() {
        this.devices = "devices" in localStorage ? JSON.parse(localStorage.getItem('devices')) : {};
        this.discoveredDevices = {};
        Object.keys(this.devices).forEach((key) => {
            if (!this.devices[key].status0Response) {
                let oldInfo = Object.assign({}, this.devices[key])
                this.devices[key] = { status0Response: oldInfo }
            }
        })

        this.saveDevices()
    }

    getTasmotaConfig(macAddress) {
        let deviceInfo = this.getDevice(macAddress)

        let versionStr = deviceInfo.status0Response.StatusFWR.Version
        versionStr = versionStr.substring(0, versionStr.indexOf('('))

        let versionNumbers = versionStr.split('.')

        let version = (parseInt(versionNumbers[0]) << 24) + (parseInt(versionNumbers[1]) << 16) + (parseInt(versionNumbers[2]) << 8) + (parseInt(versionNumbers[3]))

        return getConfigurationForVersion(version)
    }

    addDevice(macAddress, deviceInfo) {
        if (macAddress.length > 0) {
            this.devices[macAddress] = deviceInfo
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
                this.devices[macAddress].status0Response = status0Response
                this.updateDeviceConnector(macAddress, status0Response.StatusNET.IPAddress)
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

    updateDeviceConnector(macAddress, ipAddress) {
        if (this.deviceConnectors[macAddress]) {
            this.deviceConnectors[macAddress].updateIpAddress(ipAddress)
        }
    }

    updateDevice(macAddress, updatedInfo) {
        if (this.devices[macAddress]) {
            this.devices[macAddress] = { ...this.devices[macAddress], ...updatedInfo }
            this.saveDevices()
            this.updateDeviceConnector(macAddress, this.devices[macAddress].status0Response.StatusNET.IPAddress)
        } else if (this.discoveredDevices[macAddress]) {
            this.discoveredDevices[macAddress] = { ...this.discoveredDevices[macAddress], ...updatedInfo }
            this.updateDeviceConnector(macAddress, this.discoveredDevices[macAddress].status0Response.StatusNET.IPAddress)
        }
    }

    removeDevice(macAddress) {
        if (this.devices[macAddress]) {
            if (this.deviceConnectors[macAddress]) {
                this.deviceConnectors[macAddress].disconnectAll()
            }
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