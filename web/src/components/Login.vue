<template>
  <div class="login">
    <div class="login-status" v-if="status">{{status}}</div>
    <div class="login-error" v-if="error">{{error}}</div>
    <div class="login-field">
      <label for="nation-id">Nation ID:</label>
      <input id="nation-id" type="text" v-model="nationId" />
    </div>
    <div class="login-field">
      <label for="password">Password:</label>
      <input id="password" type="password" v-model="password" />
    </div>
    <div class="login-field">
      <button class="login-button" @click="login()">Login</button>
      <button class="login-button" @click="register()">Register</button>
    </div>
  </div>
</template>

<script>
  import api from '../utils/api.js';

  export default {
    name: 'Login',
    created () {
      if (this.currentNationId) {
        this.$router.replace('/');
      }
    },
    watch: {
      currentNationId (newNationId) {
        if (newNationId) {
          this.$router.replace('/');
        }
      }
    },
    data () {
      return {
        error: null,
        status: null,
        nationId: '',
        password: ''
      };
    },
    methods: {
      login () {
        this.error = null;
        this.status = null;
        api.login(this.nationId, this.password)
          .then((data) => {
            this.status = null;
            if (data.error) {
              this.error = data.error;
            } else {
              this.setCurrentNationId(data.nationId);
              this.$router.push('/');
            }
          });
      },
      register () {
        this.error = null;
        this.status = null;
        api.register(this.nationId)
          .then((data) => {
            if (data.error) {
              this.error = data.error;
            } else {
              this.status = 'A message with your password has been sent to ' + data.leader;
            }
          });
      }
    }
  };
</script>

<style>
  .login {
    background-color: #e2dfd4;
    display: block;
    margin: 20px auto;
    padding: 10px;
    text-align: center;
    width: 200px;
  }

  .login-error, .login-status {
    font-size: 0.9em;
    margin-bottom: 10px;
    padding: 3px;
  }

  .login-error {
    background-color: #d8aeb4;
    color: #804e4e;
  }

  .login-status {
    background-color: #b7d87c;
    color: #374237;
  }

  .login-field {
    margin: 5px 0;
  }

  .login-field label {
    display: block;
    font-weight: bold;
    margin-bottom: 5px;
  }

  .login-field input {
    background-color: #f9f8f3;
    border: none;
    display: block;
    margin-bottom: 10px;
    padding: 2px;
    text-align: center;
    width: calc(100% - 4px);
  }

  .login-button {
    background-color: #f1f2f2;
    border: none;
    font-size: 1.2em;
    margin: 5px 5px 0;
    padding: 3px 10px 5px;
  }

  .login-button:hover {
    background-color: #cccdcd;
    cursor: pointer;
  }
</style>
