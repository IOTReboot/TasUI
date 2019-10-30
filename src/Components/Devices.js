import React from 'react'
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import TextField from '@material-ui/core/TextField';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import DeveloperBoardIcon from '@material-ui/icons/DeveloperBoard';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import DeleteIcon from '@material-ui/icons/Delete';

import TasmotaDevice from '../DeviceTypes/TasmotaDevice';
import findLocalIp from '../Utils/IPFinder';


class Devices extends React.Component {
    constructor(props) {
        super(props);
        console.log(this.props);
        this.state = {
            devices: this.props.deviceManager.getDevices(),
            ipAddress: "",
        }
    }

    componentDidMount() {
        console.log(this.props);
        if ("ip" in this.props.match.params) {
            this.addIPAddressIfNeeded(this.props.match.params.ip);
        }

    }

    handleIPChange = event => {
        this.setState({
            ipAddress: event.target.value,
        });
    }

    addIPAddressIfNeeded = ipAddress => {
        this.props.deviceManager.addDevice(ipAddress);
        const newDevices = this.props.deviceManager.getDevices();
        this.setState({
            devices: newDevices
        });
    }

    handleConnectClick() {
        this.addIPAddressIfNeeded(this.state.ipAddress)
        this.handleIpAddressClicked(this.state.ipAddress)
    }

    handleIpAddressClicked = ipAddress => {
        // sessionStorage.setItem('ipAddress', ipAddress);
        this.props.history.push('/devices/' + ipAddress);
    }

    handleIpAddressDelete = ipAddress => {
        this.props.deviceManager.removeDevice(ipAddress);
        const newDevices = this.props.deviceManager.getDevices();
        this.setState({
            devices: newDevices
        });
    }

    render() {
    return (
        <Container maxWidth="sm">
            <h1>Devices</h1>
            <Box>
            <TextField
                id="outlined-name"
                label="Tasmota IP Address"
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
            <List>
            {this.state.devices.map((item, index) => (
                <ListItem button key={item}>
                    <TasmotaDevice ipAddress={item} renderType="List" deviceManager={this.props.deviceManager} openDeviceDetails={this.handleIpAddressClicked}/>
                </ListItem>
            ))}
            </List>
        </Container>
    );
  }
}
export default Devices