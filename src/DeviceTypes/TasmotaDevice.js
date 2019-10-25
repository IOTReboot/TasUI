import React, { Component } from 'react';
import { Typography } from '@material-ui/core';

class TasmotaDevice extends Component {

    deviceConnector = {};
    ipAddress = "";

    constructor(props) {
        super(props);
        this.ipAddress = this.props.ipAddress;
        this.deviceConnector = this.props.deviceManager.getDeviceConnector(this.ipAddress);
        this.state = {
            displayName: this.ipAddress,
        }
    }

    componentDidMount() {
        this.deviceConnector.connect(this);
    }

    componentWillUnmount() {
        this.deviceConnector.disconnect();
    }

    onStatus0(response) {
        console.log('Status0 %s :  %O', this.ipAddress, response);
        let newDisplayName = response.data.Status.FriendlyName[0] + ' (' + this.ipAddress + ')';
        console.log(newDisplayName);
        this.setState({
            displayName: newDisplayName,
        })
    }

    render() {
        return(
            <Typography>
                {this.state.displayName}
            </Typography>
        )
    }
}

export default TasmotaDevice;