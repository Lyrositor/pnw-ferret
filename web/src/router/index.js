import Vue from 'vue';
import Router from 'vue-router';
import Alliance from '@/components/Alliance';
import Alliances from '@/components/Alliances';
import Home from '@/components/Home';
import Login from '@/components/Login';
import Nation from '@/components/Nation';
import Nations from '@/components/Nations';
import Profile from '@/components/Profile';
import Statistics from '@/components/Statistics';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/login/',
      name: 'Login',
      component: Login
    },
    {
      path: '/profile/',
      name: 'Profile',
      component: Profile
    },
    {
      path: '/stats/',
      name: 'Statistics',
      component: Statistics
    },
    {
      path: '/alliance/id=:id',
      name: 'Alliance',
      component: Alliance
    },
    {
      path: '/alliances/',
      name: 'Alliances',
      component: Alliances
    },
    {
      path: '/nation/id=:id',
      name: 'Nation',
      component: Nation
    },
    {
      path: '/nations/',
      name: 'Nations',
      component: Nations
    }
  ]
});
