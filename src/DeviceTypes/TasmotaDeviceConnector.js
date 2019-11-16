import superagent from 'superagent';

const commands = {
    Status0 : 'Status 0',
    State: 'State',
    Status8: 'Status 8',
}

class TasmotaDeviceConnector {

    deviceIPAddress = "";
    deviceListeners = [];
    timer = null;
    // responseMap = [{}];

    constructor(ipAddress) {
        this.deviceIPAddress = ipAddress;
        this.online = false;
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

    pause() {
        if(this.timer) {
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

    getState() {
        this.performCommandOnDeviceDirect(commands.State);
    }

    getStatus8() {
        this.performCommandOnDeviceDirect(commands.Status8);
    }

    onCommandResponse(args) {
        if (args.key === commands.State || args.key == commands.Status0) {
            this.online = args.success
        }
        // console.log(`Command ${args.key} Url : ${args.url} Response: %O`, args.response)
        this.deviceListeners.forEach(function (deviceListener, index) {
            deviceListener.onCommandResponse(args.key, args.success, args.success ? args.response.body : null)    
        });

        if (!args.success) {
            console.log(`Command ${args.key} failed. Url : ${args.url} Response: %O`, args.response)
        }

        if(args.key === commands.State) {
            this.getStatus8()
        }
    }

    performCommandOnDevice(cmnd) {
        this.performCommandOnDeviceDirect(cmnd);
        this.getStatus0();
    }

    performCommandOnDeviceDirect(cmnd) {
        var callback = function(err, response) {
            // console.log ("Error : %O Response : %O", err, response);
            this.onCommandResponse({key: this.cmnd, response: response, error: err, url: this.url, ip: this.ip, success: err ? false : true});
        }
        let url = 'http://' +  this.deviceIPAddress  + '/cm?cmnd=' + encodeURI(cmnd);
        superagent.get(url)
        .timeout({
            response: 5000,  // Wait 5 seconds for the server to start sending,
            deadline: 60000, // but allow 1 minute for the file to finish loading.
          })
          .end(callback.bind({onCommandResponse: this.onCommandResponse.bind(this), ip: this.deviceIPAddress, url: url, cmnd: cmnd}))
    }
}

export default TasmotaDeviceConnector;