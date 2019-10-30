import { withStyles, ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { green, blue } from '@material-ui/core/colors';
import { Box, Grid, Paper, Container, Button, Slider } from '@material-ui/core';
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

const styles = theme => ({
    imageContainer: {
        padding: theme.spacing(2),
        height: 200,
        width: 200,
    }, 
    root: {
        padding: theme.spacing(3, 2),
        margin: theme.spacing(2),
    },
    detailsContainer: {
        padding: theme.spacing(2),
        margin: theme.spacing(2),
    },
})

const onButtonTheme = createMuiTheme({
    palette: {
      primary: blue,
    },
  });

const powerRegex = RegExp('POWER\D*')
const dimmerRegex = RegExp('Dimmer\D*')


const DimmerSlider = withStyles({
    root: {
      color: '#52af77',
      height: 8,
      width: 300
    },
    thumb: {
      height: 24,
      width: 24,
      backgroundColor: '#fff',
      border: '2px solid currentColor',
      marginTop: -8,
      marginLeft: -12,
      '&:focus,&:hover,&$active': {
        boxShadow: 'inherit',
      },
    },
    active: {},
    valueLabel: {
      left: 'calc(-50% + 4px)',
    },
    track: {
      height: 8,
      borderRadius: 4,
    },
    rail: {
      height: 8,
      borderRadius: 4,
    },
  })(Slider);

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

    powerToggle(button) {
        console.log('Toggle power ' + button)
        this.deviceConnector.performCommandOnDevice(button + ' TOGGLE');
        this.deviceConnector.getStatus0();
    }

    dimmerUpdate = (input) => (event, newValue) => {
        console.log('Dimmer id : %O, value %O newValue %O', input, event, newValue);
        this.deviceConnector.performCommandOnDevice(input + ' ' + newValue);
        this.deviceConnector.getStatus0();
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

    renderDetailsControlsButtons() {
        let buttons =  Object.entries(this.state.status0['StatusSTS']).filter(([key, value]) => {
            if (powerRegex.test(key)) {
                return [key, value];
            }
        })

        console.log('DetailsControls buttons : %O', buttons)

        return buttons.map(([key, value]) => {
            if (value === 'ON') {
                return (
                    <ThemeProvider theme={onButtonTheme}>
                        <Button variant="contained" color="primary" onClick={() => this.powerToggle(key)}>{key} {value}</Button>
                    </ThemeProvider>
                )
            } else {
                return (
                    <Button variant="contained" onClick={() => this.powerToggle(key)}>{key} {value}</Button>
                )
            }
        })
    }

    renderDetailsControlsDimmers() {
        let dimmers =  Object.entries(this.state.status0['StatusSTS']).filter(([key, value]) => {
            if (dimmerRegex.test(key)) {
                return [key, value];
            }
        })

        console.log('DetailsControls dimmers : %O', dimmers)

        return dimmers.map(([key, value]) => {
            return (
                <div className={styles.imageContainer}>
                    <DimmerSlider
                        defaultValue={value}
                        id={key}
                        aria-labelledby={key + 'slider'}
                        valueLabelDisplay="auto"
                        step={1}
                        min={1}
                        max={100}
                        onChangeCommitted={this.dimmerUpdate(key)}
                    />
                    <Typography id={key + 'slider'} gutterBottom variant="h5" justify="center">
                        {key} : {value}
                    </Typography>

                </div>
            )
        })
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
            <Grid container justify="center" alignItems="center" direction="column" width="sm" xs={12}>
                <Grid margin={20} className={styles.detailsContainer} >
                    <Container fixed className={styles.imageContainer}>
                        {this.renderDetailsImage()}
                    </Container>
                </Grid>
                <Grid xs={12} className={styles.detailsContainer} >
                    <Typography variant="h5">
                        {this.state.displayName}
                    </Typography>
                </Grid>
                <Grid xs={12} width="sm">
                    {this.renderDetailsControlsDimmers()}
                </Grid>
                <Grid xs={12}>
                    {this.renderDetailsControlsButtons()}
                </Grid>

                <Grid xs={6}>
                    {this.renderDetailsStatuses()}
                </Grid>
                    <DeleteIcon/>
            </Grid>
        )
    }

    render() {
        if (!this.state.status0) {
            return null
        }
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

export default withStyles(styles)(TasmotaDevice);