import React from 'react';
import _ from 'lodash';
import { Button, Input, Select, notification } from 'antd';
import './App.css';
import FacebookLogin from './components/FacebookLogin';
import SafeFetch from './fetch';


const REQUIRED_FB_PERMISSIONS = 'pages_messaging_subscriptions';
const FB_API_URL = 'https://graph.facebook.com/v3.2/';
const safeFetch = new SafeFetch();


const fetchFbPages = async ({ loggedIn, token }, onFetch) => {
  const requestLink = `${FB_API_URL}me/accounts?limit=200&access_token=${token}`;
  const res = await safeFetch.get(requestLink);
  onFetch(_.filter(res.data, page => _.indexOf(page.tasks, 'MANAGE') !== -1));
};


export function copyToClipboard(text, customMessage) {
  const textArea = document.createElement('textarea');

  textArea.style.position = 'fixed';
  textArea.style.top = 0;
  textArea.style.left = 0;
  textArea.style.width = '2em';
  textArea.style.height = '2em';
  textArea.style.padding = 0;
  textArea.style.border = 'none';
  textArea.style.outline = 'none';
  textArea.style.boxShadow = 'none';
  textArea.style.background = 'transparent';
  textArea.value = text;

  document.body.appendChild(textArea);
  textArea.select();

  try {
    document.execCommand('copy');
    notification.info({
      message: 'Copied',
      placement: 'bottomRight',
      description: customMessage || `Text successful copied: ${text}`,
    });
  } catch (err) {
    notification.error({
      message: 'Error',
      placement: 'bottomRight',
      description: 'Unable to copy text.',
    });
  }

  document.body.removeChild(textArea);
}


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: false,
      token: '',
      pages: [],
      selectedPage: null,
    };
  }

  render() {
    return (
        <div className="App">
          <header className="App-header">
            <img src="/logo.png" className="App-logo" alt="logo" />
            <div style={{ minHeight: 150 }}>
              <div
                  className="App-link"
                  style={{ marginBottom: 10 }}
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
              <div style={{ marginBottom: 10 }}>
                {this.state.loggedIn ? (
                      <Select
                          style={{ width: 300 }}
                          value={_.get(this.state.selectedPage, 'id', null)}
                          onChange={bot_id => this.setState({ selectedPage: _.find(this.state.pages, { id: bot_id }) })}
                      >
                        {this.state.pages.map(page => (
                            <Select.Option
                                key={page.id}
                                value={page.id}
                            >
                              {page.name}
                            </Select.Option>
                        ))}
                      </Select>
                ) : null}
              </div>
              <div>
                {this.state.selectedPage ? (
                    <Input.Group compact>
                      <Button
                          ghost
                          onClick={() => copyToClipboard(this.state.selectedPage.id)}
                      >
                        Copy bot ID
                      </Button>
                      <Button
                          ghost
                          onClick={() => copyToClipboard(this.state.selectedPage.name)}
                      >
                        Copy bot Name
                      </Button>

                      <Button
                          ghost
                          onClick={() => copyToClipboard(this.state.selectedPage.access_token)}
                      >
                        Copy bot Access Token
                      </Button>
                    </Input.Group>
                ) : null}
              </div>
            </div>
          </header>
        </div>
    );
  }
}

export default App;
