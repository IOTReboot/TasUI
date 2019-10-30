import { Box, Grid, Paper } from '@material-ui/core';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography';
import DeleteIcon from '@material-ui/icons/Delete';
import DeveloperBoardIcon from '@material-ui/icons/DeveloperBoard';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import React, { Component } from 'react';
import Svg from 'react-inlinesvg';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

class TasmotaDevice extends Component {

    deviceConnector = {};
    ipAddress = "";

    constructor(props) {
        super(props);
        console.log('TasmotaDevice constructor %O', this.props)
        this.ipAddress = this.props.ipAddress;
        this.deviceConnector = this.props.deviceManager.getDeviceConnector(this.ipAddress);
        this.state = {
            displayName: this.ipAddress,
            status0: '',
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
            status0: response.data,
        })
    }

    renderTypeList() {
        return(
            <div style={{ width: '100%' }}>
                <Box display="flex">
                    <DeveloperBoardIcon/>
                    <Box flexGrow={1} marginLeft={2} onClick={() => this.props.openDeviceDetails(this.ipAddress)}>
                        <Typography>
                        {this.state.displayName}
                        </Typography>
                    </Box>

                    <DeleteIcon/>
                </Box>
            </div>
        )
    }

    renderDetailsImage() {
        return (
            <Svg src="https://raw.githubusercontent.com/arendst/Tasmota/development/tools/logo/TASMOTA_Symbol_Vector.svg" width="90%" height="90%" padding="20"/>
        )
    }

    renderDetailsStatuses() {
        return Object.entries(this.state.status0).map(([cmnd, cmndData]) => {
            
            return (
                <ExpansionPanel key={cmnd}>
                    <ExpansionPanelSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                    >
                    <Typography>{cmnd}</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                    <Table aria-label="simple table">
                        <TableHead>
                            <TableRow>
                            <TableCell>Key</TableCell>
                            <TableCell>Value</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                        {Object.entries(cmndData).map(([key, value]) => {
                            return (
                                <TableRow key={key}>
                                    <TableCell align="left">{key}</TableCell>
                                    <TableCell align="left">{JSON.stringify(value)}</TableCell>
                                </TableRow>
                            )
                        })}
                        </TableBody>
                    </Table>
                    </ExpansionPanelDetails>
                </ExpansionPanel>
            )
            

        })
    }

    renderTypeDetails() {
        return(
            <Paper>
            <Grid container justify="center" alignItems="center" direction="column" flexGrow={0} xs={12}>
                {/* <Box display="flex"> */}
                <Grid margin={20} xs={4}>
                    <Paper width="200" height="200" align="center" padding="20" elevation={3}>
                        {this.renderDetailsImage()}
                    </Paper>
                </Grid>
                <Grid xs={6}>
                    <Paper>
                        <Typography>
                            {this.state.displayName}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid padding="20" margin={20} spacing={20} xs={6}>
                    {this.renderDetailsStatuses()}
                </Grid>
                    <DeleteIcon/>
                {/* </Box> */}
            </Grid>
            </Paper>
        )
    }

    render() {
        console.log('TasmotaDevice ' + this.props['renderType'])
        switch(this.props['renderType']) {
            case 'List':
                return this.renderTypeList();
                break

            case 'Details':
                return this.renderTypeDetails();
                break

            default:
                return (
                    <Typography>
                        Default RenderType : {this.state.displayName}
                    </Typography>
                )
                break
        }
    }
}

export default TasmotaDevice;