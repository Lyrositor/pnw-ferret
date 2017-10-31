<template>
  <div id="app">
    <header v-if="!maintenance">
      <div id="profile-box">
        <router-link :to="'/nation/id=' + currentNationId" v-if="currentNationId">My Nation</router-link>
        <router-link to="/profile/" v-if="currentNationId">Profile</router-link>
        <router-link to="/login/" v-if="!currentNationId">Login</router-link>
        <a @click="logout()" v-if="currentNationId">Logout</a>
      </div>
      <h1><router-link to="/">Ferret</router-link></h1>
    </header>
    <nav v-if="!maintenance">
      <router-link class="nav-link" to="/nations/" v-if="currentNationId">Nations</router-link>
      <router-link class="nav-link" to="/alliances/" v-if="currentNationId">Alliances</router-link>
      <router-link class="nav-link" to="/statistics/">Statistics</router-link>
    </nav>
    <div id="content" v-if="!maintenance">
      <router-view></router-view>
    </div>
    <div id="maintenance" v-if="maintenance">Ferret is currently down for maintenance. Please check back in a few minutes.</div>
  </div>
</template>

<script>
  import Login from './components/Login';
  import api from './utils/api';

  export default {
    name: 'app',
    created () {
      api.initialize().then((data) => {
        this.setCurrentNationId(data.nationId);
      }).catch(_ => {
        this.maintenance = true;
      });
    },
    data () {
      return {
        maintenance: false
      };
    },
    methods: {
      logout () {
        if (this.currentNationId) {
          api.logout().then(_ => {
            this.setCurrentNationId(null);
            this.$router.push('/');
          });
        }
      }
    },
    components: {Login}
  };
</script>

<style>
  @import url(assets/fonts/fonts.css);

  * {
    font-family: 'Titillium Web', Verdana, Arial, sans-serif;
    margin: 0;
    padding: 0;
  }

  .bold {
    font-weight: bold;
  }

  .clear {
    clear: both;
  }

  .message {
    background-color: #9dbca9;
    border-radius: 3px;
    color: #123c12;
    margin: 10px 0;
    padding: 5px;
  }

  .message-error {
    background-color: #b25352;
    color: #e8d9dc;
  }

  body {
    font-size: 1.0em;
  }

  header {
    background-color: #f6f4ff;
    box-shadow: 0 -2px 6px #b6c3d5 inset;
    padding: 7px 45px 10px;
  }

  h1 {
    color: #2f4165 !important;
    font-family: 'Passero One', Verdana, Arial, sans-serif;
    font-size: 4em;
    margin: 0;
    padding: 0;
  }

  h1 a {
    color: #2f4165;
    font-family: 'Passero One', Verdana, Arial, sans-serif;
    text-decoration: none;
  }

  h1 a:hover {
    color: #31688e;
  }

  h2 {
    border-bottom: dotted 2px #3d5a80;
    color: #3d5a80;
    font-size: 2em;
    margin-bottom: 10px;
  }

  h3 {
    color: #6a828c;
    font-size: 1.6em;
    margin-bottom: 10px;
  }

  p {
    margin-bottom: 10px;
    text-indent: 10px;
  }

  nav {
    background-color: #6785a3;
    padding: 0 30px;
  }

  .nav-link {
    color: white;
    display: inline-block;
    text-shadow: 1px 1px 2px #395270;
    padding: 10px 20px;
    text-decoration: none;
  }

  .nav-link:hover {
    background-color: #88b4d5;
    color: #ededed;
  }

  #profile-box {
    background-color: #d4c2b1;
    border-bottom-left-radius: 10px;
    box-shadow: -1px 1px 3px #5a5450;
    float: right;
    font-size: 0.85em;
    margin: -10px -45px;
    padding: 7px 15px;
  }

  #profile-box a {
    color: #3c342f;
    cursor: pointer;
    margin-right: 5px;
    text-decoration: none;
  }

  #profile-box a:last-of-type {
    margin-right: 0;
  }

  #profile-box a:hover {
    color: #7b6356;
  }

  #content {
    padding: 10px;
  }

  #maintenance {
    color: #8b4a42;
    font-size: 140%;
    font-weight: bold;
    margin: 40px;
    text-align: center;
  }
</style>
