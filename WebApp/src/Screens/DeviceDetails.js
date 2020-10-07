/*

  Copyright (C) 2019  Shantur Rathore
  
  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.
  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.
  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <http://www.gnu.org/licenses/>.

*/

import React from 'react'
import { Component } from "react";
import { Typography, Box } from "@material-ui/core";
import TasmotaDevice from '../DeviceTypes/TasmotaDevice';
import { withStyles, ThemeProvider, createMuiTheme } from '@material-ui/core/styles';

class DeviceDetails extends Component {

    constructor(props) {
        super(props);
        this.state = {
            macAddress: "",
        }
    }

    componentDidMount() {
        window.gtag('event', 'DeviceDetails');
        window.gtag('event', 'screen_view', { 'screen_name': 'DeviceDetails'});
        this.setState({
            macAddress: this.props.match.params.mac
        })

    }

    render() {
        if (this.state.macAddress !== "") {
            return (
                <Box style={{ overflow: "visible", position: "absolute" }}>
                    <TasmotaDevice macAddress={this.state.macAddress} renderType="Details" deviceManager={this.props.deviceManager} />
                </Box>
            );
        } else {
            return null;
        }
    }
}

export default DeviceDetails