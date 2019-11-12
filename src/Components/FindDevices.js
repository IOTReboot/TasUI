import { Typography } from '@material-ui/core';
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import LinearProgress from "@material-ui/core/LinearProgress";
import TextField from "@material-ui/core/TextField";
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import SettingsApplicationsIcon from '@material-ui/icons/SettingsApplications';
import IPAddress from 'ip-address';
import React from 'react';
import superagent from "superagent";
import DeviceList from './DeviceList';
import DisplayTypeButtons from './DisplayTypeButtons';


class FindDevices extends React.Component {

    ipsToScan = [];
    ipsRequested = [];

    constructor(props) {
        super(props)
        this.state = {
            ipFrom: "192.168.10.1",
            ipTo: "192.168.10.254",
            totalAddresses: "",
            numIpsRequested: 0,
            numIpsCompleted: 0,
            searching: false,
            displayMode: "Table_Status"
        }
        
    }

    componentWillMount() {
        this.calculateTotalIPs(this.state.ipFrom, this.state.ipTo);
    }

    componentWillUnmount() {
        // this.props.deviceManager.clearDiscoveredDevices();
    }

    handleIPFromChange = event => {
        this.setState({
            ipFrom: event.target.value,
        });
        this.calculateTotalIPs(event.target.value, this.state.ipTo);
    }

    handleIPToChange = event => {
        this.setState({
            ipTo: event.target.value,
        });
        this.calculateTotalIPs(this.state.ipFrom, event.target.value);
    }

    calculateTotalIPs(ipFrom, ipTo) {

        console.log('Calculate IPs From %s : To %s ', ipFrom , ipTo);

        let from = new IPAddress.Address4(ipFrom);
        let to = new IPAddress.Address4(ipTo);

        console.log('From %O : To %O ', from.bigInteger().toString() , to.bigInteger().toString());

        this.setState({
            totalAddresses: (to.bigInteger() - from.bigInteger() + 1),
        })

        console.log('Total Addresses : ' + (to.bigInteger() - from.bigInteger() + 1));
    }

    onCommandResponse(args) {
        console.log(`${args.ip} : Present : ${args.success} Response : %O`, args.response);
        if (args.success) {
            // if (!this.props.deviceManager.isDeviceKnown(args.response.body.StatusNET.Mac)) {
                this.props.deviceManager.addDiscoveredDevice(args.response.body.StatusNET.Mac, args.response.body);
                this.setState({})
            // }
        } else {
            
        }
        this.ipsRequested = this.ipsRequested.filter(item => item !== args.ip);
        this.scanIps()
    }

    scanIps() {
        if (this.ipsToScan.length) {

            while (this.ipsRequested.length < 25 && this.ipsToScan.length) {
                let ip = this.ipsToScan.shift()
                this.ipsRequested.push(ip);
                this.sendRequest(ip)
            }

            this.setState({
                numIpsCompleted: (this.state.totalAddresses - this.ipsToScan.length) * 100 / this.state.totalAddresses,
                numIpsRequested: (this.state.totalAddresses - this.ipsToScan.length + this.ipsRequested.length) * 100 / this.state.totalAddresses
            })
        } else {
            if (this.ipsRequested.length === 0) {
                this.setState({
                    searching: false,
                })
            }
        }
    }

    sendRequest(ip) {
        var callback = function(err, response) {
            this.onCommandResponse({key: this.cmnd, response: response, error: err, ip: this.ip, url: this.url, success: err ? false : true});
        }

        let cmnd = "Status 0"
        // let ip = IPAddress.Address4.fromBigInteger(ipNum).correctForm();
        let url = 'http://' +  ip  + '/cm?cmnd=' + encodeURI(cmnd);

        superagent.get(url)
        .timeout({
            response: 5000,  // Wait 5 seconds for the server to start sending,
            deadline: 60000, // but allow 1 minute for the file to finish loading.
          })
          .end(callback.bind({onCommandResponse: this.onCommandResponse.bind(this), ip: ip, url: url, cmnd: cmnd, success: true}))

    }

