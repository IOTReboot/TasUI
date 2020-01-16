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

import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';


class ActionButton extends React.Component {

    render() {
        let display = this.props.icon
        if (this.props.selected) {
            display = this.props.selectedIcon
        }

        return (
            <Tooltip title={this.props.toolTip} style={{visibility: this.props.visibility ? this.props.visibility : "visible"}}>
                <IconButton aria-label={this.props.label} onClick={(event) => this.props.onButtonClick(event)}>
                    {display}
                </IconButton>
            </Tooltip>

        )
    }
}

export default ActionButton