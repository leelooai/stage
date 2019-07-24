import React from 'react';
import _ from 'lodash';
import logo from './logo.svg';
import './App.css';
import FacebookLogin from './components/FacebookLogin';
import SafeFetch from './fetch';


const REQUIRED_FB_PERMISSIONS = 'pages_messaging_subscriptions';
const FB_API_URL = 'https://graph.facebook.com/v3.2/';
const safeFetch = new SafeFetch();


const fetchFbPages = async ({ loggedIn, token }, onFetch) => {
  const requestLink = `${FB_API_URL}me/accounts?limit=200&access_token=${token}`;
  const res = await safeFetch.get(requestLink);
  const pages = JSON.parse(res).data;
  onFetch(_.filter(pages, page => _.indexOf(page.tasks, 'MANAGE') !== -1));
};


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: false,
      token: '',
      pages: [],
    };
  }

  render() {
    return (
        <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <p>
              Edit <code>src/App.js</code> and save to reload.
            </p>
            <div
                className="App-link"
            >
              <FacebookLogin
                  requiredPermissions={REQUIRED_FB_PERMISSIONS}
                  additionalWrapperClassName="fb-button-margin-0 h-display-inline-block"
                  additionalClassName="h-margin-0"
                  loggedIn={this.state.loggedIn}
                  loginFunction={token => this.setState({ token, loggedIn: true })}
                  onLogin={(loggedIn, token) => {
                    fetchFbPages({ loggedIn, token }, pages => this.setState({ pages }));
                  }}
              />
            </div>
          </header>
        </div>
    );
  }
}

export default App;
