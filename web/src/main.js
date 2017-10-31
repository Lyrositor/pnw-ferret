// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import VueCookies from 'vue-cookies';
import Vuex from 'vuex';
import App from './App';
import router from './router';
import auth from './utils/auth';

Vue.config.productionTip = false;

Vue.use(VueCookies);
Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    currentNationId: undefined
  },
  getters: {
    currentNationId (state) {
      return state.currentNationId;
    }
  },
  mutations: {
    setCurrentNationId (state, payload) {
      state.currentNationId = payload.nationId;
    }
  }
});

Vue.mixin(auth);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  template: '<App/>',
  components: { App }
});
