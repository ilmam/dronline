/* eslint-disable max-classes-per-file */
import { observable } from 'mobx';
import { persist, create } from 'mobx-persist';

class Sections {
  @persist('list') @observable value = [];

  @observable clear() {
    this.value = [];
  }
}
class Token {
  @persist @observable value = '';

  @observable clear() {
    this.value = '';
  }
}
class User {
  @persist('object') @observable value = {};

  @observable clear() {
    this.value = {};
  }
}

// const store = (window.store = new Store());
const userStore = new User();
const tokenStore = new Token();
const sectionsStore = new Sections();
const hydrate = create({
  storage: localStorage,
  jsonify: true,
});
hydrate('app-user', userStore).then(() => {});
hydrate('app-login-token', tokenStore).then(() => {});
hydrate('app-sections', sectionsStore).then(() => {});

export default {
  userStore,
  tokenStore,
  sectionsStore,
};
