import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Spin } from 'antd';

export const fbPermissions =
    'public_profile,email,pages_show_list,pages_messaging,manage_pages,ads_read,ads_management,pages_messaging_subscriptions';

export default class FacebookLogin extends React.Component {
    constructor(props) {
        super(props);
        this.fbLoginButton = null;
        this.widthController = null;
        this.state = {
            loggedIn: props.loggedIn,
        };
    }
    componentDidMount() {
        this.fbLoginButton.style.width = `${this.widthController.offsetWidth + 20}px`;
        const self = this;
        (function(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s);
            js.id = id;
            js.src = '//connect.facebook.net/en_US/sdk.js';
            fjs.parentNode.insertBefore(js, fjs);
        })(document, 'script', 'facebook-jssdk');
        window.fbAsyncInit = function() {
            window.FB.init({
                appId: window.SERVER_PARAMS.FACEBOOK_APP_ID,
                cookie: true, // enable cookies to allow the server to access the session
                xfbml: true, // parse social plugins on this page
                version: 'v3.1', // use version 3.1
            });
            window.FB.AppEvents.logPageView();
            window.FB.getLoginStatus(function(response) {
                self.statusChangeCallback(response);
            });
            window.FB.Event.subscribe('auth.login', self.statusChangeCallback);
            window.FB.Event.subscribe('auth.logout', self.statusChangeCallback);
            self.fbLoginButton.onclick = () =>
                window.FB.login(self.statusChangeCallback, {
                    scope: fbPermissions,
                });
        };
    }
    componentDidUpdate() {
        this.fbLoginButton.style.width = `${this.widthController.offsetWidth + 20}px`;
    }
    statusChangeCallback = res => {
        if (res.status === 'connected') {
            window.FB.api(`/${res.authResponse.userID}/permissions`, response => {
                if (
                    response &&
                    !response.error &&
                    this.checkPermissions(this.props.requiredPermissions, response.data)
                ) {
                    if(this.props.onLogin) this.props.onLogin(true, res.authResponse.accessToken);
                    this.props.loginFunction(res.authResponse.accessToken);
                }
            });
        } else {
            if(this.props.onLogin && res.authResponse) this.props.onLogin(false, res.authResponse.accessToken);
            this.props.logoutFunction();
        }
    };
    checkPermissions(string, data) {
        let result = true;
        const permissionsToCheck = string.split(',');
        if (data.length < permissionsToCheck.length) return false;
        const grantedPermissions = _.keyBy(data, 'permission');
        for (let i = 0; i < permissionsToCheck.length; i++) {
            const currentItem = grantedPermissions[permissionsToCheck[i]];
            if (!currentItem || currentItem.status !== 'granted')
                return false;
        }
        return result;
    };
    render() {
        const { additionalClassName, additionalWrapperClassName } = this.props;
        const { loggedIn } = this.props;
        const FBButtonClass = loggedIn ? 'h-disabled' : '';
        return (
            <div
                className={`fb-login-button-wrap ${additionalWrapperClassName || ''}`}
            >
                <div
                    className={`my-fb-login-button ${FBButtonClass} ${additionalClassName || ''}`}
                    ref={item => this.fbLoginButton = item}
                >
                    <span ref={item => this.widthController = item}>{
                        !loggedIn ?
                            loggedIn === null ?
                                <React.Fragment>
                                    <span className="fb-button-text">Establishing connection with Facebook</span>
                                    <Spin size="small" className="h-padding-l-5" />
                                </React.Fragment> :
                                <span className="fb-button-text login">Connect Facebook account</span> :
                            <span className="fb-button-text login">Connected with Facebook</span>
                    }</span>
                </div>
            </div>
        );
    }
}

FacebookLogin.defaultProps = {
    requiredPermissions: fbPermissions,
    logoutFunction: () => {},
};

FacebookLogin.propTypes = {
    loginFunction: PropTypes.func.isRequired,
    onLogin: PropTypes.func,
    logoutFunction: PropTypes.func,
    loggedIn: PropTypes.bool,
    additionalClassName: PropTypes.string,
    requiredPermissions: PropTypes.string,
};
