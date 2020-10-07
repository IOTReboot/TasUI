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
import Box from '@material-ui/core/Box';
import HealingIcon from '@material-ui/icons/Healing';
import SettingsInputAntennaIcon from '@material-ui/icons/SettingsInputAntenna';
import SystemUpdateAltIcon from '@material-ui/icons/SystemUpdateAlt';
import TableChartIcon from '@material-ui/icons/TableChart';
import WifiIcon from '@material-ui/icons/Wifi';
import ActionButton from './ActionButton'

class DisplayModeButtons extends React.Component {

    render() {
        return (
            <Box display="flex" flexGrow={1} justifyContent="flex-start">
                <ActionButton
                    toolTip="Status View"
                    label="status"
                    icon={<TableChartIcon />}
                    onButtonClick={() => this.props.setState({ displayMode: "Table_Status" })}
                    selected={this.props.displayMode === "Table_Status"}
                    selectedIcon={<TableChartIcon color="primary" />}
                />

                <ActionButton
                    toolTip="Health View"
                    label="health"
                    icon={<HealingIcon />}
                    onButtonClick={() => this.props.setState({ displayMode: "Table_Health" })}
                    selected={this.props.displayMode === "Table_Health"}
                    selectedIcon={<HealingIcon color="primary" />}
                />

                <ActionButton
                    toolTip="Firmware View"
                    label="firmware"
                    icon={<SystemUpdateAltIcon />}
                    onButtonClick={() => this.props.setState({ displayMode: "Table_Firmware" })}
                    selected={this.props.displayMode === "Table_Firmware"}
                    selectedIcon={<SystemUpdateAltIcon color="primary" />}
                />


                <ActionButton
                    toolTip="Wifi View"
                    label="wifi"
                    icon={<WifiIcon />}
                    onButtonClick={() => this.props.setState({ displayMode: "Table_WIFI" })}
                    selected={this.props.displayMode === "Table_WIFI"}
                    selectedIcon={<WifiIcon color="primary" />}
                />

                <ActionButton
                    toolTip="Mqtt View"
                    label="MQTT"
                    icon={<SettingsInputAntennaIcon />}
                    onButtonClick={() => this.props.setState({ displayMode: "Table_Mqtt" })}
                    selected={this.props.displayMode === "Table_Mqtt"}
                    selectedIcon={<SettingsInputAntennaIcon color="primary" />}
                />

            </Box>)
    }
}

export default DisplayModeButtons