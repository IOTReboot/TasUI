import React from 'react'
import { Component } from "react";
import { Typography, Box } from "@material-ui/core";
import TasmotaDevice from '../DeviceTypes/TasmotaDevice';

class DeviceDetails extends Component {

    constructor(props) {
        super(props);
        this.state = {
            macAddress: "",
        }
    }

    componentDidMount() {
        this.setState({
            macAddress: this.props.match.params.mac
        })

    }

    render() {
        if (this.state.macAddress !== "") {
            return (
                <Box style={{overflow: "visible", position: "absolute"}}>
                    <TasmotaDevice macAddress={this.state.macAddress} renderType="Settings" deviceManager={this.props.deviceManager} />
                </Box>
            );
        } else {
            return null;
        }
    }
}

export default DeviceDetails;