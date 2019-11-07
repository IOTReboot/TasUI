import React from 'react'
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import TextField from '@material-ui/core/TextField';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import SettingsApplicationsIcon from '@material-ui/icons/SettingsApplications';
import DeleteIcon from '@material-ui/icons/Delete'

import TasmotaDevice from '../DeviceTypes/TasmotaDevice';

class Devices extends React.Component {
    constructor(props) {
        super(props);
        console.log(this.props);
        this.state = {
            devices: this.props.deviceManager.getDevices(),
            // ipAddress: "",
        }
    }

    // componentDidMount() {
    //     console.log(this.props);
    //     if ("ip" in this.props.match.params) {
    //         this.addIPAddressIfNeeded(this.props.match.params.ip);
    //     }

    // }

    handleIPChange = event => {
        this.setState({
            ipAddress: event.target.value,
        });
    }

    // addIPAddressIfNeeded = ipAddress => {
    //     this.props.deviceManager.addDevice(ipAddress);
    //     const newDevices = this.props.deviceManager.getDevices();
    //     this.setState({
    //         devices: newDevices
    //     });
    // }

    handleConnectClick() {
        this.addIPAddressIfNeeded(this.state.ipAddress)
        this.openDeviceDetails(this.state.ipAddress)
    }

    openDeviceDetails = (macAddress, event) => {
        event.stopPropagation();
        this.props.history.push('/devices/' + macAddress);
    }

    deleteDevice = (macAddress, event) => {
        event.stopPropagation();
        this.props.deviceManager.removeDevice(macAddress);
        const newDevices = this.props.deviceManager.getDevices();
        this.setState({
            devices: newDevices
        });
    }

    render() {
    return (
        <Container flexGrow={1}>
            <h1>Devices</h1>
            <Box>
            <TextField
                id="outlined-name"
                label="Device IP Address"
                placeholder="IP"
                margin="normal"
                variant="outlined"
                value={this.state.ipAddress}
                onChange={this.handleIPChange}
            />
            <Button 
                variant="contained"
                margin="normal"
                onClick={() => this.handleConnectClick()}
            >
                Connect
            </Button>
            </Box>
            {Object.keys(this.state.devices).map((mac, index) => {

                let buttons = (
                    <div>
                        <SettingsApplicationsIcon onClick={(event) => this.openDeviceDetails(mac, event)}/>
                        <DeleteIcon onClick={(event) => this.deleteDevice(mac, event)}/>
                    </div>
                )
                
                return (
                    <ExpansionPanel key={mac}>
                    <ExpansionPanelSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1c-content"
                        id="panel1c-header"
                        >
                        <TasmotaDevice macAddress={mac} renderType="List" deviceManager={this.props.deviceManager} actionButtons={buttons}/>
                    </ExpansionPanelSummary>
                    </ExpansionPanel>
                    )
                }
            )}
        </Container>
    );
  }
}
export default Devices