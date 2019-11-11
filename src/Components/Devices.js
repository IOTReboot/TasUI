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

            case "Table" :
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

    renderTypeTable() {
        return (

            <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Friendly Name</TableCell>
                <TableCell align="right">Actions</TableCell>
                <TableCell align="right">Module</TableCell>
                <TableCell align="right">Power</TableCell>
                <TableCell align="right">Dimmer</TableCell>
                <TableCell align="right">LoadAvg</TableCell>
                <TableCell align="right">Uptime</TableCell>
              </TableRow>
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
        let tableIcon = this.state.displayMode === "Table" ? <TableChartIcon color="primary" /> : <TableChartIcon />
        let listIcon = this.state.displayMode === "List" ? <ListIcon color="primary" /> : <ListIcon />
    return (
        <Container flexGrow={1}>
            <Box display="flex" flexDirection="row" alignItems="baseline">
                <h1>Devices</h1>
                <Box display="flex" flexGrow={1} justifyContent="flex-end">
                    {this.renderButton("Card View", "card", () => this.setState({ displayMode: "Card"}), dashboardIcon)}
                    {this.renderButton("Table View", "table", () => this.setState({ displayMode: "Table"}), tableIcon)}
                    {this.renderButton("List View", "list", () => this.setState({ displayMode: "List"}), listIcon)}
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