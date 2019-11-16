import React from 'react'
import TextField from "@material-ui/core/TextField";
import { Typography, Box, Button } from '@material-ui/core';

class SettingsGroup extends React.Component {

    constructor(pros) {
        super(pros)
        let defaultStates = {}
        this.props.settingsGroup.settings.forEach((setting) => {
            defaultStates[setting.command] = ""
        })
        this.state = {
            settingsStates: defaultStates,
        }
        this.commandResponses = {}
    }

    onCommandResponse(cmnd, success, response) {
        console.log('Settings cmnd %s response : %O ', cmnd, response )
        let newState = Object.assign({}, this.state.settingsStates)
        Object.keys(response).forEach((key) => {
            if (key.toUpperCase() === cmnd.toUpperCase()) {
                newState[cmnd] = response[key];
                this.commandResponses[cmnd] = response[key]
            }
        })
        // newState[cmnd] = String(response[cmnd])
        this.setState({
            settingsStates: newState,
        })
    }

    componentDidMount() {
        this.props.deviceConnector.connect(this);
        this.props.settingsGroup.settings.forEach((setting, index) => {
            this.props.deviceConnector.performCommandOnDeviceDirect(setting.command);
        })
    }

    handleSettingsChanged(event, command) {
        event.stopPropagation()
        let newState = Object.assign({}, this.state.settingsStates)
        newState[command] = event.target.value
        this.setState({
            settingsStates: newState,
        })
    }

    renderSettingInputs() {
        return this.props.settingsGroup.settings.map((setting, index) => {
            return <TextField
                    key={'settings' + setting.command}
                    id={'id' + setting.name}
                    label={setting.name}
                    // placeholder={setting.name}
                    margin="normal"
                    variant="outlined"
                    value={this.state.settingsStates[setting.command]}
                    onChange={(event) => this.handleSettingsChanged(event, setting.command)}
                />
        })
    }

    saveSettings(event) {
        event.stopPropagation()
        let command = 'backlog'
        this.props.settingsGroup.settings.forEach((setting, index) => {
            if(this.state.settingsStates[setting.command] !== this.commandResponses[setting.command]) {
                command += ' ' + setting.command + ' ' + this.state.settingsStates[setting.command] + ';'
            }
        })

        if (command !== 'backlog') {
            command = command.slice(0, -1);
            console.log('Performing command %s', command)
            this.props.deviceConnector.performCommandOnDeviceDirect(command);
        }
    }

    render() {
        return (
            <Box display="flex" flexDirection="column" flexGrow={1} alignContent="left">
                <Typography variant="h6">{this.props.settingsGroup.groupName}</Typography>
                <Box display="flex" flexDirection="row" flexWrap="wrap">
                    {this.renderSettingInputs()}
                </Box>
                <Box display="flex" flexDirection="row" alignItems="center" flexGrow={1}>
                    <Button variant="contained" margin="normal" onClick={(event) => this.saveSettings(event)}>Save {this.props.settingsGroup.groupName}</Button>
                </Box>
            </Box>
        )
    }

}

export default SettingsGroup