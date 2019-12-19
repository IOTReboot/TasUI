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

import { withStyles, ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { green, blue } from '@material-ui/core/colors';
import { Box, Grid, Paper, Container, Button, Slider, Divider, Tooltip } from '@material-ui/core';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import CircularProgress from '@material-ui/core/CircularProgress'
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography';
import DeleteIcon from '@material-ui/icons/Delete';
import DeveloperBoardIcon from '@material-ui/icons/DeveloperBoard';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import React, { Component } from 'react';
import Svg from 'react-inlinesvg';
import Table from '@material-ui/core/Table';
import Link from '@material-ui/core/Link';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import VisibilityListener from '../Utils/VisibilityListener';
import Popover from '@material-ui/core/Popover';
import SettingsGroup from '../Components/SettingsGroup'

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Checkbox from '@material-ui/core/Checkbox';
import ContactlessIcon from '@material-ui/icons/Contactless';
import CommandGroup from '../Components/CommandGroup';
import EditableSetting from '../Components/EditableSetting';
import copyToClipboard from '../Utils/CopyToClipboard';

const styles = theme => ({
    imageContainer: {
        padding: theme.spacing(2),
        height: 200,
        width: 200,
    },
    root: {
        padding: theme.spacing(3, 2),
        margin: theme.spacing(2),
    },
    detailsContainer: {
        padding: theme.spacing(2),
        margin: theme.spacing(2),
    },
})

const onButtonTheme = createMuiTheme({
    palette: {
        primary: blue,
    },
});

const powerRegex = RegExp('POWER\D*')
const dimmerRegex = RegExp('Dimmer\D*')


const DimmerSlider = withStyles({
    root: {
        color: '#52af77',
        height: 8,
        width: 300,
        paddingTop: 70,
        paddingBottom: 10,
        paddingLeft: 10,
        paddingRight: 10,
    },
    thumb: {
        height: 24,
        width: 24,
        backgroundColor: '#fff',
        border: '2px solid currentColor',
        marginTop: -8,
        marginLeft: -12,
        '&:focus,&:hover,&$active': {
            boxShadow: 'inherit',
        },
    },
    active: {},
    valueLabel: {
        left: 'calc(-50% + 4px)',
    },
    track: {
        height: 8,
        borderRadius: 4,
    },
    rail: {
        height: 8,
        borderRadius: 4,
    },
})(Slider);

class TasmotaDevice extends Component {

    deviceConnector = null;
    deviceConfig = null;

    constructor(props) {
        super(props);
        this.macAddress = this.props.macAddress;
        this.state = {
            deviceInfo: null,
            dimmerAnchors: {},
            online: false,
        }
    }

    onWindowVisibilityChanged(visible) {
        if (visible) {
            this.deviceConnector.resume();
        } else {
            this.deviceConnector.pause();
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.macAddress !== this.macAddress) {
            this.deviceConnector.disconnect();
            this.deviceConnector = this.props.deviceManager.getDeviceConnector(nextProps.macAddress, this.props.deviceManager.getDevice(nextProps.macAddress).status0Response.StatusNET.IPAddress);
            this.deviceConfig = this.props.deviceManager.getTasmotaConfig(nextProps.macAddress)
            this.deviceConnector.connect();
        }
    }

    componentWillMount() {
        this.deviceConfig = this.props.deviceManager.getTasmotaConfig(this.macAddress)
        this.setState({
            deviceInfo: this.props.deviceManager.getDevice(this.macAddress)
        })
        if (!this.deviceConnector) {
            this.deviceConnector = this.props.deviceManager.getDeviceConnector(this.macAddress, this.props.deviceManager.getDevice(this.macAddress).status0Response.StatusNET.IPAddress);
        }
        this.setState({
            online: this.deviceConnector.online
        })
        this.deviceConnector.connect(this);
        VisibilityListener.addVisibilityChangeCallback(this.onWindowVisibilityChanged.bind(this));
    }

    componentWillUnmount() {
        VisibilityListener.removeVisibilityChangeCallback(this.onWindowVisibilityChanged.bind(this));
        this.deviceConnector.disconnect();
    }

    updateDeviceInfoState(updatedInfo) {
        this.setState({ deviceInfo: { ...this.state.deviceInfo, ...updatedInfo } })
        this.props.deviceManager.updateDevice(this.macAddress, updatedInfo)
    }

    onCommandResponse(cmnd, success, response) {
        // console.log('State %s cmnd: %s response : %O', this.state.displayName, cmnd, response)

        this.setState({ online: success });

        if (success) {

            if (cmnd === 'Status 0') {
                // console.log('Status0 %s :  %O', this.macAddress, response);
                this.updateDeviceInfoState({ status0Response: response })
            } else if (cmnd === 'Template') {
                this.updateDeviceInfoState({ templateResponse: response })
                this.deviceConnector.performCommandOnDevice('GPIOS 255')
            } else if (cmnd === 'GPIO 255') {
                // console.log('GPIO Response : %O', response)
                this.updateDeviceInfoState({ gpio255Response: response })
                this.deviceConnector.performCommandOnDevice('GPIOS 255')
            } else if (cmnd === 'GPIOS 255') {
                this.updateDeviceInfoState({ gpiosResponse: response })
            } else if (cmnd === 'State') {

                if (response.Module) {
                    delete response.Module
                }

                var status0Clone = Object.assign({}, this.state.deviceInfo.status0Response);

                var statusNames = Object.keys(status0Clone)

                statusNames.forEach((status) => {
                    Object.keys(status0Clone[status]).forEach((param) => {
                        if (response[param]) {
                            status0Clone[status][param] = response[param]
                        }
                    })
                })

                this.updateDeviceInfoState({ status0Response: status0Clone })

            } else if (cmnd === 'Status 8') {

                var status0Clone = Object.assign({}, this.state.deviceInfo.status0Response);
                status0Clone.StatusSNS = response.StatusSNS

                this.updateDeviceInfoState({ status0Response: status0Clone })
            } else if (cmnd === 'Module') {
                this.updateDeviceInfoState({ moduleResponse: response })
            } else if (cmnd === 'WifiPower') {
                this.updateDeviceInfoState({ wifiPowerResponse: response })
            }
        }
    }

    powerToggle(button, event) {
        event.stopPropagation();
        console.log('Toggle power ' + button)
        this.deviceConnector.performCommandOnDevice(button + ' TOGGLE');
    }

    dimmerUpdate(dimmer, event, newValue) {
        console.log('Dimmer id : %O, value %O newValue %O', dimmer, event, newValue);
        event.stopPropagation()
        this.deviceConnector.performCommandOnDevice(dimmer + ' ' + newValue);
    }

    getModuleDisplayText() {
        if (this.state.deviceInfo.moduleResponse) {
            return this.deviceConfig.moduleResponseFormatter(this.state.deviceInfo.moduleResponse)
        } else {
            return this.state.deviceInfo.status0Response.Status.Module
        }
    }

    renderTypeTableStatusRow() {
        return (
            <TableRow key={this.props.macAddress}>
                <TableCell component="th" scope="row">
                    <Box display="flex" flexDirection="column" alignItems="center">
                        <Box fontSize={16}>
                            {this.state.deviceInfo.status0Response.Status.FriendlyName[0]}
                        </Box>
                        <Box display="flex" flexDirection="row">
                            {this.props.actionButtons}
                        </Box>
                    </Box>
                </TableCell>
                <TableCell>{this.renderConnectivityStatus()}</TableCell>
                <TableCell>{this.getModuleDisplayText()}</TableCell>
                <TableCell><Box flex={1} flexDirection='row'>{this.renderDetailsControlsButtons('Table')}</Box></TableCell>
                <TableCell>{this.renderDetailsControlsDimmers('Table')}</TableCell>
            </TableRow>
        )
    }

    renderTypeTableHealthRow() {
        return (
            <TableRow key={this.props.macAddress}>
                <TableCell component="th" scope="row">
                    <Box display="flex" flexDirection="column" alignItems="center">
                        <Box fontSize={16}>
                            {this.state.deviceInfo.status0Response.Status.FriendlyName[0]}
                        </Box>
                        <Box display="flex" flexDirection="row">
                            {this.props.actionButtons}
                        </Box>
                    </Box>
                </TableCell>
                <TableCell>{this.renderConnectivityStatus()}</TableCell>
                <TableCell>{this.state.deviceInfo.status0Response.StatusSTS.Wifi.RSSI}</TableCell>
                <TableCell>{this.state.deviceInfo.status0Response.StatusSTS.Uptime}</TableCell>
                <TableCell>{this.state.deviceInfo.status0Response.StatusSTS.MqttCount}</TableCell>
                <TableCell>{this.state.deviceInfo.status0Response.StatusSTS.Wifi.LinkCount}</TableCell>
                <TableCell>{this.state.deviceInfo.status0Response.StatusSTS.Wifi.Downtime}</TableCell>
                <TableCell>{this.state.deviceInfo.status0Response.StatusFWR.Version}</TableCell>
                <TableCell>{this.state.deviceInfo.status0Response.StatusFWR.Core}</TableCell>
                <TableCell>{this.state.deviceInfo.status0Response.StatusPRM.BootCount}</TableCell>
                <TableCell>{this.state.deviceInfo.status0Response.StatusPRM.RestartReason}</TableCell>
                <TableCell>{this.state.deviceInfo.status0Response.StatusSTS.LoadAvg}</TableCell>
                <TableCell>{this.state.deviceInfo.status0Response.StatusSTS.Sleep}</TableCell>
            </TableRow>
        )
    }

    renderTypeTableWifiRow() {
        return (
            <TableRow key={this.props.macAddress}>
                <TableCell component="th" scope="row">
                    <Box display="flex" flexDirection="column" alignItems="center">
                        <Box fontSize={16}>
                            {this.state.deviceInfo.status0Response.Status.FriendlyName[0]}
                        </Box>
                        <Box display="flex" flexDirection="row">
                            {this.props.actionButtons}
                        </Box>
                    </Box>
                </TableCell>
                <TableCell>{this.renderConnectivityStatus()}</TableCell>
                <TableCell>{this.state.deviceInfo.status0Response.StatusSTS.Wifi.RSSI}</TableCell>
                <TableCell>{this.state.deviceInfo.wifiPowerResponse ? this.state.deviceInfo.wifiPowerResponse.WifiPower : 'Unsupported'}</TableCell>
                <TableCell>{this.state.deviceInfo.status0Response.StatusSTS.Wifi.BSSId}</TableCell>
                <TableCell>{this.state.deviceInfo.status0Response.StatusSTS.Wifi.LinkCount}</TableCell>
                <TableCell>{this.state.deviceInfo.status0Response.StatusSTS.Wifi.Downtime}</TableCell>
                <TableCell>{this.state.deviceInfo.status0Response.StatusNET.Hostname}</TableCell>
                <TableCell>{this.state.deviceInfo.status0Response.StatusNET.Mac}</TableCell>
                <TableCell>{this.state.deviceInfo.status0Response.StatusNET.IPAddress}</TableCell>
                <TableCell>{this.state.deviceInfo.status0Response.StatusNET.Gateway}</TableCell>
                <TableCell>{this.state.deviceInfo.status0Response.StatusSTS.Wifi.SSId}</TableCell>
                <TableCell>{this.state.deviceInfo.status0Response.StatusSTS.Wifi.Channel}</TableCell>
            </TableRow>
        )
    }

    renderTypeTableMqttRow() {
        return (
            <TableRow key={this.props.macAddress}>
                <TableCell component="th" scope="row">
                    <Box display="flex" flexDirection="column" alignItems="center">
                        <Box fontSize={16}>
                            {this.state.deviceInfo.status0Response.Status.FriendlyName[0]}
                        </Box>
                        <Box display="flex" flexDirection="row">
                            {this.props.actionButtons}
                        </Box>
                    </Box>
                </TableCell>
                <TableCell>{this.renderConnectivityStatus()}</TableCell>
                <TableCell>{this.state.deviceInfo.status0Response.StatusSTS.Wifi.RSSI}</TableCell>
                <TableCell>{this.state.deviceInfo.status0Response.StatusSTS.MqttCount}</TableCell>
                <TableCell>{this.state.deviceInfo.status0Response.Status.Topic}</TableCell>
                <TableCell>'Full Topic - N/A'</TableCell>
                <TableCell>'Command Topic - N/A'</TableCell>
                <TableCell>'Stat Topic - N/A'</TableCell>
                <TableCell>'Tele Topic - N/A'</TableCell>
                <TableCell>'Fallback Topic - N/A'</TableCell>
                <TableCell>{this.state.deviceInfo.status0Response.StatusPRM.GroupTopic}</TableCell>
                <TableCell>{this.state.deviceInfo.status0Response.StatusMQT.MqttHost}</TableCell>
                <TableCell>{this.state.deviceInfo.status0Response.StatusMQT.MqttPort}</TableCell>
                <TableCell>{this.state.deviceInfo.status0Response.StatusMQT.MqttClient}</TableCell>
            </TableRow>
        )
    }

    renderTypeTableFirmwareRow() {
        return (
            <TableRow key={this.props.macAddress}>
                <TableCell component="th" scope="row">
                    <Box display="flex" flexDirection="column" alignItems="center">
                        <Box fontSize={16}>
                            {this.state.deviceInfo.status0Response.Status.FriendlyName[0]}
                        </Box>
                        <Box display="flex" flexDirection="row">
                            {this.props.actionButtons}
                        </Box>
                    </Box>
                </TableCell>
                <TableCell>{this.renderConnectivityStatus()}</TableCell>
                <TableCell>{this.state.deviceInfo.status0Response.StatusFWR.Version}</TableCell>
                <TableCell>{this.state.deviceInfo.status0Response.StatusFWR.Core}</TableCell>
                <TableCell>{this.state.deviceInfo.status0Response.StatusFWR.SDK}</TableCell>
                <TableCell>{this.state.deviceInfo.status0Response.StatusMEM.ProgramSize}</TableCell>
                <TableCell>{this.state.deviceInfo.status0Response.StatusMEM.Free}</TableCell>
                <TableCell>{this.state.deviceInfo.status0Response.StatusPRM.OtaUrl}</TableCell>
            </TableRow>
        )
    }

    renderTypeList() {
        return (
            <div style={{ width: '100%' }}>
                <Box display="flex">
                    <DeveloperBoardIcon />
                    <Box display="flex" flexGrow={1} marginLeft={2}>
                        <Typography>
                            {/* {this.state.displayName} */}
                        </Typography>
                        {this.renderDetailsControlsDimmers()}
                        {this.renderDetailsControlsButtons()}
                    </Box>
                    {this.props.actionButtons}
                </Box>
            </div>
        )
    }

    renderConnectivityStatus() {
        return (
            <Tooltip title={this.state.online ? "Online" : "Offline"} >
                <ContactlessIcon color={this.state.online ? "primary" : "secondary"} />
            </Tooltip>
        )
    }

    renderDetailsImage() {
        return (
            <Svg src="https://raw.githubusercontent.com/arendst/Tasmota/development/tools/logo/TASMOTA_Symbol_Vector.svg" width="90%" height="90%" padding="20" />
        )
    }

    renderDetailsControlsButtons(type = 'Details') {
        if (this.state.deviceInfo.status0Response) {
            let buttons = Object.entries(this.state.deviceInfo.status0Response['StatusSTS']).filter(([key, value]) => {
                if (powerRegex.test(key)) {
                    return [key, value];
                }
            })

            // console.log('DetailsControls buttons : %O', buttons)

            return buttons.map(([key, value]) => {

                let display = key;
                if (type === 'Table') {
                    display = key.replace('POWER', '');

                    if (display === '') {
                        display = '1'
                    }
                }

                if (value === 'ON') {
                    return (
                        <ThemeProvider theme={onButtonTheme} key={key}>
                            <Button variant="contained" key={key} color="primary" onClick={(event) => this.powerToggle(key, event)}>{display}</Button>
                        </ThemeProvider>
                    )
                } else {
                    return (
                        <Button variant="contained" key={key} onClick={(event) => this.powerToggle(key, event)}>{display}</Button>
                    )
                }
            })
        }
    }

    openDimmerPopover(dimmer, event) {
        event.stopPropagation()
        let newAnchors = Object.assign({}, this.state.dimmerAnchors);
        newAnchors[dimmer] = event.target
        this.setState({
            dimmerAnchors: newAnchors,
        })
    }

    dimmerPopoverClosed(dimmer, event) {
        event.stopPropagation()
        let newAnchors = Object.assign({}, this.state.dimmerAnchors);
        delete newAnchors[dimmer]
        this.setState({
            dimmerAnchors: newAnchors,
        })
    }


    renderDetailsControlsDimmers(type = 'Details') {
        if (this.state.deviceInfo.status0Response) {
            let dimmers = Object.entries(this.state.deviceInfo.status0Response['StatusSTS']).filter(([key, value]) => {
                if (dimmerRegex.test(key)) {
                    return [key, value];
                }
            })

            // console.log('DetailsControls dimmers : %O', dimmers)

            return dimmers.map(([key, value]) => {

                let display = key + ' ' + value;
                if (type === 'Table') {
                    display = key.replace('Dimmer', 'Dim');
                    display += ':' + value
                }

                return (
                    <div>
                        <Button variant="contained" key={key} onClick={(event) => this.openDimmerPopover(key, event)}>{display}</Button>

                        <Popover
                            id={'dimmerPop' + key}
                            open={Boolean(this.state.dimmerAnchors[key])}
                            anchorEl={this.state.dimmerAnchors[key]}
                            onClose={(event) => this.dimmerPopoverClosed(key, event)}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'center',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'center',
                            }}
                        >
                            <DimmerSlider
                                defaultValue={value}
                                id={key}
                                aria-labelledby={key + 'slider'}
                                valueLabelDisplay="on"
                                step={1}
                                min={1}
                                max={100}
                                onChange={(event, value) => event.stopPropagation()}
                                onChangeCommitted={(event, value) => this.dimmerUpdate(key, event, value)}
                            />
                        </Popover>
                    </div>
                )
            })
        }
    }

    renderDetailsStatuses() {

        return Object.entries(this.state.deviceInfo.status0Response).map(([cmnd, cmndData]) => {

            return (
                <ExpansionPanel key={cmnd}>
                    <ExpansionPanelSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                    >
                        <Typography>{cmnd}</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                        <Table aria-label="simple table" size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Key</TableCell>
                                    <TableCell>Value</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Object.entries(cmndData).map(([key, value]) => {
                                    return (
                                        <TableRow key={key}>
                                            <TableCell align="left">{key}</TableCell>
                                            <TableCell align="left">
                                                <Typography display="inline">
                                                    {JSON.stringify(value, null, 2)}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </ExpansionPanelDetails>
                </ExpansionPanel>
            )


        })

    }

    convertHexStringToBitArray(bytesString) {
        var bitArray = [];
        var digitValue = 0;
        let charArray = bytesString.toLowerCase().split('');


        charArray.forEach((char, index) => {
            digitValue = '0123456789abcdefgh'.indexOf(char);
            for (let n = 3; n >= 0; n--) {
                bitArray.push((digitValue >> n) & 1)
            }
        })

        // console.log('ByteString: %s to bitArray : %O', bytesString, bitArray.reverse())
        return bitArray.reverse()
    }


    renderDetailsSetOptions() {
        return (
            <ExpansionPanel key="SetOptionFlagExpansionPanel" TransitionProps={{ unmountOnExit: true, mountOnEnter: true }}>
                <ExpansionPanelSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                >
                    <Typography>SetOption Flags</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    <List dense >
                        {this.renderDetailsSetOptionsListItems()}
                    </List>
                </ExpansionPanelDetails>
            </ExpansionPanel>
        )
    }

    changeSetOption(setOption, event) {
        event.stopPropagation()
        this.deviceConnector.performCommandOnDevice(setOption + (event.target.checked ? ' 1' : ' 0'));
    }

    renderDetailsSetOptionsListItems() {

        return this.state.deviceInfo.status0Response.StatusLOG.SetOption.map((setOptionStr, index) => {
            if (index !== 1) {
                let valueArray = this.convertHexStringToBitArray(setOptionStr)
                return this.deviceConfig.setOptionsStatusMaps[index].items.map((item, itemIndex) => {
                    if (item.name !== '' && item.description !== '') {
                        var soValue = itemIndex + this.deviceConfig.setOptionsStatusMaps[index].setOptionStart;
                        // console.log('SetOption%d (%s) : %d', soValue, item.name, valueArray[itemIndex])
                        return (
                            <React.Fragment>
                                <ListItem key={'SetOption' + soValue}>
                                    <ListItemText id={'checkbox-lable-SetOption' + soValue} primary={`SetOption${soValue}`}
                                        secondary={item.description} />
                                    <ListItemSecondaryAction>
                                        <Checkbox
                                            edge="end"
                                            checked={valueArray[itemIndex] === 1}
                                            onChange={(event) => this.changeSetOption('SetOption' + soValue, event)}
                                        // disabled
                                        />
                                    </ListItemSecondaryAction>
                                </ListItem>
                                <Divider variant="fullWidth" component="li" />
                            </React.Fragment>
                        )
                    }
                })
            }
        })
    }

    getPanelCommandData = command => (event, isExpanded) => {
        event.stopPropagation()
        if (isExpanded) {
            this.deviceConnector.performCommandOnDevice(command);
        }
    }

    getGPIOName(gpio) {
        var keys = Object.keys(this.state.deviceInfo.gpiosResponse)

        if (gpio === 255) {
            return 'User'
        }

        for (let n = 0; n < keys.length; n++) {
            // console.log("Keys %s", this.state.deviceInfo.gpiosResponse[keys[n]])
            if (!Array.isArray(this.state.deviceInfo.gpiosResponse[keys[n]])) {
                if (this.state.deviceInfo.gpiosResponse[keys[n]][gpio]) {
                    return this.state.deviceInfo.gpiosResponse[keys[n]][gpio]
                }
            } else {
                for (let i = 0; i < this.state.deviceInfo.gpiosResponse[keys[n]].length; i++) {
                    if (this.state.deviceInfo.gpiosResponse[keys[n]][i].startsWith(gpio.toString() + ' ')) {
                        return this.state.deviceInfo.gpiosResponse[keys[n]][i].replace(gpio.toString(), "")
                    }
                }
            }
        }

        return 'Unknown'
    }

    renderTemplateResponse() {
        return (
            <Table size="small">
                <TableBody>
                    <TableRow>
                        <TableCell>NAME</TableCell>
                        <TableCell>{this.state.deviceInfo.templateResponse.NAME}</TableCell>
                    </TableRow>

                    {
                        this.state.deviceInfo.templateResponse.GPIO.map((gpio, index) => {
                            return (
                                <TableRow>
                                    <TableCell>{`GPIO${index}`}</TableCell>
                                    <TableCell>{`${gpio} ( ${this.getGPIOName(gpio)} )`}</TableCell>
                                </TableRow>
                            )
                        })
                    }

                    <TableRow>
                        <TableCell>FLAG</TableCell>
                        <TableCell>{this.state.deviceInfo.templateResponse.FLAG}</TableCell>
                    </TableRow>

                    <TableRow>
                        <TableCell>BASE</TableCell>
                        <TableCell>{this.state.deviceInfo.templateResponse.BASE}</TableCell>
                    </TableRow>

                </TableBody>
            </Table>

        )
    }

    renderDetailsTemplate() {
        return (
            <ExpansionPanel key="TemplateDetailsExpansionPanel" onChange={this.getPanelCommandData('Template')}>
                <ExpansionPanelSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                >
                    <Typography>Template</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>

                    {!this.state.deviceInfo.templateResponse || !this.state.deviceInfo.gpiosResponse ? <CircularProgress /> :
                        this.renderTemplateResponse()
                    }

                </ExpansionPanelDetails>
            </ExpansionPanel>
        )
    }

    renderGPIOResponse() {

        return (
            <Table size="small">
                <TableBody>

                    {this.deviceConfig.gpioResponseFormatter(this.state.deviceInfo.gpio255Response).map((gpioObj, index) => {
                        return (
                            <TableRow>
                                <TableCell>{gpioObj.gpio}</TableCell>
                                <TableCell>{gpioObj.gpioInfo}</TableCell>
                            </TableRow>
                        )
                    })}

                </TableBody>
            </Table>
        )
    }

    renderDetailsGPIO() {
        return (
            <ExpansionPanel key="GPIODetailsExpansionPanel" onChange={this.getPanelCommandData('GPIO 255')}>
                <ExpansionPanelSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                >
                    <Typography>Module GPIO</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>

                    {!this.state.deviceInfo.gpio255Response || !this.state.deviceInfo.gpiosResponse ? <CircularProgress /> :
                        this.renderGPIOResponse()
                    }

                </ExpansionPanelDetails>
            </ExpansionPanel>
        )
    }

    renderDetailsConnectivity() {
        return (
            <React.Fragment>
                <ExpansionPanel key="ConnectivityDetailsExpansionPanel">
                    <ExpansionPanelSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                    >
                        <Typography>Connectivity</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                        <Table size="small">
                            <TableBody>
                                <TableRow>
                                    <TableCell />
                                    <TableCell>Wifi AP</TableCell>
                                    <TableCell>{this.state.deviceInfo.status0Response.StatusSTS.Wifi.SSId}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell />
                                    <TableCell>Wifi Strength</TableCell>
                                    <TableCell>{this.state.deviceInfo.status0Response.StatusSTS.Wifi.RSSI}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell />
                                    <TableCell>Wifi Channel</TableCell>
                                    <TableCell>{this.state.deviceInfo.status0Response.StatusSTS.Wifi.Channel}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell />
                                    <TableCell>Wifi BSSID</TableCell>
                                    <TableCell>{this.state.deviceInfo.status0Response.StatusSTS.Wifi.BSSId}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </ExpansionPanelDetails>
                </ExpansionPanel>
            </React.Fragment>
        )
    }

    renderTypeSettings() {


        return (
            <React.Fragment>

                {this.deviceConfig.settingsGroups.map((settings) => {
                    return (
                        <TableRow>
                            <TableCell colSpan={3}>
                                <SettingsGroup deviceConnector={this.deviceConnector} settingsGroup={settings} />
                            </TableCell>
                        </TableRow>
                    )
                })}

                <TableRow>
                    <TableCell colSpan={3}>
                        {this.renderDetailsSetOptions()}
                    </TableCell>
                </TableRow>

                <TableRow>
                    <TableCell colSpan={3}>
                        <Typography>Configuration Section</Typography>
                    </TableCell>
                </TableRow>

                {Object.entries(this.deviceConfig.configuration).map(([commandGroupName, commandGroup]) => {
                    return (
                        <TableRow>
                            <TableCell colSpan={3}>
                                <CommandGroup groupType="Configuration" commandGroupName={commandGroupName} commandGroup={commandGroup} deviceConnector={this.deviceConnector} />
                            </TableCell>
                        </TableRow>
                    )
                })}

                <TableRow>
                    <TableCell colSpan={3}>
                        <Typography>Commands Section</Typography>
                    </TableCell>
                </TableRow>

                {Object.entries(this.deviceConfig.commands).map(([commandGroupName, commandGroup]) => {
                    return (
                        <TableRow>
                            <TableCell colSpan={3}>
                                <CommandGroup groupType="Commands" commandGroupName={commandGroupName} commandGroup={commandGroup} deviceConnector={this.deviceConnector} />
                            </TableCell>
                        </TableRow>
                    )
                })}


            </React.Fragment>
        )
    }

    renderTypeDetails() {

        return (
            <React.Fragment>
                <TableRow>
                    <TableCell colSpan={3}>
                        {this.renderDetailsConnectivity()}
                    </TableCell>
                </TableRow>

                <TableRow>
                    <TableCell colSpan={3}>
                        {this.renderDetailsGPIO()}
                    </TableCell>
                </TableRow>

                {this.state.deviceInfo.status0Response.Status.Module === 0 ? (
                    <TableRow>
                        <TableCell colSpan={3}>
                            {this.renderDetailsTemplate()}
                        </TableCell>
                    </TableRow>

                )
                    : null}

                <TableRow>
                    <TableCell colSpan={3}>
                        {this.renderDetailsSetOptions()}
                    </TableCell>
                </TableRow>

                <TableRow>
                    <TableCell align="left"><Typography>Status Report</Typography></TableCell>
                    <TableCell align="center" colSpan={2}>
                        <Button variant="contained" key="copy-to-clipboard-button" onClick={(event) => copyToClipboard(JSON.stringify(this.state.deviceInfo.status0Response, null, 2))}>Copy to clipboard</Button>
                    </TableCell>
                </TableRow>

                <TableRow>
                    <TableCell colSpan={3}>
                        {this.renderDetailsStatuses()}
                    </TableCell>
                </TableRow>
            </React.Fragment>
        )
    }

    renderTypeSettingsAndDetails(renderType) {
        return (
            <React.Fragment>
                <Box display="flex" flexDirection="column" flexGrow={1} justifyItems="center" justifyContent="center">
                    <Box display="flex" flexDirection="column" flexWrap="wrap" justifyContent="space-around" alignItems="center">
                        <Paper align="center" style={{ width: 200, height: 200 }}>
                            {this.renderDetailsImage()}
                        </Paper>
                    </Box>
                    <Table size="medium">
                        <TableHead>
                            <TableRow>
                                <TableCell colSpan={2}></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell align="left"><Typography>FriendlyName</Typography></TableCell>
                                <TableCell align="center" colSpan={2}>
                                    <EditableSetting deviceConnector={this.deviceConnector} command="FriendlyName1" currentValue={this.state.deviceInfo.status0Response.Status.FriendlyName[0]} />
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="left"><Typography>Relays</Typography></TableCell>
                                <TableCell align="center" colSpan={2}>{this.renderDetailsControlsButtons('Table')}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="left"><Typography>Light Controls</Typography></TableCell>
                                <TableCell align="center" colSpan={2}>{this.renderDetailsControlsDimmers('Table')}</TableCell>
                            </TableRow>

                            {renderType === 'Details' ? this.renderTypeDetails() : null}
                            {renderType === 'Settings' ? this.renderTypeSettings() : null}

                        </TableBody>
                    </Table>

                </Box>
            </React.Fragment>
        )
    }

    render() {
        // console.log('Tasmota Device renderType : %s', this.props.renderType)
        switch (this.props['renderType']) {
            case 'List':
                return this.renderTypeList();

            case 'Settings':
            case 'Details':
                return this.renderTypeSettingsAndDetails(this.props.renderType);

            case 'Table_Status':
                return this.renderTypeTableStatusRow();

            case 'Table_Health':
                return this.renderTypeTableHealthRow();

            case 'Table_WIFI':
                return this.renderTypeTableWifiRow()

            case 'Table_Mqtt':
                return this.renderTypeTableMqttRow()

            case 'Table_Firmware':
                return this.renderTypeTableFirmwareRow()


            default:
                return (
                    <Typography>
                        {/* {this.state.displayName} RenderType : {this.props.renderType} */}
                    </Typography>
                )
                break
        }
    }
}

export default withStyles(styles)(TasmotaDevice);