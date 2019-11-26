import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import DeveloperBoardIcon from '@material-ui/icons/DeveloperBoard';
import InfoIcon from '@material-ui/icons/Info';
import FavoriteIcon from '@material-ui/icons/Favorite';
import SearchIcon from '@material-ui/icons/Search';

import { Route, Link, Switch, HashRouter as Router, Redirect } from 'react-router-dom';

import Devices from './Components/Devices';
import DeviceManager from './DeviceManagement/DeviceManager';
import DeviceDetails from './Components/DeviceDetails';
import DeviceSettings from './Components/DeviceSettings';
import FindDevices from './Components/FindDevices';
import Console from './Components/Console'
import AppConfig from './Configuration/AppConfig'

const drawerWidth = 240;

const styles = theme => ({
  root: {
    display: 'flex',
    flexBasis: "100%",
    flexGrow: 0,
    flexShrink: 1,
    height: "100vh",
    overflow: "hidden",
  },
  appBar: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  title: {
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(0.5),
    '&:hover': {
      color: theme.palette.primary.main,
    },
  },
  toolbar: {
    ...theme.mixins.toolbar,
    paddingLeft: theme.spacing(3),
    display: 'flex',
    // flexGrow: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  content: {
    flexBasis: "100%",
    flexGrow: 1,
    flexShrink: 1,
    height: "100vh",
    justifyContent: "center",
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(3),
    overflow: "hidden",
  },
  nested: {
    paddingLeft: theme.spacing(4),
  },
});

const deviceGroups = [
  {
  //   name: 'All',
  //   link: '/devices/all',
  //   icon: <BorderAllIcon/>,
  // }, {
  //   name: 'Favourites',
  //   link: '/devices/favs',
  //   icon: <FavoriteIcon/>,
  }  
]

const mainMenuItems = [
  {
    name: 'Devices',
    link: '/devices',
    icon: <DeveloperBoardIcon/>,
    // children: deviceGroups,
  }, {
    name: 'Discover Devices',
    link: '/findDevices',
    icon: <SearchIcon/>,
  }, {
    name: 'About',
    link: '/about',
    icon: <InfoIcon/>,
  }
]

const deviceManager = new DeviceManager();

class App extends Component {

  constructor(props) {
    super(props)
    this.appConfig = new AppConfig()
  }

  renderChildItems(item) {
    const { classes } = this.props;

    if (item.children && item.children.length > 0) {
      return item.children.map((child, index) => {
        return(
          <Link to={child.link}>
            <ListItem button key={child.name} className={classes.nested}>
              <ListItemIcon>{child.icon}</ListItemIcon>
              <ListItemText primary={child.name} />
            </ListItem>  
          </Link>
        )
      })
    } 
  }


  render() {
    const { classes } = this.props;

    const listItems = mainMenuItems.map((item, index) => {
      return (
        <div>
        <Link to={item.link} key={item.link} >
          <ListItem button key={item.name}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.name} />
          </ListItem>
        </Link>

        {this.renderChildItems(item)}
        <Divider />
        </div>
      )
    });


    return (
      <div className={classes.root}>
        <Router>
        <CssBaseline />
        <AppBar position="fixed" className={classes.appBar}>
          <Toolbar>
            <Typography variant="h6" noWrap>
              IOTReboot
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer
          className={classes.drawer}
          variant="permanent"
          classes={{
            paper: classes.drawerPaper,
          }}
          anchor="left"
        >
          <div className={classes.toolbar} >
            <Typography variant="h6" noWrap className={classes.title}>
                IOTReboot UI
            </Typography>
            <Typography variant="subtitle2" noWrap>
                v0.0.1
            </Typography>
          </div>
          <Divider />
          <List>
            {listItems}
          </List>
        </Drawer>
          <main className={classes.content}>
            <div className={classes.toolbar} />
              <div>
            <Switch className={classes.content}>
              <Route exact path="/findDevices" render={(props) => <FindDevices {...props} deviceManager={deviceManager} appConfig={this.appConfig} />} />
              <Route exact path="/devices" render={(props) => <Devices {...props} deviceManager={deviceManager} appConfig={this.appConfig} />} />
              <Route path="/details/:mac" render={(props) => <DeviceDetails {...props} deviceManager={deviceManager} appConfig={this.appConfig} />} />
              <Route path="/settings/:mac" render={(props) => <DeviceSettings {...props} deviceManager={deviceManager} appConfig={this.appConfig} />} />
              <Route path="/console/:mac" render={(props) => <Console {...props} deviceManager={deviceManager} appConfig={this.appConfig} />} />
              {/* <Route render={(props) => <Devices {...props} deviceManager={deviceManager} />} /> */}
              <Redirect exact from="/" to="/devices" />
            </Switch>
            </div>
          </main>
        </Router>
      </div>
    );
  }
}

export default withStyles(styles)(App)