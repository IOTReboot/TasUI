

class DeviceManager {

    constructor() {
        this.devices = "devices" in localStorage ? JSON.parse(localStorage.getItem('devices')) : [];
    }

    addDevice(ipAddress) {
        if (!this.devices.find(item => item === ipAddress) && ipAddress.length > 0) {
            const newDevices = this.devices.concat(ipAddress);
            this.devices = newDevices;
            localStorage.setItem('devices', JSON.stringify(newDevices));
            return true;
        }
        return false;
    }

    removeDevice(ipAddress) {
        if (this.devices.find(item => item === ipAddress)) {
            const newDevices = this.devices.filter(item => item != ipAddress);
            this.devices = newDevices,
            localStorage.setItem('devices', JSON.stringify(newDevices));
        }
    }

    getDevices() {
        return this.devices;
    }
}

export default DeviceManager;