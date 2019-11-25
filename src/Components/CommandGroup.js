import React from 'react'
import CommandDisplay from './CommandDisplay'
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography'

class CommandGroup extends React.Component {

    render() {
        return (

            <ExpansionPanel key={`CommandGroup-`} TransitionProps={{ unmountOnExit: true, mountOnEnter: true }}>
                <ExpansionPanelSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                >
                <Typography>{`${this.props.commandGroupName} ${this.props.groupType}`}</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    <Box display="flex" flexDirection="column" flexGrow={1}>
                        {Object.entries(this.props.commandGroup).map(([commandName, command]) => {
                            return (
                                <CommandDisplay commandName={commandName} command={command} deviceConnector={this.props.deviceConnector}/>
                            )
                        })}
                    </Box>
                </ExpansionPanelDetails>
            </ExpansionPanel>
        )
    }

}


export default CommandGroup