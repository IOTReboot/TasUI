import superagent from 'superagent';

const commands = {
    Status0 : 'Status 0'
}

class TasmotaDeviceConnector {

    deviceIPAddress = "";
    deviceListeners = [];
    timer = null;
    // responseMap = [{}];

    constructor(ipAddress) {
        this.deviceIPAddress = ipAddress;
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
        this.timer = setInterval(this.getStatus0.bind(this), 10000);
        this.getStatus0();
    }

    getStatus0() {
        this.performCommandOnDeviceDirect(commands.Status0);
    }

    onCommandResponse(args) {
        // console.log(`Command ${args.key} Url : ${args.url} Response: %O`, args.response)
        this.deviceListeners.forEach(function (deviceListener, index) {
            if (args.success) {
                deviceListener.onCommandResponse(args.key, args.response.body)
                // switch(args.key) {
                //     case commands.Status0:
                //         deviceListener.onStatus0(args.response.body);
                //         break
                // }
            } else {
                console.log(`Command ${args.key} failed. Url : ${args.url} Response: %O`, args.response)
            }
    
        });
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