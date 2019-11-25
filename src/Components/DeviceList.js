import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Table from '@material-ui/core/Table';
import Box from '@material-ui/core/Box';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import DeleteIcon from '@material-ui/icons/Delete';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import SettingsApplicationsIcon from '@material-ui/icons/SettingsApplications';
import React from 'react';
import TasmotaDevice from '../DeviceTypes/TasmotaDevice';
import ActionButton from './ActionButton';



class DeviceList extends React.Component {
    constructor(props) {
        super(props);
    }

    renderItems() {
        switch ( this.props.displayMode) {
            case "List" :
                return this.renderTypeList()

            case "Table_Status" :
            case "Table_Health" :
            case "Table_WIFI":
            case "Table_Mqtt":
            case "Table_Firmware":
                return this.renderTypeTable()

            case "Card" :
                return this.renderTypeCard()

        }
    }

    renderTypeList() {

        return Object.keys(this.props.devices).map((mac, index) => {
            let buttons = (
                <div>
                    {this.renderButton("Details", "details", (event) => this.openDeviceDetails(mac, event), <SettingsApplicationsIcon />)}
                    {this.renderButton("Delete", "delete", (event) => this.deleteDevice(mac, event), <DeleteIcon />)}
                </div>
            )    
    
            return (
                <ExpansionPanel key={mac}>
                <ExpansionPanelSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1c-content"
                    id="panel1c-header"
                    >
                    <TasmotaDevice macAddress={mac} renderType={this.state.displayMode} deviceManager={this.props.deviceManager} actionButtons={buttons}/>
                </ExpansionPanelSummary>
                </ExpansionPanel>
                )    
        })
    }

    renderTypeCard() {
        return Object.keys(this.props.devices).map((mac, index) => {
            return (
                <TasmotaDevice macAddress={mac} renderType={this.props.displayMode} deviceManager={this.props.deviceManager}/>
            )
        })
    }

    renderTableHeaderStatus() {
        return (
            <TableRow>
                <TableCell>Friendly Name</TableCell>
                <TableCell />
                <TableCell align="center">Actions</TableCell>
                <TableCell>Module</TableCell>
                <TableCell>Power</TableCell>
                <TableCell>Light Controls</TableCell>
          </TableRow>
        )
    }


    renderTableHeaderHealth() {
        return (
            <TableRow>
                <TableCell>Friendly Name</TableCell>
                <TableCell />
                <TableCell align="center">Actions</TableCell>
                <TableCell>RSSI</TableCell>
                <TableCell>Uptime</TableCell>
                <TableCell>Mqtt Count</TableCell>
                <TableCell>Link Count</TableCell>
                <TableCell>Downtime</TableCell>
                <TableCell>Version</TableCell>
                <TableCell>Core</TableCell>
                <TableCell>Boot Count</TableCell>
                <TableCell>Restart Reason</TableCell>
                <TableCell>LoadAvg</TableCell>
                <TableCell>Sleep</TableCell>
          </TableRow>
        )
    }


    renderTableHeaderFirmware() {
        return (
            <TableRow>
                <TableCell>Friendly Name</TableCell>
                <TableCell />
                <TableCell align="center">Actions</TableCell>
                <TableCell>Version</TableCell>
                <TableCell>Core</TableCell>
                <TableCell>SDK</TableCell>
                <TableCell>Program Size</TableCell>
                <TableCell>Free</TableCell>
                <TableCell>OtaURL</TableCell>
          </TableRow>
        )
    }

    renderTableHeaderWifi() {
        return (
            <TableRow>
                <TableCell>Friendly Name</TableCell>
                <TableCell />
                <TableCell align="center">Actions</TableCell>
                <TableCell>RSSI</TableCell>
                <TableCell>BSSID</TableCell>
                <TableCell>Link Count</TableCell>
                <TableCell>Downtime</TableCell>
                <TableCell>Hostname</TableCell>
                <TableCell>Mac Address</TableCell>
                <TableCell>IP Address</TableCell>
                <TableCell>Gateway</TableCell>
                <TableCell>SSID</TableCell>
                <TableCell>Channel</TableCell>
          </TableRow>
        )
    }


    renderTableHeaderMqtt() {
        return (
            <TableRow>
                <TableCell>Friendly Name</TableCell>
                <TableCell />
                <TableCell align="center">Actions</TableCell>
                <TableCell>RSSI</TableCell>
                <TableCell>Mqtt Count</TableCell>
                <TableCell>Topic</TableCell>
                <TableCell>Full Topic</TableCell>
                <TableCell>Command Topic</TableCell>
                <TableCell>Stat Topic</TableCell>
                <TableCell>Tele Topic</TableCell>
                <TableCell>Fallback Topic</TableCell>
                <TableCell>Group Topic</TableCell>
                <TableCell>Mqtt Host</TableCell>
                <TableCell>Mqtt Port</TableCell>
                <TableCell>Mqtt Client</TableCell>
          </TableRow>
        )
    }
    renderTableHeader() {
        // console.log(this.props.displayMode)
        switch (this.props.displayMode) {
            case 'Table_Status':
                return this.renderTableHeaderStatus()

            case 'Table_Health':
                return this.renderTableHeaderHealth()

            case 'Table_WIFI':
                return this.renderTableHeaderWifi()

            case 'Table_Mqtt':
                return this.renderTableHeaderMqtt()

            case 'Table_Firmware':
                return this.renderTableHeaderFirmware()
            
            }
    }

    renderTypeTable() {
        return (

            <Table stickyHeader aria-label="simple table">
            {Object.keys(this.props.deviceSections).map((section, index) => {
               return (
                <React.Fragment>
                {Object.keys(this.props.deviceSections[section].devices).length > 0 ? 
                    <TableRow><h3>{section}</h3></TableRow> : null}

                {index === 0 ? 
                <TableHead>
                    {this.renderTableHeader()}
                </TableHead>
                : null}
                <TableBody>
                    {Object.keys(this.props.deviceSections[section].devices).map((mac, index) => {
                                let buttons = this.props.deviceSections[section].itemButtons.map((button, index) => {
                                    return (
                                        <ActionButton 
                                            key={mac+button.label}
                                            toolTip={button.toolTip} 
                                            label={button.label} 
                                            icon={button.icon}
                                            onButtonClick={(event) => button.onButtonClick(mac, event)}
                                        />
                                    )
                                })
                                                    
                            return <TasmotaDevice key={mac} macAddress={mac} renderType={this.props.displayMode} deviceManager={this.props.deviceManager} actionButtons={buttons}/>       
                        })
                    }
                </TableBody>
                </React.Fragment>
               )
            })}

            </Table>
        )
    }

    render() {
        return this.renderItems()
    }
}
export default DeviceList