export default {
  computed: {
    currentNationId () {
      return this.$store.getters.currentNationId;
    }
  },
  methods: {
    setCurrentNationId (nationId) {
      this.$store.commit('setCurrentNationId', {nationId});
    }
  }
};
