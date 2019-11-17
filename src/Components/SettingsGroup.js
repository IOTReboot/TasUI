import React from 'react'
import TextField from "@material-ui/core/TextField";
import { Typography, Box, Button } from '@material-ui/core';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelActions from '@material-ui/core/ExpansionPanelActions';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Divider from '@material-ui/core/Divider';

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
        console.log('Settings cmnd %s success %s response : %O ', cmnd, success, response )
        if (success) {
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
    }

    componentDidMount() {
        this.props.deviceConnector.connect(this);
        this.props.settingsGroup.settings.forEach((setting, index) => {
            this.props.deviceConnector.performCommandOnDeviceDirect(setting.command);
        })
    }

    getCurrentSettings  = command => (event, isExpanded) => {
        event.stopPropagation()
        if (isExpanded) {
            this.props.settingsGroup.settings.forEach((setting, index) => {
                this.props.deviceConnector.performCommandOnDeviceDirect(setting.command);
            })
        }
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

            <ExpansionPanel key={`SettingsExpansionPanel-${this.props.settingsGroup.groupName}`} onChange={this.getCurrentSettings()}>
                <ExpansionPanelSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
                >
                <Typography>{this.props.settingsGroup.groupName}</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    <Box display="flex" flexDirection="row" flexWrap="wrap">
                        {this.renderSettingInputs()}
                    </Box>
                </ExpansionPanelDetails>
                <Divider />
                <ExpansionPanelActions>
                    <Button size="small" variant="contained" onClick={(event) => this.saveSettings(event)}>Save {this.props.settingsGroup.groupName}</Button>
                </ExpansionPanelActions>
            </ExpansionPanel>

        )
    }

}

export default SettingsGroup