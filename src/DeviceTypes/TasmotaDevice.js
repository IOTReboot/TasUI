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
import TasmotaVersionedConfig from '../Configuration/TasmotaVersionedConfig'

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Checkbox from '@material-ui/core/Checkbox';
import ContactlessIcon from '@material-ui/icons/Contactless';

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

    constructor(props) {
        super(props);
        this.macAddress = this.props.macAddress;
        this.state = {
            displayName: "",
            status0: null,
            dimmerAnchors: {},
            template: '',
            gpios: '',
            gpio: '',
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
            this.deviceConnector = this.props.deviceManager.getDeviceConnector(nextProps.macAddress, this.props.deviceManager.getDevice(nextProps.macAddress).StatusNET.IPAddress);
            this.deviceConnector.connect();
        }
    }

    componentWillMount() {
        this.setState({
            displayName: this.props.deviceManager.getDevice(this.macAddress).Status.FriendlyName[0] + ' (' + this.macAddress + ')',
            status0: this.props.deviceManager.getDevice(this.macAddress)
        })
        if (!this.deviceConnector) {
            this.deviceConnector = this.props.deviceManager.getDeviceConnector(this.macAddress, this.props.deviceManager.getDevice(this.macAddress).StatusNET.IPAddress);
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

    onCommandResponse(cmnd, success, response) {
        console.log('State %s cmnd: %s response : %O', this.state.displayName, cmnd, response)

        this.setState( {online: success});

        if (success) {
        
            if (cmnd === 'Status 0') {
                // console.log('Status0 %s :  %O', this.macAddress, response);
                let newDisplayName = response.Status.FriendlyName[0] + ' (' + this.macAddress + ')';
                // console.log(newDisplayName);
                if (this.state.status0.Status.ModuleName) {
                    response.Status.ModuleName = this.state.status0.Status.ModuleName + '' 
                }
                this.setState({
                    displayName: newDisplayName,
                    status0: response,
                })
                this.props.deviceManager.updateDevice(this.macAddress, response);
            } else if (cmnd === 'Template') {
                this.setState({
                    template: response,
                })
                this.deviceConnector.performCommandOnDevice('GPIOs')
            } else if (cmnd === 'GPIO') {
                // console.log('GPIO Response : %O', response)
                this.setState({
                    gpio: response,
                })
                this.deviceConnector.performCommandOnDevice('GPIOs')
            } else if (cmnd === 'GPIOs') {
                this.setState({
                    gpios: response,
                })
            } else if (cmnd === 'State') {

                var status0Clone = Object.assign({}, this.state.status0);

                if (response.Module) {
                    status0Clone.Status.ModuleName = response.Module + '' // Clone
                    delete response.Module
                }
                
                var statusNames = Object.keys(status0Clone)
                
                statusNames.forEach((status) => {
                    Object.keys(status0Clone[status]).forEach((param) => {
                        if (response[param]) {
                            status0Clone[status][param] = response[param]
                        }
                    })
                })

                this.setState({ status0: status0Clone})
                this.props.deviceManager.updateDevice(this.macAddress, status0Clone);

            } else if (cmnd === 'Status 8') {

                var status0Clone = Object.assign({}, this.state.status0);
                status0Clone.StatusSNS = response.StatusSNS

                this.setState({ status0: status0Clone })
                this.props.deviceManager.updateDevice(this.macAddress, status0Clone);
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

    renderTypeTableStatusRow() {
        return(
            <TableRow key={this.props.macAddress}>
              <TableCell component="th" scope="row">
                {this.state.status0.Status.FriendlyName[0]}
              </TableCell>
              <TableCell>{this.renderConnectivityStatus()}</TableCell>
              <TableCell align="center">{this.props.actionButtons}</TableCell>
              <TableCell>{this.state.status0.Status.ModuleName ? `${this.state.status0.Status.ModuleName} (${this.state.status0.Status.Module})` : this.state.status0.Status.Module}</TableCell>
              <TableCell><Box flex={1} flexDirection='row'>{this.renderDetailsControlsButtons('Table')}</Box></TableCell>
              <TableCell>{this.renderDetailsControlsDimmers('Table')}</TableCell>
            </TableRow>
        )
    }

    renderTypeTableHealthRow() {
        return(
            <TableRow key={this.props.macAddress}>
              <TableCell component="th" scope="row">
                {this.state.status0.Status.FriendlyName[0]}
              </TableCell>
              <TableCell>{this.renderConnectivityStatus()}</TableCell>
              <TableCell align="center">{this.props.actionButtons}</TableCell>
              <TableCell>{this.state.status0.StatusSTS.Wifi.RSSI}</TableCell>
              <TableCell>{this.state.status0.StatusSTS.Uptime}</TableCell>
              <TableCell>{this.state.status0.StatusSTS.MqttCount}</TableCell>
              <TableCell>{this.state.status0.StatusSTS.Wifi.LinkCount}</TableCell>
              <TableCell>{this.state.status0.StatusSTS.Wifi.Downtime}</TableCell>
              <TableCell>{this.state.status0.StatusFWR.Version}</TableCell>
              <TableCell>{this.state.status0.StatusFWR.Core}</TableCell>
              <TableCell>{this.state.status0.StatusPRM.BootCount}</TableCell>
              <TableCell>{this.state.status0.StatusPRM.RestartReason}</TableCell>
              <TableCell>{this.state.status0.StatusSTS.LoadAvg}</TableCell>
              <TableCell>{this.state.status0.StatusSTS.Sleep}</TableCell>
            </TableRow>
        )
    }

    renderTypeTableWifiRow() {
        return(
            <TableRow key={this.props.macAddress}>
              <TableCell component="th" scope="row">
                {this.state.status0.Status.FriendlyName[0]}
              </TableCell>
              <TableCell>{this.renderConnectivityStatus()}</TableCell>
              <TableCell align="center">{this.props.actionButtons}</TableCell>
              <TableCell>{this.state.status0.StatusSTS.Wifi.RSSI}</TableCell>
              <TableCell>{this.state.status0.StatusSTS.Wifi.BSSId}</TableCell>
              <TableCell>{this.state.status0.StatusSTS.Wifi.LinkCount}</TableCell>
              <TableCell>{this.state.status0.StatusSTS.Wifi.Downtime}</TableCell>
              <TableCell>{this.state.status0.StatusNET.Hostname}</TableCell>
              <TableCell>{this.state.status0.StatusNET.Mac}</TableCell>
              <TableCell>{this.state.status0.StatusNET.IPAddress}</TableCell>
              <TableCell>{this.state.status0.StatusNET.Gateway}</TableCell>
              <TableCell>{this.state.status0.StatusSTS.Wifi.SSId}</TableCell>
              <TableCell>{this.state.status0.StatusSTS.Wifi.Channel}</TableCell>
            </TableRow>
        )
    }

    renderTypeTableMqttRow() {
        return(
            <TableRow key={this.props.macAddress}>
              <TableCell component="th" scope="row">
                {this.state.status0.Status.FriendlyName[0]}
              </TableCell>
              <TableCell>{this.renderConnectivityStatus()}</TableCell>
              <TableCell align="center">{this.props.actionButtons}</TableCell>
              <TableCell>{this.state.status0.StatusSTS.Wifi.RSSI}</TableCell>
              <TableCell>{this.state.status0.StatusSTS.MqttCount}</TableCell>
              <TableCell>{this.state.status0.Status.Topic}</TableCell>
              <TableCell>'Full Topic - N/A'</TableCell>
              <TableCell>'Command Topic - N/A'</TableCell>
              <TableCell>'Stat Topic - N/A'</TableCell>
              <TableCell>'Tele Topic - N/A'</TableCell>
              <TableCell>'Fallback Topic - N/A'</TableCell>
              <TableCell>{this.state.status0.StatusPRM.GroupTopic}</TableCell>
              <TableCell>{this.state.status0.StatusMQT.MqttHost}</TableCell>
              <TableCell>{this.state.status0.StatusMQT.MqttPort}</TableCell>
              <TableCell>{this.state.status0.StatusMQT.MqttClient}</TableCell>
            </TableRow>
        )
    }

    renderTypeTableFirmwareRow() {
        return(
            <TableRow key={this.props.macAddress}>
              <TableCell component="th" scope="row">
                {this.state.status0.Status.FriendlyName[0]}
              </TableCell>
              <TableCell>{this.renderConnectivityStatus()}</TableCell>
              <TableCell align="center">{this.props.actionButtons}</TableCell>
              <TableCell>{this.state.status0.StatusFWR.Version}</TableCell>
              <TableCell>{this.state.status0.StatusFWR.Core}</TableCell>
              <TableCell>{this.state.status0.StatusFWR.SDK}</TableCell>
              <TableCell>{this.state.status0.StatusMEM.ProgramSize}</TableCell>
              <TableCell>{this.state.status0.StatusMEM.Free}</TableCell>
              <TableCell>{this.state.status0.StatusPRM.OtaUrl}</TableCell>
            </TableRow>
        )
    }

    renderTypeList() {
        return(
            <div style={{ width: '100%' }}>
                <Box display="flex">
                    <DeveloperBoardIcon/>
                    <Box display="flex" flexGrow={1} marginLeft={2}>
                        <Typography>
                        {this.state.displayName}
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
                <ContactlessIcon color={this.state.online ? "primary" : "secondary"}/>
            </Tooltip>
        )
    }

    renderDetailsImage() {
        return (
            <Svg src="https://raw.githubusercontent.com/arendst/Tasmota/development/tools/logo/TASMOTA_Symbol_Vector.svg" width="90%" height="90%" padding="20"/>
        )
    }

    renderDetailsControlsButtons(type = 'Details') {
        if (this.state.status0) {
            let buttons =  Object.entries(this.state.status0['StatusSTS']).filter(([key, value]) => {
                if (powerRegex.test(key)) {
                    return [key, value];
                }
            })

            console.log('DetailsControls buttons : %O', buttons)

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
        if (this.state.status0) {
            let dimmers =  Object.entries(this.state.status0['StatusSTS']).filter(([key, value]) => {
                if (dimmerRegex.test(key)) {
                    return [key, value];
                }
            })

            console.log('DetailsControls dimmers : %O', dimmers)

            return dimmers.map(([key, value]) => {

                let display = key + ' ' + value;
                if (type === 'Table') {
                    display = key.replace('Dimmer', 'Dim');
                    display += ':'+value
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
        
            return Object.entries(this.state.status0).map(([cmnd, cmndData]) => {
                
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

    copyToClipboard() {
        const el = document.createElement('textarea');
        el.value = JSON.stringify(this.state.status0, null, 2)
        el.setAttribute('readonly', '');
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
    }

    convertHexStringToBitArray(bytesString) {
        var bitArray = [];
        var digitValue = 0;
        let charArray = bytesString.toLowerCase().split('');


        charArray.forEach((char, index) => {
            digitValue = '0123456789abcdefgh'.indexOf(char);
            for(let n = 3; n >= 0; n--) {
                bitArray.push((digitValue >> n) & 1)
            }
        })

        // console.log('ByteString: %s to bitArray : %O', bytesString, bitArray.reverse())
        return bitArray.reverse()
    }


    renderDetailsSetOptions() {
        return (
            <ExpansionPanel key="SetOptionFlagExpansionPanel">
                        <ExpansionPanelSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                        >
                        <Typography>SetOption Flags List</Typography>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>
                        <List dense >
                            {this.renderDetailsSetOptionsListItems()}
                        </List>
            </ExpansionPanelDetails>
            </ExpansionPanel>
        )
    }

    renderDetailsSetOptionsListItems() {

        return this.state.status0.StatusLOG.SetOption.map((setOptionStr,index) => {
            if (index !== 1) {
            let valueArray = this.convertHexStringToBitArray(setOptionStr)
            return TasmotaVersionedConfig.TasmotaConfig_06070000.setOptionsStatusMaps[index].items.map((item, itemIndex) => {
                if (item.name !== '' && item.description !== '') {
                    var soValue = itemIndex + TasmotaVersionedConfig.TasmotaConfig_06070000.setOptionsStatusMaps[index].setOptionStart;
                    // console.log('SetOption%d (%s) : %d', soValue, item.name, valueArray[itemIndex])
                    return (
                        <React.Fragment>
                            <ListItem key={'SetOption' + soValue}>
                                <ListItemText id={'checkbox-lable-SetOption' + soValue} primary={`SetOption${soValue}`} 
                                    secondary={item.description}/>
                                <ListItemSecondaryAction>
                                <Checkbox
                                    edge="end"
                                    checked={valueArray[itemIndex] === 1}
                                    disabled
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
        var keys = Object.keys(this.state.gpios)

        if (gpio === 255) {
            return 'User'
        }

        for(let n = 0; n < keys.length; n++) {
            console.log("Keys %s", this.state.gpios[keys[n]])
            if (!Array.isArray(this.state.gpios[keys[n]])) {
                if (this.state.gpios[keys[n]][gpio]) {
                    return this.state.gpios[keys[n]][gpio]
                } else {
                    return 'User'
                }
            } else {
                for (let i = 0; i < this.state.gpios[keys[n]].length; i++) {
                    if(this.state.gpios[keys[n]][i].startsWith(gpio.toString() + ' ')) {
                        return this.state.gpios[keys[n]][i].replace(gpio.toString(), "")
                    }
                }
            }
        }
    }

    renderTemplateResponse() {
        return (
            <Table size="small">
                <TableBody>
                    <TableRow>
                        <TableCell>NAME</TableCell>
                        <TableCell>{this.state.template.NAME}</TableCell>
                    </TableRow>

                    {
                        this.state.template.GPIO.map((gpio, index) => {
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
                        <TableCell>{this.state.template.FLAG}</TableCell>
                    </TableRow>

                    <TableRow>
                        <TableCell>BASE</TableCell>
                        <TableCell>{this.state.template.BASE}</TableCell>
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

            {this.state.template === '' || this.state.gpios === '' ? <CircularProgress /> : 
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

            {Object.keys(this.state.gpio).map((gpio, index) => {
                if (typeof this.state.gpio[gpio] === 'object') {
                    var key = Object.keys(this.state.gpio[gpio])[0]
                    return (
                        <TableRow>
                            <TableCell>{gpio}</TableCell>
                            <TableCell>{`${key} ( ${this.state.gpio[gpio][key]} )`}</TableCell>
                        </TableRow>
                    )
                } else {
                    return (
                        <TableRow>
                            <TableCell>{gpio}</TableCell>
                            <TableCell>{this.state.gpio[gpio]}</TableCell>
                        </TableRow>
                    )
                }
            })} 

            </TableBody>
            </Table>
        )
    }

    renderDetailsGPIO() {
        return (
        <ExpansionPanel key="GPIODetailsExpansionPanel" onChange={this.getPanelCommandData('GPIO')}>
             <ExpansionPanelSummary
             expandIcon={<ExpandMoreIcon />}
             aria-controls="panel1a-content"
             id="panel1a-header"
             >
             <Typography>Module GPIO</Typography>
             </ExpansionPanelSummary>
             <ExpansionPanelDetails>
 
             {this.state.gpio === '' || this.state.gpios === '' ? <CircularProgress /> : 
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
                        <TableCell>{this.state.status0.StatusSTS.Wifi.SSId}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell />
                        <TableCell>Wifi Strength</TableCell>
                        <TableCell>{this.state.status0.StatusSTS.Wifi.RSSI}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell />
                        <TableCell>Wifi Channel</TableCell>
                        <TableCell>{this.state.status0.StatusSTS.Wifi.Channel}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell />
                        <TableCell>Wifi BSSID</TableCell>
                        <TableCell>{this.state.status0.StatusSTS.Wifi.BSSId}</TableCell>
                    </TableRow>
                </TableBody>
                </Table>
            </ExpansionPanelDetails>
            </ExpansionPanel>
        </React.Fragment>
        )
    }

    renderTypeSettings() {
        let mqttSettingsGroup = {
            groupName: "Mqtt Settings",
            settings: [{
                name: 'Mqtt Host',
                command: 'MqttHost',
            }, {
                name: 'Mqtt User',
                command: 'MqttUser',
            }, {
                name: 'Mqtt Password',
                command: 'MqttPassword',
            }]
        }

        let wifiSettingsGroup = {
            groupName: "Wifi Settings",
            settings: [{
                name: 'Ssid 1',
                command: 'Ssid1',
            }, {
                name: 'Password 1',
                command: 'Password1',
            }, {
                name: 'Ssid 2',
                command: 'Ssid2',
            }, {
                name: 'Password 2',
                command: 'Password2',
            }, {
                name: 'Hostname',
                command: 'Hostname',
            }]
        }

        let ruleSettingsGroup = {
            groupName: 'Rules',
            settings: [{
                name: 'Rule 1',
                command: 'Rule1',
            },{
                name: 'Rule 2',
                command: 'Rule2'
            },{
                name: 'Rule 3',
                command: 'Rule3'
            }]
        }

        return(
            <React.Fragment>
                


                <TableRow>
                    <TableCell colSpan={3}>
                        <SettingsGroup deviceConnector={this.deviceConnector} settingsGroup={wifiSettingsGroup} />
                    </TableCell>
                </TableRow>                

                <TableRow>
                    <TableCell colSpan={3}>
                        <SettingsGroup deviceConnector={this.deviceConnector} settingsGroup={mqttSettingsGroup} />
                    </TableCell>
                </TableRow>
                
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

                <TableRow>
                    <TableCell colSpan={3}>
                        {this.renderDetailsTemplate()}
                    </TableCell>
                </TableRow>

                <TableRow>
                    <TableCell colSpan={3}>
                        {this.renderDetailsSetOptions()}
                    </TableCell>
                </TableRow>

                <TableRow>
                        <TableCell align="left"><Typography>Status Report</Typography></TableCell>
                        <TableCell align="center" colSpan={2}>
                            <Button variant="contained" key="copy-to-clipboard-button" onClick={(event) => this.copyToClipboard(event)}>Copy to clipboard</Button>
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
            <Box display="flex" flexDirection="column" flexGrow={1} justifyItems="center" justifyContent="center" style={{maxWidth: 900}}>
            <Box display="flex" flexDirection="column" flexWrap="wrap" justifyContent="space-around" alignItems="center">
                    <Paper align="center" style={{width: 200, height: 200}}>
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
                            <TableCell align="center" colSpan={2}>{this.state.status0.Status.FriendlyName[0]}</TableCell>
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
        console.log('Tasmota Device renderType : %s', this.props.renderType)
        switch(this.props['renderType']) {
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
                         {this.state.displayName} RenderType : {this.props.renderType}
                    </Typography>
                )
                break
        }
    }
}

export default withStyles(styles)(TasmotaDevice);