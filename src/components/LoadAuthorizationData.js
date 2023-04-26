import store from '../store/index';

export default () => {
  const { userStore } = store;
  const authorizationData = {
    UIFlags: userStore.value.role_data
      ? userStore.value.role_data.UIFlags || {}
      : {},
  };

  return authorizationData;
};
