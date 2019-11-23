import React from 'react'
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelActions from '@material-ui/core/ExpansionPanelActions';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import List from '@material-ui/core/List';
import { Typography, Box, Radio, TableBody, TableRow, Table, TableCell, TextField, Button, Divider, TextareaAutosize } from '@material-ui/core';
import { Scrollbar } from 'react-scrollbars-custom';

class CommandDisplay extends React.Component {

    commandSent = null

    constructor(props) {
        super(props)
        let defaultOption = this.props.command.options.length > 0 ? this.props.command.options[0] : null
        this.state = {
            commandIndex: 0,
            selectedOption: defaultOption,
            valueToSend: "",
            commandToSend: this.generateCommand(defaultOption, ""),
            logsOutput: "",
        }
    }


    componentWillMount() {
        this.props.deviceConnector.connect(this)
    }

    componentWillUnmount() {
        this.props.deviceConnector.disconnect(this)
    }

    onCommandResponse(cmnd, success, response) {
        
        if (this.commandSent && cmnd === this.commandSent) {
            let log = `${this.state.logsOutput}\nCommand ${cmnd} : ${success ? "Success" : "Failed"}`
            if (success) {
                log += `\nResponse : ${JSON.stringify(response, null, 2)}`
            }
            this.setState({ logsOutput: log})
        }
    }

    sendCommandInternal(event, command) {
        event.stopPropagation()
        this.setState({ logsOutput: this.state.logsOutput + '\n' + 'Sending command : ' +  command})
        this.commandSent = command
        this.props.deviceConnector.performCommandOnDevice(command)

    }

    sendCommand(event) {
        this.sendCommandInternal(event, this.state.commandToSend)
    }

    readCurrentValue(event) {
        this.sendCommandInternal(event, this.props.commandName)
    }

    onCommandInputChanged(event) {
        event.stopPropagation()
        this.setState({commandToSend: event.target.value})
    }

    onValueInputChanged(event) {
        event.stopPropagation()
        this.setState({ valueToSend: event.target.value, commandToSend: this.generateCommand(this.state.selectedOption, event.target.value)})
    }

    onOptionItemSelected(event, option) {
        event.stopPropagation()
        this.setState({ selectedOption: option, commandToSend: this.generateCommand(option, this.state.valueToSend)})
    }

    isCurrentSelectedOption(option) {
        if (this.state.selectedOption) {
            return this.state.selectedOption === option
        } else {
            return false
        }
    }

    shouldShowValueInput() {
        if (this.state.selectedOption) {
            return this.state.selectedOption.type === "input"
        } else {
            return false
        }
    }

    generateCommand(option, valueToSend) {
        let command = `${this.props.commandName}`
        if (option) {
            switch(option.type) {
                case "select" :
                    command += ` ${option.display}`
                    break

                case "input":
                case "range":
                    command += ` ${valueToSend}`
                    break

            }
        }
        return command
    }

    renderCommandDetails() {
        return (
            // <React.Fragment>
                <Box display="flex" flexDirection="column" flexGrow={1}>
                    <Box display="flex" flexDirection="row" alignItems="center" flexGrow={1}>
                        <Typography px={5} flexGrow={1}>{this.props.commandName}</Typography>
                        <Scrollbar style={{ width: 500, height: 200 }} px={5} flexGrow={4}>
                            <List dense>
                                {this.props.command.options.map(option => {
                                    return (
                                        <ListItem key={option.display} role={undefined} button onClick={(event) => this.onOptionItemSelected(event, option)}>
                                        <ListItemIcon>
                                        <Radio
                                            checked={this.isCurrentSelectedOption(option)}
                                            // onChange={handleChange}
                                            value={option.display}
                                            name={option.display}
                                            inputProps={{ 'aria-label': 'A' }}
                                        />
                                        </ListItemIcon>
                                        <ListItemText id={option.display} primary={option.display} secondary={option.description} />
                                    </ListItem>
                                    )
                                })}
                            </List>
                            {/* </Box> */}
                        </Scrollbar>
                        {this.shouldShowValueInput() ? 
                            <form noValidate autoComplete="off">
                                <TextField
                                    px={5}
                                    style={{ width: 500, height: 150 }}
                                    flexGrow={4}
                                    rows="8"
                                    multiline
                                    required
                                    id="value"
                                    label="Value"
                                    onChange={(event) => this.onValueInputChanged(event)}
                                    value={this.state.valueToSend}
                                    margin="normal"
                                    variant="outlined"
                                />
                            </form>
                        : null }

                    </Box>
                    <form noValidate autoComplete="off">
                        <TextField
                            style={{ width: 1000, height: 100 }}
                            rows="2"
                            multiline
                            id="commandToSend"
                            label="Command to Send"
                            value={this.state.commandToSend}
                            onChange={(event) => this.onCommandInputChanged(event)}
                            margin="normal"
                            variant="outlined"
                        />
                    </form>

                    <Typography px={5} flexGrow={1}>Logs</Typography>
                    <TextareaAutosize aria-label="minimum height" rows={4} rowsMax={5} value={this.state.logsOutput} disabled />
    
                </Box>

            // </React.Fragment>
        )
    }


    render() {

        return (
            <ExpansionPanel key={`CommandDisplay-${this.props.commandName}`} TransitionProps={{ unmountOnExit: true, mountOnEnter: true }}>
                <ExpansionPanelSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
                >
                <Typography>{this.props.commandName}</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    <Box display="flex" flexDirection="column" flexWrap="wrap">
                        <Typography>{this.props.command.description}</Typography>
                        {this.renderCommandDetails()}
                    </Box>
                </ExpansionPanelDetails>
                <Divider />
                <ExpansionPanelActions>
                    <Button size="small" variant="contained" onClick={(event) => this.sendCommand(event)}>Send Command</Button>
                    <Button size="small" variant="contained" onClick={(event) => this.readCurrentValue(event)}>Read Current</Button>
                </ExpansionPanelActions>
            </ExpansionPanel>
        )
    }
}

export default CommandDisplay