import React from 'react'
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import TextField from '@material-ui/core/TextField';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import DeveloperBoardIcon from '@material-ui/icons/DeveloperBoard';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';


class Devices extends React.Component {
    constructor(props) {
        super(props);
        let savedDevices = "devices" in localStorage ? JSON.parse(localStorage.getItem('devices')) : [];
        this.state = {
            devices: savedDevices,
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
        if (!this.state.devices.find(item => item === ipAddress) && ipAddress.length > 0) {
            const newDevices = this.state.devices.concat(ipAddress);
            this.setState({
                devices: newDevices,
            });
            localStorage.setItem('devices', JSON.stringify(newDevices));
        }
    }

    handleConnectClick() {
        this.addIPAddressIfNeeded(this.state.ipAddress)
        this.handleIpAddressClicked(this.state.ipAddress)
    }

    handleIpAddressClicked = ipAddress => {
        sessionStorage.setItem('ipAddress', ipAddress);
        this.props.history.push('/info');
    }

    handleIpAddressDelete = ipAddress => {
        console.log('Delete ' + ipAddress);
        if (this.state.devices.find(item => item === ipAddress)) {
            const newDevices = this.state.devices.filter(item => item != ipAddress);
            console.log('NewDevices ' + newDevices);
            this.setState({
                devices: newDevices,
            });
            localStorage.setItem('devices', JSON.stringify(newDevices));
        }
    }

    render() {
    return (
        <Container maxWidth="sm">
            <h1>Devices</h1>

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

            <List>
            {this.state.devices.map((item, index) => (
                <ListItem button key={item}>
                    <ListItemIcon onClick={() => this.handleIpAddressClicked(item)}><DeveloperBoardIcon/></ListItemIcon>
                    <ListItemText primary={item} onClick={() => this.handleIpAddressClicked(item)}/>
                    <ListItemIcon onClick={() => this.handleIpAddressDelete(item)}><HighlightOffIcon/></ListItemIcon>
                </ListItem>
            ))}
            </List>
        </Container>
    );
  }
}
export default Devices