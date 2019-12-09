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
                                <CommandDisplay commandName={commandName} command={command} deviceConnector={this.props.deviceConnector} />
                            )
                        })}
                    </Box>
                </ExpansionPanelDetails>
            </ExpansionPanel>
        )
    }

}


export default CommandGroup