<template>
  <div class="entity-search">
    <div class="entity-search-box">
      <input type="text" :placeholder="'Search for ' + label" class="entity-search-bar" v-model="query" autofocus />
    </div>
    <div class="entity-results">
      <router-link :to="linkBase + result.id" class="entity-result" v-for="result in results" :key="result.id">
        <img class="result-flag" :src="result.flag" height="60" />
        <div class="result-name">{{ result.name }}</div>
      </router-link>
    </div>
  </div>
</template>

<script>
  export default {
    props: ['entities', 'label', 'linkBase'],
    data () {
      return {
        query: ''
      };
    },
    computed: {
      results () {
        if (/^\s*$/.test(this.query)) {
          return;
        }
        const res = [];
        const query = this.query.toLowerCase();
        for (let entity of this.entities) {
          if (entity.name.toLowerCase().includes(query)) {
            res.push(entity);
          }
        }
        return res;
      }
    }
  };
</script>

<style>
  .entity-search-box {
    background-color: #d4cab2;
    padding: 10px;
  }

  .entity-search-bar {
    background-color: #fffcf9;
    border: none;
    box-sizing: border-box;
    font-size: 1.5em;
    padding: 5px;
    width: 100%;
  }

  .entity-results {
    margin: 20px 0;
  }

  .entity-result {
    background-color: #f6f6f6;
    color: black;
    display: block;
    margin-bottom: 20px;
    text-decoration: none;
  }

  .entity-result:hover {
    background-color: #f0f0f0;
  }

  .result-flag {
    border: none;
    display: inline-block;
    filter: grayscale(90%);
    vertical-align: middle;
  }

  .entity-result:hover .result-flag {
    filter: none;
  }

  .result-name {
    display: inline-block;
    font-size: 2.2em;
    font-weight: bold;
    margin: 0 10px;
    text-decoration: none;
    vertical-align: middle;
  }
</style>
