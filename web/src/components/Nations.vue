<template>
  <EntitySearch :entities="nations" linkBase="/nation/id=" label="nations"></EntitySearch>
</template>

<script>
  import EntitySearch from './EntitySearch';
  import api from '../utils/api.js';
  import requireLoggedIn from '../utils/require-logged-in';

  export default {
    name: 'Nations',
    created () {
      api.nations().then(data => {
        this.nations = data.nations;
      });
    },
    data () {
      return {
        nations: []
      };
    },
    components: {EntitySearch},
    mixins: [requireLoggedIn]
  };
</script>

<style>
</style>
