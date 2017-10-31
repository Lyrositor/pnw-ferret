<template>
  <div class="profile">
    <div class="message" :class="[{'message-error': error}]" v-if="message">{{message}}</div>
    <p>This is your personal profile page. You can change your personal settings here.</p>
    <label for="password">New Password:</label> <input type="password" id="password" v-model="password" /><br />
    <button class="change-password" @click="changePassword(password)">Change Password</button><br />
    <label for="discord">Discord Username:</label> <input type="text" id="discord" v-model="discord" /><br />
    <!--<button class="change-discord" @click="changeDiscord(discord)">Change Discord Username</button>-->
  </div>
</template>

<script>
  import api from '../utils/api.js';
  import requireLoggedIn from '../utils/require-logged-in';

  export default {
    data () {
      return {
        error: false,
        message: null,
        discord: '',
        password: ''
      };
    },
    methods: {
      changePassword (newPassword) {
        this.message = null;
        this.error = false;
        if (newPassword.length === 0) {
          this.error = true;
          this.message = 'New password cannot be empty';
          return 0;
        }
        api.password(newPassword).then(data => {
          if (data.error) {
            this.message = data.error;
            this.error = true;
          } else {
            this.message = 'Successfully changed password.';
          }
        });
      },
      changeDiscord (newDiscord) {
      }
    },
    mixins: [requireLoggedIn]
  };
</script>

<style>
  .profile label {
    display: inline-block;
    font-weight: bold;
    margin-top: 10px;
    width: 180px;
  }

  .profile input {
    width: 240px;
  }

  .profile button, .profile label {
    margin-left: 10px;
  }

  .profile button {
    background-color: #f1f2f2;
    border: none;
    font-size: 1.2em;
    margin: 20px 5px 30px;
    padding: 3px 10px 5px;
  }

  .profile button:hover {
    background-color: #cccdcd;
    cursor: pointer;
  }
</style>
