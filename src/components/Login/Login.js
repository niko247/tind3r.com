// @flow
import API from 'utils/api';
import cx from 'classnames';
import React, { Component } from 'react';
import { EXT_ID } from 'const';
import './Login.scss';


type PropsType = {
    children?: React.Element<*>,
    onClick: () => void,
    handleSmsConnect: () => void,
}


class Login extends Component {
  state = {
    phoneProvidedAndConfirmed: false,
    phoneNumber: '',
    smsCode: '',
  };
  props: PropsType;

  handlePhoneKeyUp = (e) => {
    e.target.value = e.target.value.replace(/[^\d]/g, '');
    this.setState({ phoneNumber: e.target.value });
  };


  handleSmsKeyUp = (e) => {
    e.target.value = e.target.value.replace(/[^\d]/g, '');
    this.setState({ smsCode: e.target.value });
  };


  catchErrors = (error) => {
    console.log('Error: ', error);
    alert('Error, see console logs for more details');
  };

  handlePhoneNumber = () => {
    const phoneNumber = this.phoneInputRef.value;
    this.tokenLessPost('/v3/auth/login?locale=en', { phone_number: phoneNumber }).then(() => {
      this.setState({ phoneProvidedAndConfirmed: true, phoneNumber });
    }).catch(this.catchErrors);

    this.phoneInputRef.value = '';
  };

  tokenLessPost=(url, params) => API.post(url, params, false);

  handleSmsCode = () => {
    this.validateSms().then(({ data }) => {
      this.loginViaSms(data).then(this.processTinderToken()).catch(this.catchErrors);
    }).catch(this.catchErrors);
    this.smsInputRef.value = '';
  };

  processTinderToken() {
      console.log("processing token");
    return ({ data }) => {
      chrome.runtime.sendMessage(EXT_ID(), {
        type: 'SAVE_SMS_TOKEN',
        token: data.data.api_token,
      }, () => {
        this.setState({ phoneProvidedAndConfirmed: false });
        this.props.handleSmsConnect();
      });
    };
  }

  loginViaSms(data) {
    return this.tokenLessPost('/v2/auth/login/sms?locale=en',
            { refresh_token: data.data.refresh_token, phone_number: this.state.phoneNumber });
  }

  validateSms() {
    return this.tokenLessPost('/v2/auth/sms/validate?auth_type=sms&locale=en', {
      otp_code: this.smsInputRef.value,
      phone_number: this.state.phoneNumber,
      is_update: false,
    });
  }

  phoneInputRef: ?HTMLElement;
  smsInputRef: ?HTMLElement;

  renderPhoneWrappers() {
    if (this.state.phoneProvidedAndConfirmed) {
      return (
        <div>
          <div>
            <input
              type="text"
              onChange={this.handleSmsKeyUp}
              onInput={this.handleSmsKeyUp}
              ref={(ref) => {
                this.smsInputRef = ref;
              }}
              placeholder="Code you received in SMS"
              className="pt-input pt-intent-primary"
            />
          </div>
          <div
            className={cx('login__facebook--before',
                            { 'login__facebook--before-inactive': this.state.smsCode.length === 0 })}
          >
            <i className="fa fa-check-square" />
          </div>
          <button
            disabled={this.state.smsCode.length === 0}
            onClick={this.handleSmsCode}
            className={cx('login__facebook', {
              'login__facebook-inactive':
                                this.state.smsCode.length === 0,
            })}
          >Confirm sms code
          </button>
        </div>
      );
    }
    return (
      <div>
        <div>
          <h2>+</h2><input
            type="text"
            onChange={this.handlePhoneKeyUp}
            onInput={this.handlePhoneKeyUp}
            ref={(ref) => {
              this.phoneInputRef = ref;
            }}
            placeholder="Phone number with country prefix"
            className="pt-input pt-intent-primary"
          />
        </div>
        <div className={cx('login__facebook--before',
                    { 'login__facebook--before-inactive': this.state.phoneNumber.length === 0 })}
        >
          <i className="fa fa-phone" />
        </div>
        <button
          disabled={this.state.phoneNumber.length === 0}
          onClick={this.handlePhoneNumber}
          className={cx('login__facebook', {
            'login__facebook-inactive':
                            this.state.phoneNumber.length === 0,
          })}
        >Login with phone number
        </button>
      </div>
    );
  }

  render() {
    return (<div className="login">
      <div className="login__wrapper">
        {this.props.children && <div className="login__text">{this.props.children}</div>}
        <div className="login__facebook--before">
          <i className="fa fa-facebook" />
        </div>
        <button onClick={this.props.onClick} className="login__facebook">Continue with Facebook</button>
      </div>
      <div className="login__wrapper login__wrapper-phone">
        {this.props.children && <div className="login__text">{this.props.children}</div>}
        {this.renderPhoneWrappers()}

      </div>
    </div>);
  }

}

export default Login;
