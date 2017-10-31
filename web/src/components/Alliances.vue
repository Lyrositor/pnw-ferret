<template>
  <EntitySearch :entities="alliances" linkBase="/alliance/id=" label="alliances"></EntitySearch>
</template>

<script>
  import EntitySearch from './EntitySearch';
  import api from '../utils/api.js';
  import requireLoggedIn from '../utils/require-logged-in';

  export default {
    name: 'Alliances',
    created () {
      api.alliances().then(data => {
        this.alliances = data.alliances;
      });
    },
    data () {
      return {
        alliances: []
      };
    },
    components: {EntitySearch},
    mixins: [requireLoggedIn]
  };
</script>

<style>
</style>
