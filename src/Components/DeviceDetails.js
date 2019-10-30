import React from 'react'
import { Component } from "react";
import { Typography } from "@material-ui/core";
import TasmotaDevice from '../DeviceTypes/TasmotaDevice';

class DeviceDetails extends Component {

    constructor(props) {
        super(props);
        this.state = {
            ipAddress: "",
        }
    }

    componentDidMount() {
        this.setState({
            ipAddress: this.props.match.params.ip
        })
    }

    render() {
        if (this.state.ipAddress !== "") {
            return (
                <TasmotaDevice ipAddress={this.state.ipAddress} renderType="Details" deviceManager={this.props.deviceManager} />
            );
        } else {
            return null;
        }
    }
}

export default DeviceDetails;