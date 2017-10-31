export default {
  created () {
    if (this.currentNationId === null) {
      this.$router.replace('/login/');
    }
  },
  watch: {
    currentNationId (newNationId) {
      if (newNationId === null) {
        this.$router.replace('/login/');
      }
    }
  }
};
