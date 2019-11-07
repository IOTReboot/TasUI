import React from 'react'
import Container from "@material-ui/core/Container";
import Box from "@material-ui/core/Box"
import TextField from "@material-ui/core/TextField"
import Button from "@material-ui/core/Button"
import LinearProgress from "@material-ui/core/LinearProgress"
import ExpansionPanel from "@material-ui/core/ExpansionPanel"
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary"
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"
import TasmotaDevice from "../DeviceTypes/TasmotaDevice"

import axios from "axios";
import superagent from "superagent"
import IPAddress from 'ip-address';
import { Typography } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import SettingsApplicationsIcon from '@material-ui/icons/SettingsApplications';

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
            devices: [],
            
        }
        
    }

    componentDidMount() {
        this.calculateTotalIPs();
    }

    handleIPFromChange = event => {
        this.setState({
            ipFrom: event.target.value,
        });
        this.calculateTotalIPs();
    }

    handleIPToChange = event => {
        this.setState({
            ipTo: event.target.value,
        });
        this.calculateTotalIPs();
    }

    calculateTotalIPs() {

        let from = new IPAddress.Address4(this.state.ipFrom);
        let to = new IPAddress.Address4(this.state.ipTo);

        console.log('From %O : To %O ', from.bigInteger().toString() , to.bigInteger().toString());

        this.setState({
            totalAddresses: (to.bigInteger() - from.bigInteger() + 1),
        })

        console.log('Total Addresses : ' + (to.bigInteger() - from.bigInteger() + 1));
    }

    onCommandResponse(args) {
        console.log(`${args.ip} : Present : ${args.success} Response : %O`, args.response);
        if (args.success) {
            let newDevices = this.state.devices.concat(args.ip);
            console.log('NewDevices %O', newDevices);
            this.setState({
                devices: newDevices,
            })
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
        }
    }

    sendRequest(ip) {
        var callback = function(err, response) {
            this.onCommandResponse({key: this.cmnd, response: err ? err : response, ip: this.ip, url: this.url, success: err ? false : true});
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

        this.scanIps();
    }

    openDeviceDetails = (ipAddress, event) => {
        event.stopPropagation();
        this.props.history.push('/devices/' + ipAddress);
    }

    addDevice = (ipAddress, event) => {
        console.log('Add Device ' + ipAddress)
        event.stopPropagation();
        this.props.deviceManager.addDevice(ipAddress);
        this.setState({

        })
    }

    deleteDevice = (ipAddress, event) => {
        console.log('Delete Device ' + ipAddress)
        event.stopPropagation();
        this.props.deviceManager.removeDevice(ipAddress);
        this.setState({
            
        })
    }

    render() {

        return (
            <Container>
                <h1>Find Devices</h1>
                <Box>
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
                <Button 
                    variant="contained"
                    margin="normal"
                    onClick={() => this.handleFindClicked()}
                >
                    Find
                </Button>
                </Box>
                <Typography>
                    IPs to scan : {this.state.totalAddresses}
                </Typography>
                <LinearProgress variant="buffer" value={this.state.numIpsCompleted} valueBuffer={this.state.numIpsRequested} />
                {this.state.devices.map((ip, index) => {

                    let buttons = (
                        <div>
                            <SettingsApplicationsIcon onClick={(event) => this.openDeviceDetails(ip, event)}/>
                            {!this.props.deviceManager.isDeviceKnown(ip) ?
                                <AddIcon onClick={(event) => this.addDevice(ip, event)}/>
                                : <DeleteIcon onClick={(event) => this.deleteDevice(ip, event)}/>
                            }
                        </div>
                    )

                    return (
                        <ExpansionPanel key={ip}>
                        <ExpansionPanelSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1c-content"
                            id="panel1c-header"
                            >
                            <TasmotaDevice ipAddress={ip} renderType="List" deviceManager={this.props.deviceManager} openDeviceDetails={this.handleIpAddressClicked} actionButtons={buttons}/>
                        </ExpansionPanelSummary>
                        </ExpansionPanel>
                    )}
                )}
            </Container>
        )

    }

}

export default FindDevices;