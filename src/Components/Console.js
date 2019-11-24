import React from 'react'
import Terminal from 'react-console-emulator'
import { Box, Container, FormControlLabel, Checkbox } from '@material-ui/core'
import superagent from 'superagent';
import ActionButton from './ActionButton';

class Console extends React.Component {

    commands = {}

    constructor(props) {
        super(props)
        this.state = {
            deviceName: '',
            webLogEnabled: false,
        }
        this.terminal = React.createRef()
        this.deviceManager = this.props.deviceManager
        this.commandFired = null
    }

    onCommandResponse(cmnd, success, response) {
        if(cmnd === this.commandFired) {
            this.commandFired = null
            if (success) {
                this.addLog(JSON.stringify(response))
            } else {
                this.addLog(`${cmnd} Failed`)
            }
        }
    }

    addLog(line) {
        let rootNode = this.terminal.current.terminalRoot.current;
        let scrolledUp = rootNode.scrollTop < rootNode.scrollHeight - rootNode.clientHeight

        this.terminal.current.pushToStdout(line)
        if (!scrolledUp) {
            this.terminal.current.scrollToBottom()
        }
    }

    onWegLogEnableChanged(event) {
        this.setState({webLogEnabled: event.target.checked})
        if (event.target.checked) {
            this.startWebLog()
        } else {
            this.stopWebLog()
        }
    }

    requestLog() {
        var callback = function(err, response) {
            // console.log ("Error : %O Response : %O", err, response);
            if (response) {
                this.nextCommanNumber = response.text.substring(0, response.text.indexOf('}'));
                let index = response.text.indexOf(':');
                if (index > 0) {
                    let data = response.text.substring(index + 1)
                    data = data.substring(0, data.lastIndexOf('}1'))
                    let lines = data.split('\n')
                    for (let line of lines) {
                        this.addLog(line)
                    }
                }
            }
        }
        let url = 'http://' +  this.deviceIPAddress  + '/cs?c2=' + this.nextCommanNumber;
        superagent.get(url)
        .timeout({
            response: 1000,  // Wait 5 seconds for the server to start sending,
            deadline: 3000, // but allow 1 minute for the file to finish loading.
          })
          .end(callback.bind(this))
    }

    fireCommand(command, args) {
        this.commandFired = `${command} ${args}`
        this.deviceConnector.performCommandOnDeviceDirect(this.commandFired)
    }

    generateCommands() {
        for(let [commandCatagory, commands] of Object.entries(this.deviceConfig.commands)) {
            for(let [commandName, command] of Object.entries(commands)) {
                this.commands[commandName.toLowerCase()] = {
                    description: ' ', //command.description,
                    usage: `${commandName} ${command.options.length > 0 ? ` <value>` : ''}`,
                    fn: (args) => this.fireCommand(commandName, `${ args && args.length > 0 ? Array.from(args).join(' ') : ''}`)
                }
            }
        }
    }

    componentWillMount() {
        this.macAddress = this.props.match.params.mac
        this.deviceInfo = this.deviceManager.getDevice(this.macAddress)
        this.deviceIPAddress = this.deviceInfo.status0Response.StatusNET.IPAddress
        this.deviceConfig = this.props.deviceManager.getTasmotaConfig(this.macAddress)
        this.generateCommands()
        if (!this.deviceConnector) {
            this.deviceConnector = this.props.deviceManager.getDeviceConnector(this.macAddress, this.deviceInfo.status0Response.StatusNET.IPAddress);
        }
        this.deviceConnector.connect(this);
        this.setState({ deviceName: this.deviceInfo.status0Response.Status.FriendlyName[0] })
        this.nextCommanNumber = 0
        if (this.state.webLogEnabled) {
            this.startWebLog()
        }
    }

    startWebLog() {
        this.stopWebLog()
        this.timer = setInterval(this.requestLog.bind(this), 3000);
        this.requestLog()
    }

    stopWebLog() {
        if(this.timer) {
            clearInterval(this.timer);
            this.timer = null
        }
    }

    componentWillUnmount() {
        this.stopWebLog()
    }

    render() {

        return (
            <Box width="70%" height={700}>
                <FormControlLabel
                    value="end"
                    control={<Checkbox 
                        color="primary" 
                        checked={this.state.weblogEnabled}
                        onChange={(event) => this.onWegLogEnableChanged(event)}
                    />}
                    label="Show Weblog"
                    labelPlacement="end"
                />
                <Terminal
                    ref={this.terminal}
                    commands={this.commands}
                    welcomeMessage={'Console to ' + this.state.deviceName + '. Type help to see all commands. All commands are lowercase only'}
                    promptLabel={`${this.state.deviceName}>`}
                />
            </Box>
        )

    }
}

export default Console