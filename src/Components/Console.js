import React from 'react'
import { withStyles, ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import Terminal from 'react-console-emulator'
import { Box, Container, FormControlLabel, Checkbox } from '@material-ui/core'
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import superagent from 'superagent';
import ActionButton from './ActionButton';
import HelpIcon from '@material-ui/icons/Help';
import ClearIcon from '@material-ui/icons/Clear';

const styles = theme => ({
    terminal: {
        flexGrow: 1,
        flexBasis: "0",
        flexShrink: 1,
        height: "80vh",
        overflow: "hidden",
    },
})

class Console extends React.Component {

    commands = {}

    constructor(props) {
        super(props)
        this.state = {
            deviceName: '',
            webLogEnabled: false,
            weblogLevel: 2,
        }
        this.terminal = React.createRef()
        this.deviceManager = this.props.deviceManager
        this.commandFired = null
    }

    onCommandResponse(cmnd, success, response) {
        console.log(`onCommandResponse ${cmnd} === ${this.commandFired}`)
        if (cmnd === this.commandFired) {
            this.commandFired = null
            if (success) {
                this.addLog(JSON.stringify(response))
            } else {
                this.addLog(`${cmnd} Failed`)
            }
        }

        if (cmnd.toLowerCase().startsWith('weblog ') && success) {
            if (response.WebLog) {
                this.setState({ weblogLevel: response.WebLog })
            } else {
                this.setState({ weblogLevel: 1 })
            }
        }
    }

    sendConsoleCommand(cmnd) {
        this.terminal.current.terminalInput.current.value = cmnd
        this.terminal.current.processCommand()
    }

    addLog(line) {
        let rootNode = this.terminal.current.terminalRoot.current;
        let scrolledUp = rootNode.scrollTop < rootNode.scrollHeight - rootNode.clientHeight

        this.terminal.current.pushToStdout(line)
        if (!scrolledUp) {
            this.terminal.current.scrollToBottom()
        }
    }

    onWebLogLevelChanged(event) {
        event.stopPropagation()
        this.fireCommand('WebLog ' + event.target.value)
    }

    onWegLogEnableChanged(event) {
        this.setState({ webLogEnabled: event.target.checked })
        if (event.target.checked) {
            this.startWebLog()
        } else {
            this.stopWebLog()
        }
    }

    requestLog() {
        var callback = function (err, response) {
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
        let url = 'http://' + this.deviceIPAddress + '/cs?c2=' + this.nextCommanNumber;

        if (this.deviceInfo.authInfo) {
            url += `&user=${encodeURI(this.deviceInfo.authInfo.username)}&password=${encodeURI(this.deviceInfo.authInfo.password)}`
        }

        superagent.get(url)
            .timeout({
                response: 1000,  // Wait 5 seconds for the server to start sending,
                deadline: 3000, // but allow 1 minute for the file to finish loading.
            })
            .end(callback.bind(this))
    }

    fireCommand(command, args) {
        this.commandFired = `${command} ${args}`
        console.log(`FireCommand ${this.commandFired}`)
        this.deviceConnector.performCommandOnDeviceDirect(this.commandFired)
    }

    generateCommands() {
        for (let [commandCatagory, commands] of Object.entries(this.deviceConfig.commands)) {
            for (let [commandName, command] of Object.entries(commands)) {
                this.commands[commandName.toLowerCase()] = {
                    description: ' ', //command.description,
                    usage: `${commandName} ${command.options.length > 0 ? ` <value>` : ''}`,
                    fn: (args) => this.fireCommand(commandName, args ? args : '')
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

    componentDidMount() {
        window.gtag('event', 'screen_view', { 'screen_name': 'Console'});
        this.fireCommand('Weblog')
    }

    startWebLog() {
        this.stopWebLog()
        this.timer = setInterval(this.requestLog.bind(this), 3000);
        this.requestLog()
    }

    stopWebLog() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null
        }
    }

    componentWillUnmount() {
        this.stopWebLog()
        this.deviceConnector.disconnect(this);
    }

    toCamelCase(string) {
        return string.replace(/^([A-Z])|\s(\w)/g, function (match, p1, p2, offset) {
            if (p2) return p2.toUpperCase();
            return p1.toLowerCase();
        });
    }

    render() {
        const { classes } = this.props

        return (
            <Box>
                <Box flexGrow={1}>
                    <FormControlLabel
                        value="end"
                        control={<Checkbox
                            color="primary"
                            checked={this.state.weblogEnabled}
                            onChange={(event) => this.onWegLogEnableChanged(event)}
                        />}
                        label="Fetch Weblog"
                        labelPlacement="end"
                    />

                    <ActionButton
                        toolTip="Clear Console"
                        label="clear"
                        icon={<ClearIcon />}
                        onButtonClick={() => this.terminal.current.clearStdout()}
                    />

                    <ActionButton
                        toolTip="Show help"
                        label="help"
                        icon={<HelpIcon />}
                        onButtonClick={() => this.sendConsoleCommand('help')}
                    />

                    <FormControl>
                        <InputLabel id="weblog-select-label">
                            Weblog Level
                        </InputLabel>
                        <Select
                            labelId="weblog-select-label"
                            id="weblog-select"
                            value={this.state.weblogLevel}
                            onChange={(event) => this.onWebLogLevelChanged(event)}
                        // labelWidth={labelWidth}
                        >
                            <MenuItem value={1}>Error Messages</MenuItem>
                            <MenuItem value={2}>Error and Info</MenuItem>
                            <MenuItem value={3}>Error, Info and Debug</MenuItem>
                            <MenuItem value={4}>Error, Info and More Debug</MenuItem>
                        </Select>
                    </FormControl>

                </Box>
                <Terminal
                    className={classes.terminal}
                    ref={this.terminal}
                    commands={this.commands}
                    welcomeMessage={'Console to ' + this.state.deviceName + '. Type help to see all commands. All commands are lowercase only'}
                    promptLabel={`${this.toCamelCase(this.state.deviceName)}>`}
                />
            </Box>
        )

    }
}

export default withStyles(styles)(Console)