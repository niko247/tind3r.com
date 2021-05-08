import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch,
} from 'react-router-dom';
import { VERSION } from 'const';
import Loader from 'components/Loader';

import { checkIfInstalled, getTokenDate, getFacebookToken, checkVersion } from 'utils/runtime';
import LS from 'utils/localStorage';

import Welcome from '../Welcome';
import Logged from '../Logged';

import '../../styles/globals.scss';

class App extends Component {
  state = {
    isInstalled: null,
    isOutdated: false,
    isFirstLogin: !LS.data.lastActivity,
  }

  componentDidMount() {
    console.log("Checking if installed");
    checkIfInstalled((isInstalled) => {
      this.setState({ isInstalled });

      if (!isInstalled) {
        return;
      }

      checkVersion((ver) => {
        if (ver !== VERSION) {
          this.setState({
            isOutdated: true,
          });
        }
      });
    });
  }

  checkLogged = () => {
    getTokenDate((date) => {
      if (date) {
        window.onfocus = n => n;
        this.setState({ isFirstLogin: false });
      }
    });
  }

  handleConnect = () => {
    getFacebookToken();

    window.onfocus = this.checkLogged;
  }
  handleSmsConnect = () => {
    this.checkLogged();
  }

  render() {
    const { isInstalled, isFirstLogin, isOutdated } = this.state;
    if (isInstalled && !isOutdated) {
      if (isFirstLogin) {
        return (
          <Welcome handleConnect={this.handleConnect} handleSmsConnect={this.handleSmsConnect} isInstalled={isInstalled} />
        );
      }

      return (
        <Router>
          <Switch>
            <Route path="/" component={Logged} />
          </Switch>
        </Router>
      );
    } else if (isInstalled === false) {
      return (
        <Welcome handleConnect={this.handleConnect} isInstalled={isInstalled} />
      );
    } else if (isOutdated) {
      return (
        <Welcome handleConnect={this.handleConnect} isOutdated={isOutdated} isInstalled={isInstalled} />
      );
    }

    return <Loader />;
  }
}

export default App;
