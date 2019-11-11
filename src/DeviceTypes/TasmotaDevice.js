import { withStyles, ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { green, blue } from '@material-ui/core/colors';
import { Box, Grid, Paper, Container, Button, Slider } from '@material-ui/core';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography';
import DeleteIcon from '@material-ui/icons/Delete';
import DeveloperBoardIcon from '@material-ui/icons/DeveloperBoard';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import React, { Component } from 'react';
import Svg from 'react-inlinesvg';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import VisibilityListener from '../Utils/VisibilityListener';
import Popover from '@material-ui/core/Popover';

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
        }
    }

    onWindowVisibilityChanged(visible) {
        if (visible) {
            this.deviceConnector.resume();
        } else {
            this.deviceConnector.pause();
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
        this.deviceConnector.connect(this);
        VisibilityListener.addVisibilityChangeCallback(this.onWindowVisibilityChanged.bind(this));
    }

    componentWillUnmount() {
        VisibilityListener.removeVisibilityChangeCallback(this.onWindowVisibilityChanged.bind(this));
        this.deviceConnector.disconnect();
    }

    onStatus0(response) {
        // console.log('Status0 %s :  %O', this.macAddress, response);
        let newDisplayName = response.Status.FriendlyName[0] + ' (' + this.macAddress + ')';
        // console.log(newDisplayName);
        this.setState({
            displayName: newDisplayName,
            status0: response,
        })
        this.props.deviceManager.updateDevice(this.macAddress, response);
    }

    powerToggle(button, event) {
        event.stopPropagation();
        console.log('Toggle power ' + button)
        this.deviceConnector.performCommandOnDevice(button + ' TOGGLE');
        this.deviceConnector.getStatus0();
    }

    dimmerUpdate(dimmer, event, newValue) {
        console.log('Dimmer id : %O, value %O newValue %O', dimmer, event, newValue);
        event.stopPropagation()
        this.deviceConnector.performCommandOnDevice(dimmer + ' ' + newValue);
        this.deviceConnector.getStatus0();
    }

    renderTypeTableStatusRow() {
        return(
            <TableRow key={this.state.status0}>
              <TableCell component="th" scope="row">
                {this.state.status0.Status.FriendlyName[0]}
              </TableCell>
              <TableCell>{this.props.actionButtons}</TableCell>
              <TableCell>{this.state.status0.Status.Module}</TableCell>
              <TableCell><Box flex={1} flexDirection='row'>{this.renderDetailsControlsButtons('Table')}</Box></TableCell>
              <TableCell>{this.renderDetailsControlsDimmers('Table')}</TableCell>
              <TableCell>{this.state.status0.StatusSTS.LoadAvg}</TableCell>
              <TableCell>{this.state.status0.StatusSTS.Uptime}</TableCell>
            </TableRow>
        )
    }

    renderTypeTableHealthRow() {
        return(
            <TableRow key={this.state.status0}>
              <TableCell component="th" scope="row">
                {this.state.status0.Status.FriendlyName[0]}
              </TableCell>
              <TableCell>{this.props.actionButtons}</TableCell>
              <TableCell>{this.state.status0.StatusSTS.Uptime}</TableCell>
              <TableCell>{this.state.status0.StatusPRM.BootCount}</TableCell>
              <TableCell>{this.state.status0.StatusPRM.RestartReason}</TableCell>
              <TableCell>{this.state.status0.StatusSTS.LoadAvg}</TableCell>
              <TableCell>{this.state.status0.StatusSTS.Sleep}</TableCell>
              <TableCell>{this.state.status0.StatusSTS.MqttCount}</TableCell>
              <TableCell>{this.state.status0.StatusSTS.Wifi.LinkCount}</TableCell>
              <TableCell>{this.state.status0.StatusSTS.Wifi.Downtime}</TableCell>
              <TableCell>{this.state.status0.StatusSTS.Wifi.RSSI}</TableCell>
            </TableRow>
        )
    }

    renderTypeTableWifiRow() {
        return(
            <TableRow key={this.state.status0}>
              <TableCell component="th" scope="row">
                {this.state.status0.Status.FriendlyName[0]}
              </TableCell>
              <TableCell>{this.props.actionButtons}</TableCell>
              <TableCell>{this.state.status0.StatusNET.Hostname}</TableCell>
              <TableCell>{this.state.status0.StatusNET.Mac}</TableCell>
              <TableCell>{this.state.status0.StatusNET.IPAddress}</TableCell>
              <TableCell>{this.state.status0.StatusNET.Gateway}</TableCell>
              <TableCell>{this.state.status0.StatusSTS.Wifi.SSId}</TableCell>
              <TableCell>{this.state.status0.StatusSTS.Wifi.BSSId}</TableCell>
              <TableCell>{this.state.status0.StatusSTS.Wifi.Channel}</TableCell>
              <TableCell>{this.state.status0.StatusSTS.Wifi.RSSI}</TableCell>
              <TableCell>{this.state.status0.StatusSTS.Wifi.LinkCount}</TableCell>
              <TableCell>{this.state.status0.StatusSTS.Wifi.Downtime}</TableCell>
            </TableRow>
        )
    }

    renderTypeTableMqttRow() {
        return(
            <TableRow key={this.state.status0}>
              <TableCell component="th" scope="row">
                {this.state.status0.Status.FriendlyName[0]}
              </TableCell>
              <TableCell>{this.props.actionButtons}</TableCell>
              <TableCell>{this.state.status0.StatusMQT.MqttHost}</TableCell>
              <TableCell>{this.state.status0.StatusMQT.MqttPort}</TableCell>
              <TableCell>{this.state.status0.StatusMQT.MqttClient}</TableCell>
              <TableCell>{this.state.status0.Status.Topic}</TableCell>
              <TableCell>{this.state.status0.StatusPRM.GroupTopic}</TableCell>
            </TableRow>
        )
    }

    renderTypeTableFirmwareRow() {
        return(
            <TableRow key={this.state.status0}>
              <TableCell component="th" scope="row">
                {this.state.status0.Status.FriendlyName[0]}
              </TableCell>
              <TableCell>{this.props.actionButtons}</TableCell>
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
        if (this.state.status0) {
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
                        <Table aria-label="simple table">
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
    }  

    renderTypeDetails() {
        return(
            <Grid container justify="center" alignItems="center" direction="column" width="sm" xs={12}>
                <Grid margin={20} className={styles.detailsContainer} >
                    <Container fixed className={styles.imageContainer}>
                        {this.renderDetailsImage()}
                    </Container>
                </Grid>
                <Grid xs={12} className={styles.detailsContainer} >
                    <Typography variant="h5">
                        {this.state.displayName}
                    </Typography>
                </Grid>
                <Grid xs={12} width="sm">
                    {this.renderDetailsControlsDimmers()}
                </Grid>
                <Grid xs={12}>
                    {this.renderDetailsControlsButtons()}
                </Grid>

                <Grid xs={10}>
                    {this.renderDetailsStatuses()}
                </Grid>
                    <DeleteIcon/>
            </Grid>
        )
    }

    render() {
        console.log('Tasmota Device renderType : %s', this.props.renderType)
        switch(this.props['renderType']) {
            case 'List':
                return this.renderTypeList();

            case 'Details':
                return this.renderTypeDetails();

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