    handleFindClicked() {

        let from = new IPAddress.Address4(this.state.ipFrom).bigInteger();
        let to = new IPAddress.Address4(this.state.ipTo).bigInteger();


        for(let ipNum = from; ipNum <= to; ipNum++) {
            this.ipsToScan.push(IPAddress.Address4.fromBigInteger(ipNum).correctForm());
        }
        this.setState({
            searching: true,
        })
        this.scanIps();
    }

    handleStopClicked() {
        this.ipsToScan = [];
        this.scanIps();
    }

    openDeviceDetails = (macAddress, event) => {
        event.stopPropagation();
        this.props.history.push('/devices/' + macAddress);
    }

    addDevice = (macAddress, event) => {
        console.log('Add Device ' + macAddress)
        event.stopPropagation();
        this.props.deviceManager.addDevice(macAddress, this.props.deviceManager.getDiscoveredDevices()[macAddress]);
        this.setState({})
    }

    deleteDevice = (macAddress, event) => {
        console.log('Delete Device ' + macAddress)
        event.stopPropagation();
        this.props.deviceManager.removeDevice(macAddress);
        this.setState({})
    }

    knownDeviceButtons = [{
        toolTip: "Details",
        label: "details",
        icon: <SettingsApplicationsIcon />,
        onButtonClick: (mac, event) => this.openDeviceDetails(mac, event),
    },{
        toolTip: "Delete", 
        label: "delete", 
        icon: <DeleteIcon />,
        onButtonClick: (mac, event) => this.deleteDevice(mac, event),
    }]

    newDeviceButtons = [{
        toolTip: "Details",
        label: "details",
        icon: <SettingsApplicationsIcon />,
        onButtonClick: (mac, event) => this.openDeviceDetails(mac, event),
    },{
        toolTip: "Add", 
        label: "add", 
        icon: <AddIcon />,
        onButtonClick: (mac, event) => this.addDevice(mac, event),
    }]

    render() {

        let discoveredDevices = this.props.deviceManager.getDiscoveredDevices()
        let discoveredDevicesMacs = Object.keys(discoveredDevices)
        
        let newDevices = discoveredDevicesMacs.filter((mac) => {
            return !this.props.deviceManager.isDeviceKnown(mac)
        }).reduce((obj, key) => {
            obj[key] = discoveredDevices[key];
            return obj;
        }, {});


        let knownDevices = discoveredDevicesMacs.filter((mac) => {
            return this.props.deviceManager.isDeviceKnown(mac)
        }).reduce((obj, key) => {
            obj[key] = discoveredDevices[key];
            return obj;
        }, {});


        return (
            <Container>
                <Box display="flex" alignItems="baseline" flexDirection="row">
                <h1>Discover Active Devices</h1>
                <DisplayTypeButtons displayMode={this.state.displayMode} setState={(state) => this.setState(state)} />
                </Box>
                <Box display="flex" alignItems="baseline" flexDirection="row">
                <TextField
                    id="outlined-name"
                    label="Start IP Address"
                    placeholder="IP"
                    margin="normal"
                    variant="outlined"
                    value={this.state.ipFrom}
                    onChange={this.handleIPFromChange}
                />
                <TextField
                    id="outlined-name"
                    label="End IP Address"
                    placeholder="IP"
                    margin="normal"
                    variant="outlined"
                    value={this.state.ipTo}
                    onChange={this.handleIPToChange}
                />
                {!this.state.searching ? 
                    <Button variant="contained" margin="normal" onClick={() => this.handleFindClicked()}>Start Discovery</Button>
                    : <Button variant="contained" margin="normal" onClick={() => this.handleStopClicked()} >Stop Discovery</Button>
                }
                </Box>
                <Typography>
                    IPs to scan : {this.state.totalAddresses}
                </Typography>
                {this.state.searching ? 
                    <LinearProgress variant="buffer" value={this.state.numIpsCompleted} valueBuffer={this.state.numIpsRequested} />
                    : null }
                    

                {/* <h3>New Devices</h3> */}
                <DeviceList 
                    key="newDevices"
                    displayMode={this.state.displayMode} 
                    deviceSections={{ "New Devices": { devices: newDevices, itemButtons: this.newDeviceButtons},
                                     "Saved Devices": { devices: knownDevices, itemButtons: this.knownDeviceButtons}}}
                    deviceManager={this.props.deviceManager}
                />

            </Container>
        )

    }

}



export default FindDevices;