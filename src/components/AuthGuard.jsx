import React from 'react';
import { observer, inject } from 'mobx-react';
import LoginManager from './login/LoginManager';
// import SecretaryLogin from './login/SecretaryLogin';

@observer
@inject('tokenStore')
class AuthGuard extends React.Component {
  render() {
    const { children, tokenStore } = this.props;
    if (`${tokenStore.value}`.trim() !== '') {
      return children;
    }
    return <LoginManager to={children} />;
  }
}

export default AuthGuard;
