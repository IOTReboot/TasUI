/*

  Copyright (C) 2019  Shantur Rathore
  
  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.
  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.
  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <http://www.gnu.org/licenses/>.

*/

import superagent from 'superagent';

const commands = {
    Status0: 'Status 0',
    State: 'State',
    Status8: 'Status 8',
    Module: 'Module',
    WifiPower: 'WifiPower',
}

class TasmotaDeviceConnector {

    deviceIPAddress = "";
    deviceListeners = [];
    timer = null;
    // responseMap = [{}];

    constructor(ipAddress, authInfo) {
        this.deviceIPAddress = ipAddress;
        this.online = false;
        this.authInfo = authInfo
    }

    updateIpAddress(ipAddress) {
        if (this.deviceIPAddress !== ipAddress) {
            this.deviceIPAddress = ipAddress
            this.requestDeviceStatus()
        }
    }

    connect(listener) {
        let index = this.deviceListeners.indexOf(listener)
        if (index === -1) {
            this.deviceListeners.push(listener);
        }

        if (this.deviceListeners.length === 1) {
            this.resume();
        }
    }

    disconnect(listener) {
        let index = this.deviceListeners.indexOf(listener)
        if (index !== -1) {
            this.deviceListeners.splice(index, 1)
        }

        if (this.deviceListeners.length === 0) {
            this.pause();
        }
    }

    disconnectAll() {
        this.deviceListeners.forEach((listener) => {
            this.disconnect(listener)
        })
    }

    pause() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    resume() {
        this.pause(); // Clear previous Timer
        this.timer = setInterval(this.requestDeviceStatus.bind(this), 15000);
        this.getStatus0();
    }

    requestDeviceStatus() {
        this.getState()
    }

    getStatus0() {
        this.performCommandOnDeviceDirect(commands.Status0);
    }

    getWifiPower() {
        this.performCommandOnDeviceDirect(commands.WifiPower);
    }

    getModule() {
        this.performCommandOnDeviceDirect(commands.Module);
    }

    getState() {
        this.performCommandOnDeviceDirect(commands.State);
    }

    getStatus8() {
        this.performCommandOnDeviceDirect(commands.Status8);
    }

    onCommandResponse(args) {
        if (args.key === commands.State || args.key === commands.Status0) {
            this.online = args.success
        }
        console.log(`Command ${args.key} Url : ${args.url} Response: %O`, args.response ? args.response.body : null)
        this.deviceListeners.forEach(function (deviceListener, index) {
            deviceListener.onCommandResponse(args.key, args.success, args.success ? args.response.body : null)
        });

        if (!args.success) {
            console.log(`Command ${args.key} failed. Url : ${args.url} Response: %O`, args.response)
        }

        if (args.key === commands.State) {
            this.getStatus8()
        } else if (args.key === commands.Status0) {
            this.getModule()
        } else if (args.key === commands.Module) {
            this.getWifiPower()
        }
    }

    performCommandOnDevice(cmnd) {
        this.performCommandOnDeviceDirect(cmnd);
        this.getStatus0();
    }

    performCommandOnDeviceDirect(cmnd) {
        var callback = function (err, response) {
            // console.log ("Error : %O Response : %O", err, response);
            this.onCommandResponse({ key: this.cmnd, response: response, error: err, url: this.url, ip: this.ip, success: err ? false : true });
        }
        let url = 'http://' + this.deviceIPAddress + '/cm?cmnd=' + encodeURIComponent(cmnd);

        if (this.authInfo) {
            url += `&user=${encodeURIComponent(this.authInfo.username)}&password=${encodeURIComponent(this.authInfo.password)}`
        }

        if (window.runtimeConfig.proxyMode) {
            url = '/?url=' + encodeURIComponent(url)
        }

        superagent.get(url)
            .timeout({
                response: 5000,  // Wait 5 seconds for the server to start sending,
                deadline: 60000, // but allow 1 minute for the file to finish loading.
            })
            .end(callback.bind({ onCommandResponse: this.onCommandResponse.bind(this), ip: this.deviceIPAddress, url: url, cmnd: cmnd }))
    }
}

export default TasmotaDeviceConnector;