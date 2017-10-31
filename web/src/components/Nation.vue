<template>
  <div class="nation" v-if="nation">
    <h2>{{ nation.name }}</h2>
    <div class="revenue-sidebar">
      <RevenueTable :nation="nation"></RevenueTable>
    </div>
    <div class="nation-details">
      <h3>Cities</h3>
      <div class="cities">
        <ul class="city-list">
          <li v-for="city in nation.cities" @click="currentCity = city" :class="{ 'city-active': currentCity == city}">{{ city.name }}</li>
        </ul>
        <div class="city-details" v-if="currentCity">
          <div class="city-parameters">
            <div>
              <label style="display: inline-block; width: 100px;"><strong>Infrastructure:</strong></label><input type="number" v-model.number="currentCity.infrastructure" min="0" step="100" style="width: 50px;" />
            </div>
            <div>
              <label style="display: inline-block; width: 100px;"><strong>Land:</strong></label><input type="number" v-model.number="currentCity.land" min="0" step="500" style="width: 50px;" />
            </div>
            <strong>Improvements:</strong>
            <div class="city-improvement" v-for="(imp, i) in IMPROVEMENTS">
              <input type="number" v-model.number="currentCity.improvements[i]" min="0" :max="imp.max" />
              <label>{{ imp.py_name }}</label>
            </div>
          </div>
          <div class="city-build">{{ cityBuild }}</div>
          <div class="clear"></div>
        </div>
      </div>

      <h3>Military</h3>
      <div class="military">
        <input type="number" v-model.number="nation.soldiers" min="0" /><label>Soldiers:</label><br />
        <input type="number" v-model.number="nation.tanks" min="0" /><label>Tanks:</label><br />
        <input type="number" v-model.number="nation.aircraft" min="0" /><label>Air Force:</label><br />
        <input type="number" v-model.number="nation.ships" min="0" /><label>Naval Ships:</label><br />
        <input type="number" v-model.number="nation.spies" min="0" /><label>Spies:</label><br />
        <input type="number" v-model.number="nation.missiles" min="0" /><label>Missiles:</label><br />
        <input type="number" v-model.number="nation.nukes" min="0" /><label>Nuclear Weapons:</label>
      </div>

      <h3>Projects</h3>
      <div class="projects">
        <input type="checkbox" v-model="nation.projects[PROJECTS.ARMS_STOCK_PILE]" />Arms Stockpile<br />
        <input type="checkbox" v-model="nation.projects[PROJECTS.BAUXITE_WORKS]" />Bauxiteworks<br />
        <input type="checkbox" v-model="nation.projects[PROJECTS.CENTER_CIVIL_ENGINEERING]" />Center for Civil Engineering<br />
        <input type="checkbox" v-model="nation.projects[PROJECTS.EMERGENCY_GAS_RESERVE]" />Emergency Gasoline Reserve<br />
        <input type="checkbox" v-model="nation.projects[PROJECTS.INTELLIGENCE_AGENCY]" />Intelligence Agency<br />
        <input type="checkbox" v-model="nation.projects[PROJECTS.INTERNATIONAL_TRADE_CENTER]" />International Trade Center<br />
        <input type="checkbox" v-model="nation.projects[PROJECTS.IRON_DOME]" />Iron Dome<br />
        <input type="checkbox" v-model="nation.projects[PROJECTS.IRON_WORKS]" />Ironworks<br />
        <input type="checkbox" v-model="nation.projects[PROJECTS.MASS_IRRIGATION]" />Mass Irrigation<br />
        <input type="checkbox" v-model="nation.projects[PROJECTS.MISSILE_LAUNCH_PAD]" />Missile Launch Pad<br />
        <input type="checkbox" v-model="nation.projects[PROJECTS.NUCLEAR_RESEARCH_FACILITY]" />Nuclear Research Facility<br />
        <input type="checkbox" v-model="nation.projects[PROJECTS.PROPAGANDA_BUREAU]" />Propaganda Bureau<br />
        <input type="checkbox" v-model="nation.projects[PROJECTS.URANIUM_ENRICHMENT_PROGRAM]" />Uranium Enrichment Program<br />
        <input type="checkbox" v-model="nation.projects[PROJECTS.VITAL_DEFENSE_SYSTEM]" />Vital Defense System
      </div>
    </div>
    <div class="clear"></div>
  </div>
</template>

