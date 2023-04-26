import superagent from 'superagent';
import superagentAbsolute from 'superagent-absolute';
import notificationHandler from './notificationHandler';
import store from '../store/index';

// const rawToken = localStorage.getItem('app-login-token');
// // eslint-disable-next-line operator-linebreak
// const token =
//   rawToken != null ? `${rawToken}`.substr(10, rawToken.length - 12) : '';

// let agent = superagent.agent();
// agent.on('error', (err) => {
//   notificationHandler(err);
// });

// agent = agent.set('Content-Type', 'application/json');
// agent = agent.set('authorization', `Bearer ${token}`);
// agent = agent.type('json');

// const request = superagentAbsolute(agent)(`${process.env.REACT_APP_API_LINK}`);

export default function getAgentInstance(noAuth = false) {
  let agent = superagent.agent();
  agent.on('error', (err) => {
    notificationHandler(err);
  });
  const rawToken = localStorage.getItem('app-login-token');
  // eslint-disable-next-line operator-linebreak
  const token =
    rawToken != null ? `${rawToken}`.substr(10, rawToken.length - 12) : '';

  agent = agent.set('Content-Type', 'application/json');

  if (noAuth) {
  } else {
    agent = agent.set(
      'authorization',
      `Bearer ${store.tokenStore.value || token}`
    );
  }

  agent = agent.type('json');

  const request = superagentAbsolute(agent)(
    `${process.env.REACT_APP_API_LINK}`
  );
  return request;
}
