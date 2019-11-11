import React from 'react'
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import TextField from '@material-ui/core/TextField';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import SettingsApplicationsIcon from '@material-ui/icons/SettingsApplications';
import DeleteIcon from '@material-ui/icons/Delete'
import DashboardIcon from '@material-ui/icons/Dashboard';
import ListIcon from '@material-ui/icons/List';
import TableChartIcon from '@material-ui/icons/TableChart';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import HealingIcon from '@material-ui/icons/Healing';
import SystemUpdateAltIcon from '@material-ui/icons/SystemUpdateAlt';
import WifiIcon from '@material-ui/icons/Wifi';
import SettingsInputAntennaIcon from '@material-ui/icons/SettingsInputAntenna';


import TasmotaDevice from '../DeviceTypes/TasmotaDevice';

class Devices extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            devices: this.props.deviceManager.getDevices(),
            displayMode: "List",
        }
    }

    openDeviceDetails = (macAddress, event) => {
        event.stopPropagation();
        this.props.history.push('/devices/' + macAddress);
    }

    deleteDevice = (macAddress, event) => {
        event.stopPropagation();
        this.props.deviceManager.removeDevice(macAddress);
        const newDevices = this.props.deviceManager.getDevices();
        this.setState({
            devices: newDevices
        });
    }

    renderItems() {
        switch ( this.state.displayMode) {
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

        return Object.keys(this.state.devices).map((mac, index) => {
            let buttons = (
                <div>
                    {this.renderButton("Details", "details", () => this.openDeviceDetails(mac, event), <SettingsApplicationsIcon />)}
                    {this.renderButton("Delete", "delete", () => this.deleteDevice(mac, event), <DeleteIcon />)}
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
        return Object.keys(this.state.devices).map((mac, index) => {
            return (
                <TasmotaDevice macAddress={mac} renderType={this.state.displayMode} deviceManager={this.props.deviceManager}/>
            )
        })
    }

    renderTableHeaderStatus() {
        return (
            <TableRow>
                <TableCell>Friendly Name</TableCell>
                <TableCell>Actions</TableCell>
                <TableCell>Module</TableCell>
                <TableCell>Power</TableCell>
                <TableCell>Dimmer</TableCell>
                <TableCell>LoadAvg</TableCell>
                <TableCell>Uptime</TableCell>
          </TableRow>
        )
    }


    renderTableHeaderHealth() {
        return (
            <TableRow>
                <TableCell>Friendly Name</TableCell>
                <TableCell>Actions</TableCell>
                <TableCell>Uptime</TableCell>
                <TableCell>Boot Count</TableCell>
                <TableCell>Restart Reason</TableCell>
                <TableCell>LoadAvg</TableCell>
                <TableCell>Sleep</TableCell>
                <TableCell>MqttCount</TableCell>
                <TableCell>LinkCount</TableCell>
                <TableCell>Downtime</TableCell>
                <TableCell>RSSI</TableCell>
          </TableRow>
        )
    }


    renderTableHeaderFirmware() {
        return (
            <TableRow>
                <TableCell>Friendly Name</TableCell>
                <TableCell>Actions</TableCell>
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
                <TableCell>Actions</TableCell>
                <TableCell>Hostname</TableCell>
                <TableCell>Mac Address</TableCell>
                <TableCell>IP Address</TableCell>
                <TableCell>Gateway</TableCell>
                <TableCell>SSID</TableCell>
                <TableCell>BSSID</TableCell>
                <TableCell>Channel</TableCell>
                <TableCell>RSSI</TableCell>
                <TableCell>Link Count</TableCell>
                <TableCell>Downtime</TableCell>
          </TableRow>
        )
    }


    renderTableHeaderMqtt() {
        return (
            <TableRow>
                <TableCell>Friendly Name</TableCell>
                <TableCell>Actions</TableCell>
                <TableCell>Mqtt Host</TableCell>
                <TableCell>Mqtt Port</TableCell>
                <TableCell>Mqtt Client</TableCell>
                <TableCell>Topic</TableCell>
                <TableCell>Group Topic</TableCell>
          </TableRow>
        )
    }
    renderTableHeader() {
        console.log(this.state.displayMode)
        switch (this.state.displayMode) {
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

            <Table aria-label="simple table">
            <TableHead>
                {this.renderTableHeader()}
            </TableHead>
            <TableBody>
                {Object.keys(this.state.devices).map((mac, index) => {
                            let buttons = (
                                <div>
                                    {this.renderButton("Details", "details", () => this.openDeviceDetails(mac, event), <SettingsApplicationsIcon />)}
                                    {this.renderButton("Delete", "delete", () => this.deleteDevice(mac, event), <DeleteIcon />)}
                                </div>
                            )    
                    
                        return <TasmotaDevice macAddress={mac} renderType={this.state.displayMode} deviceManager={this.props.deviceManager} actionButtons={buttons}/>       
                    })
                }
            </TableBody>
            </Table>
        )
    }
    
    renderButton(toolTip, label, onclick, icon, selectedStateName = null, selectedIcon) {

        if (selectedStateName) {
            if (this.state[selectedStateName]) {
                icon = selectedIcon
            }
        }

        return (
            <Tooltip title={toolTip}>
                <IconButton aria-label={label} onClick={() => onclick()}>
                    {icon}
                </IconButton>
            </Tooltip>

        )        
    }

    render() {
        let dashboardIcon = this.state.displayMode === "Card" ? <DashboardIcon color="primary" /> : <DashboardIcon />
        let listIcon = this.state.displayMode === "List" ? <ListIcon color="primary" /> : <ListIcon />
        let statusIcon = this.state.displayMode === "Table_Status" ? <TableChartIcon color="primary" /> : <TableChartIcon />
        let healthIcon = this.state.displayMode === "Table_Health" ? <HealingIcon color="primary" /> : <HealingIcon />
        let tableWifi = this.state.displayMode === "Table_WIFI" ? <WifiIcon color="primary" /> : <WifiIcon />
        let tablemqtt = this.state.displayMode === "Table_Mqtt" ? <SettingsInputAntennaIcon color="primary" /> : <SettingsInputAntennaIcon />
        let tablefirmware = this.state.displayMode === "Table_Firmware" ? <SystemUpdateAltIcon color="primary" /> : <SystemUpdateAltIcon />

    return (
        <Container flexGrow={1}>
            <Box display="flex" flexDirection="row" alignItems="baseline">
                <h1>Devices</h1>
                <Box display="flex" flexGrow={1} justifyContent="flex-start">
                    {this.renderButton("Card View", "card", () => this.setState({ displayMode: "Card"}), dashboardIcon)}
                    {this.renderButton("List View", "list", () => this.setState({ displayMode: "List"}), listIcon)}
                    {this.renderButton("Status View", "status", () => this.setState({ displayMode: "Table_Status"}), statusIcon)}
                    {this.renderButton("Health View", "health", () => this.setState({ displayMode: "Table_Health"}), healthIcon)}
                    {this.renderButton("Firmware View", "firmware", () => this.setState({ displayMode: "Table_Firmware"}), tablefirmware)}
                    {this.renderButton("Wifi View", "wifi", () => this.setState({ displayMode: "Table_WIFI"}), tableWifi)}
                    {this.renderButton("Mqtt View", "MQTT", () => this.setState({ displayMode: "Table_Mqtt"}), tablemqtt)}
                </Box>
            </Box>
            
            {
                this.renderItems()
            }
        </Container>
    );
  }
}
export default Devices