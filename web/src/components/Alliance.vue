<template>
  <div class="alliance">
    <h2 v-if="alliance">{{ alliance.name }}</h2>
    <div class="revenue-sidebar" v-if="alliance">
      <RevenueTable :stats="alliance.stats"></RevenueTable>
    </div>
    <div class="alliance-stats">
      <div class="alliance-stat">
        <h3>Social Policies</h3>
        <canvas ref="allianceSocialPolicies" width="400" height="400"></canvas>
      </div>
      <div class="alliance-stat">
        <h3>Economic Policies</h3>
        <canvas ref="allianceEconomicPolicies" width="400" height="400"></canvas>
      </div>
      <div class="alliance-stat">
        <h3>Continents</h3>
        <canvas ref="allianceContinents" width="400" height="400"></canvas>
      </div>
    </div>
  </div>
</template>

<script>
  import Chart from 'chart.js';

  import api from '../utils/api.js';
  import RevenueTable from '../components/RevenueTable';
  import requireLoggedIn from '../utils/require-logged-in';
  import pnw from '../utils/pnw.js';

  export default {
    name: 'Alliance',
    mounted () { this.fetchAlliance(this.$route.params.id); },
    watch: {
      '$route' (newRoute) { this.fetchAlliance(newRoute.params.id); }
    },
    data () {
      return {
        alliance: null
      };
    },
    methods: {
      fetchAlliance (allianceId) {
        this.alliance = null;
        api.alliance(allianceId).then(data => {
          this.alliance = data.alliance;

          // Add the social policies graph
          const socialPolicyLabels = {};
          socialPolicyLabels[pnw.SocialPolicy.ANARCHIST] = 'Anarchist';
          socialPolicyLabels[pnw.SocialPolicy.LIBERTARIAN] = 'Libertarian';
          socialPolicyLabels[pnw.SocialPolicy.LIBERAL] = 'Liberal';
          socialPolicyLabels[pnw.SocialPolicy.MODERATE] = 'Moderate';
          socialPolicyLabels[pnw.SocialPolicy.CONSERVATIVE] = 'Conservative';
          socialPolicyLabels[pnw.SocialPolicy.AUTHORITARIAN] = 'Authoritarian';
          socialPolicyLabels[pnw.SocialPolicy.FASCIST] = 'Fascist';
          // eslint-disable-next-line
          new Chart(this.$refs.allianceSocialPolicies, {
            type: 'doughnut',
            data: {
              labels: Object.values(socialPolicyLabels),
              datasets: [{
                label: '# of Nations',
                data: Object.values(this.alliance.stats.social).map((val) => [val]),
                backgroundColor: [
                  '#108dc7',
                  '#709dc7',
                  '#96a8c7',
                  '#c7bdbd',
                  '#efb89d',
                  '#ef9e6f',
                  '#ef8e38'
                ]
              }]
            },
            options: {
              legend: {
                position: 'bottom'
              }
            }
          });

          // Add the economic policies graph
          const economicPolicyLabels = {};
          economicPolicyLabels[pnw.EconomicPolicy.EXTREMELY_LEFT_WING] = 'Extreme Left';
          economicPolicyLabels[pnw.EconomicPolicy.FAR_LEFT_WING] = 'Far Left';
          economicPolicyLabels[pnw.EconomicPolicy.LEFT_WING] = 'Left';
          economicPolicyLabels[pnw.EconomicPolicy.MODERATE] = 'Moderate';
          economicPolicyLabels[pnw.EconomicPolicy.RIGHT_WING] = 'Right';
          economicPolicyLabels[pnw.EconomicPolicy.FAR_RIGHT_WING] = 'Far Right';
          economicPolicyLabels[pnw.EconomicPolicy.EXTREMELY_RIGHT_WING] = 'Extreme Right';
          // eslint-disable-next-line
          new Chart(this.$refs.allianceEconomicPolicies, {
            type: 'doughnut',
            data: {
              labels: Object.values(economicPolicyLabels),
              datasets: [{
                label: '# of Nations',
                data: Object.values(this.alliance.stats.econ).map((val) => [val]),
                backgroundColor: [
                  '#c72b16',
                  '#c75d4c',
                  '#c78b8d',
                  '#c7bdbd',
                  '#b2bfef',
                  '#6069ef',
                  '#4258ef'
                ]
              }]
            },
            options: {
              legend: {
                position: 'bottom'
              }
            }
          });

          // Add the continents
          const continentsLabels = {};
          continentsLabels[pnw.Continent.NORTH_AMERICA] = 'North America';
          continentsLabels[pnw.Continent.SOUTH_AMERICA] = 'South America';
          continentsLabels[pnw.Continent.EUROPE] = 'Europe';
          continentsLabels[pnw.Continent.AFRICA] = 'Africa';
          continentsLabels[pnw.Continent.ASIA] = 'Asia';
          continentsLabels[pnw.Continent.AUSTRALIA] = 'Australia';
          // eslint-disable-next-line
          new Chart(this.$refs.allianceContinents, {
            type: 'doughnut',
            data: {
              labels: Object.values(continentsLabels),
              datasets: [{
                label: '# of Nations',
                data: Object.values(this.alliance.stats.continent).map((val) => [val]),
                backgroundColor: [
                  '#467dc7',
                  '#4fc787',
                  '#c1c77b',
                  '#c79ac1',
                  '#efaa85',
                  '#a9efe7'
                ]
              }]
            },
            options: {
              legend: {
                position: 'bottom'
              }
            }
          });
        });
      }
    },
    components: {RevenueTable},
    mixins: [requireLoggedIn]
  };
</script>

<style>
  .alliance {
    position: relative;
  }

  .revenue-sidebar {
    background-color: #f6f6f6;
    position: absolute;
  }

  .alliance-stats {
    margin-left: 210px;
  }

  .alliance-stat {
    display: inline-block;
    font-weight: bold;
    margin-bottom: 50px;
    max-height: 400px;
    max-width: 400px;
    text-align: center;
  }
</style>