<script>
  import api from '../utils/api.js';
  import RevenueTable from '../components/RevenueTable';
  import requireLoggedIn from '../utils/require-logged-in';
  import pnw from '../utils/pnw';

  export default {
    name: 'Nation',
    beforeMount () { this.fetchNation(this.$route.params.id); },
    watch: {
      '$route' (newRoute) { this.fetchNation(newRoute.params.id); }
    },
    computed: {
      cityBuild () {
        const total = Object.values(this.currentCity.improvements).reduce((a, b) => a + b);
        return JSON.stringify({
          infra_needed: total * 50,
          imp_total: total,
          imp_coalpower: this.currentCity.improvements[pnw.im.COAL_POWER],
          imp_oilpower: this.currentCity.improvements[pnw.im.OIL_POWER],
          imp_windpower: this.currentCity.improvements[pnw.im.WIND_POWER],
          imp_nuclearpower: this.currentCity.improvements[pnw.im.NUCLEAR_POWER],
          imp_coalmine: this.currentCity.improvements[pnw.im.COAL_MINE],
          imp_oilwell: this.currentCity.improvements[pnw.im.OIL_WELL],
          imp_uramine: this.currentCity.improvements[pnw.im.URANIUM_MINE],
          imp_leadmine: this.currentCity.improvements[pnw.im.LEAD_MINE],
          imp_ironmine: this.currentCity.improvements[pnw.im.IRON_MINE],
          imp_bauxitemine: this.currentCity.improvements[pnw.im.BAUXITE_MINE],
          imp_farm: this.currentCity.improvements[pnw.im.FARM],
          imp_gasrefinery: this.currentCity.improvements[pnw.im.GASOLINE_REFINERY],
          imp_aluminumrefinery: this.currentCity.improvements[pnw.im.ALUMINUM_REFINERY],
          imp_munitionsfactory: this.currentCity.improvements[pnw.im.MUNITIONS_FACTORY],
          imp_steelmill: this.currentCity.improvements[pnw.im.STEEL_MILL],
          imp_policestation: this.currentCity.improvements[pnw.im.POLICE_STATION],
          imp_hospital: this.currentCity.improvements[pnw.im.HOSPITAL],
          imp_recyclingcenter: this.currentCity.improvements[pnw.im.RECYCLING_CENTER],
          imp_subway: this.currentCity.improvements[pnw.im.SUBWAY],
          imp_supermarket: this.currentCity.improvements[pnw.im.SUPERMARKET],
          imp_bank: this.currentCity.improvements[pnw.im.BANK],
          imp_mall: this.currentCity.improvements[pnw.im.MALL],
          imp_stadium: this.currentCity.improvements[pnw.im.STADIUM],
          imp_barracks: this.currentCity.improvements[pnw.im.BARRACKS],
          imp_factory: this.currentCity.improvements[pnw.im.FACTORY],
          imp_hangars: this.currentCity.improvements[pnw.im.HANGAR],
          imp_drydock: this.currentCity.improvements[pnw.im.DRYDOCK]
        }, null, 4);
      }
    },
    data () {
      return {
        currentCity: null,
        IMPROVEMENTS: pnw.IMPROVEMENTS,
        PROJECTS: pnw.Project,
        nation: null
      };
    },
    methods: {
      fetchNation (nationId) {
        this.allianceRevenueTax = 0;
        this.allianceResourceTax = 0;
        this.currentCity = null;
        this.nation = null;
        api.nation(nationId).then(data => {
          this.nation = data.nation;
          this.currentCity = this.nation.cities[0];
        });
      }
    },
    components: {RevenueTable},
    mixins: [requireLoggedIn]
  };
</script>

<style>
  .nation {
    position: relative;
  }

  .revenue-sidebar {
    background-color: #f6f6f6;
    position: absolute;
  }

  .revenue {
    background-color: #f6f6f6;
    border:  solid 1px #6785a3;
    border-collapse: collapse;
    font-size: 0.8em;
    line-height: 100%;
    width: 200px;
  }

  .revenue th, .revenue td {
    padding: 3px;
  }

  .revenue td:nth-of-type(2) {
    text-align: right;
  }

  .revenue th {
    background-color: #6785a3;
    color: #ffffff;
    font-weight: bold;
  }

  .tax-input {
    background-color: #b6cbd8;
    border: none;
    height: 1.1em;
    margin: 0 2px;
    padding: 0;
    text-align: right;
    width: 32px;
  }

  .nation-details {
    margin-left: 210px;
  }

  .city-list {
    cursor: pointer;
    float: left;
    font-size: 0.8em;
    line-height: 120%;
    list-style-type: none;
    width: 150px;
  }

  .city-list li {
    background-color: #f5f5f5;
    border: solid 1px #b8b8b8;
    border-bottom: none;
    padding: 2px;
  }

  .city-list li:last-of-type {
    border-bottom: solid 1px #b8b8b8;
  }

  .city-list li.city-active {
    background-color: white;
    border-right-color: white;
  }

  .city-details {
    border: solid 1px #b8b8b8;
    font-size: 0.8em;
    margin-left: 149px;
    padding: 10px;
  }

  .city-parameters {
    float: left;
    width: 200px;
  }

  .city-improvement label {
    margin: 0 5px;
  }

  .city-parameters input {
    border: none;
    border-bottom: dotted 1px #b8b8b8;
    text-align: right;
    width: 30px;
  }

  .city-build {
    background-color: #ebebeb;
    border: solid 1px #a8a8a8;
    font-family: 'Courier New', monospace;
    margin-left: 200px;
    padding: 10px;
    white-space: pre;
  }

  .military, .projects {
    border: solid 1px #b8b8b8;
    font-size: 0.8em;
    margin: 10px 0;
    padding: 10px;
  }

  .military input {
    border: none;
    border-bottom: dotted 1px #b8b8b8;
    margin-right: 10px;
    text-align: right;
    width: 50px;
  }

  .projects input {
    -moz-appearance: none;
    -webkit-appearance: none;
    background: #ffffff;
    border: dotted 1px #b8b8b8;
    cursor: pointer;
    height: 1em;
    margin-right: 5px;
    width: 1em;
  }

  .projects input:focus {
    outline: none;
  }

  .projects input:checked {
    background: #8a8a8a;
  }
</style>
