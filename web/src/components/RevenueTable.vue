<template>
  <table class="revenue">
    <tr><th colspan="2">Income</th></tr>
    <tr v-if="nation"><td>Pop</td><td>{{ population }}</td></tr>
    <tr v-if="nation"><td>W.A.I.</td><td>${{ averageIncome }}</td></tr>
    <tr v-if="nation"><td>Tax</td><td>{{ taxRate }}%</td></tr>
    <tr v-if="nation"><td>N.T.B.</td><td><em>{{ nationTreasureBonus }}</em></td></tr>
    <tr v-if="nation"><td>A.T.B.</td><td>{{ allianceTreasureBonus }}%</td></tr>
    <tr v-if="nation"><td>C.B.</td><td>{{ colorBonus }}%</td></tr>
    <tr v-if="nation" class="bold"><td>Bonus</td><td>{{ cumulativeBonus }}%</td></tr>
    <tr class="bold"><td>Total</td><td>${{ grossIncome }}</td></tr>
    <tr><th colspan="2">Expenses</th></tr>
    <tr v-if="nation"><td>Power</td><td>${{ expensesPower }}</td></tr>
    <tr v-if="nation"><td>Prod</td><td>${{ expensesProduction }}</td></tr>
    <tr v-if="nation"><td>Mil</td><td>${{ expensesMilitary }}</td></tr>
    <tr v-if="nation"><td>City</td><td>${{ expensesCity }}</td></tr>
    <tr class="bold"><td>Total</td><td>${{ expensesTotal }}</td></tr>
    <tr><th colspan="2">Production/Usage</th></tr>
    <tr><td><img src="../assets/img/icons/coal.png" width="12" height="12" /></td><td>{{ coal }} tons</td></tr>
    <tr><td><img src="../assets/img/icons/oil.png" width="12" height="12" /></td><td>{{ oil }} tons</td></tr>
    <tr><td><img src="../assets/img/icons/bauxite.png" width="12" height="12" /></td><td>{{ bauxite }} tons</td></tr>
    <tr><td><img src="../assets/img/icons/iron.png" width="12" height="12" /></td><td>{{ iron }} tons</td></tr>
    <tr><td><img src="../assets/img/icons/lead.png" width="12" height="12" /></td><td>{{ lead }} tons</td></tr>
    <tr><td><img src="../assets/img/icons/uranium.png" width="12" height="12" /></td><td>{{ uranium }} tons</td></tr>
    <tr><td><img src="../assets/img/icons/food.png" width="12" height="12" /></td><td>{{ food }} tons</td></tr>
    <tr><th colspan="2">Manufacturing</th></tr>
    <tr><td><img src="../assets/img/icons/gasoline.png" width="12" height="12" /></td><td>{{ gasoline }} tons</td></tr>
    <tr><td><img src="../assets/img/icons/aluminum.png" width="12" height="12" /></td><td>{{ aluminum }} tons</td></tr>
    <tr><td><img src="../assets/img/icons/steel.png" width="12" height="12" /></td><td>{{ steel }} tons</td></tr>
    <tr><td><img src="../assets/img/icons/munitions.png" width="12" height="12" /></td><td>{{ munitions }} tons</td></tr>
    <tr v-if="nation"><th colspan="2">Alliance Taxes (<input v-model.number="allianceRevenueTax" class="tax-input" type="number" min="0" max="100" />%/<input v-model.number="allianceResourceTax" class="tax-input" type="number" min="0" max="100" />%)</th></tr>
    <tr><th colspan="2">Net Revenues</th></tr>
    <tr><td><img src="../assets/img/icons/coal.png" width="12" height="12" /></td><td>{{ coalNet }} tons</td></tr>
    <tr><td><img src="../assets/img/icons/oil.png" width="12" height="12" /></td><td>{{ oilNet }} tons</td></tr>
    <tr><td><img src="../assets/img/icons/bauxite.png" width="12" height="12" /></td><td>{{ bauxiteNet }} tons</td></tr>
    <tr><td><img src="../assets/img/icons/iron.png" width="12" height="12" /></td><td>{{ ironNet }} tons</td></tr>
    <tr><td><img src="../assets/img/icons/lead.png" width="12" height="12" /></td><td>{{ leadNet }} tons</td></tr>
    <tr><td><img src="../assets/img/icons/uranium.png" width="12" height="12" /></td><td>{{ uraniumNet }} tons</td></tr>
    <tr><td><img src="../assets/img/icons/food.png" width="12" height="12" /></td><td>{{ foodNet }} tons</td></tr>
    <tr><td><img src="../assets/img/icons/gasoline.png" width="12" height="12" /></td><td>{{ gasolineNet }} tons</td></tr>
    <tr><td><img src="../assets/img/icons/aluminum.png" width="12" height="12" /></td><td>{{ aluminumNet }} tons</td></tr>
    <tr><td><img src="../assets/img/icons/steel.png" width="12" height="12" /></td><td>{{ steelNet }} tons</td></tr>
    <tr><td><img src="../assets/img/icons/munitions.png" width="12" height="12" /></td><td>{{ munitionsNet }} tons</td></tr>
    <tr class="bold"><td>$</td><td>${{netRevenue}}</td></tr>
  </table>
</template>

<script>
  import format from '../utils/format';
  import pnw from '../utils/pnw';

  export default {
    name: 'RevenueTable',
    props: ['nation', 'stats'],
    computed: {
      // Revenue
      population () { return format(pnw.nation.population(this.nation), 0); },
      averageIncome () { return format(pnw.nation.average_income(this.nation)); },
      taxRate () { return format(pnw.nation.tax_rate(this.nation)); },
      nationTreasureBonus () { return 'Unknown'; },
      allianceTreasureBonus () { return format(pnw.alliance.treasure_bonus(this.nation.alliance)); },
      colorBonus () { return format(pnw.nation.color_bonus(this.nation)); },
      cumulativeBonus () { return format(pnw.nation.cumulative_bonus(this.nation, pnw.alliance.treasure_bonus(this.nation.alliance))); },
      grossIncome () {
        if (this.stats) {
          return format(this.stats.rev_gross);
        } else {
          return format(pnw.nation.rev_gross(this.nation, pnw.alliance.treasure_bonus(this.nation.alliance)));
        }
      },
      expensesPower () { return format(pnw.nation.rev_expenses(this.nation, 'power')); },
      expensesProduction () { return format(pnw.nation.rev_expenses(this.nation, 'resources')); },
      expensesMilitary () { return format(pnw.nation.rev_expenses(this.nation, 'military')); },
      expensesCity () { return format(pnw.nation.rev_expenses(this.nation, 'city')); },
      expensesTotal () {
        if (this.stats) {
          return format(this.stats.rev_expenses);
        } else {
          return format(pnw.nation.rev_expenses(this.nation));
        }
      },
      netRevenue () {
        if (this.stats) {
          return format(this.stats.rev_gross - this.stats.rev_expenses);
        } else {
          return format((pnw.nation.rev_gross(this.nation, pnw.alliance.treasure_bonus(this.nation.alliance)) - pnw.nation.rev_expenses(this.nation)) * (1.0 - this.allianceRevenueTax / 100));
        }
      },

      // Resources
      resourcesProduction () {
        if (this.stats) {
          return this.stats.res_prod;
        } else {
          return pnw.nation.res_prod(this.nation);
        }
      },
      resourcesUsage () {
        if (this.stats) {
          return this.stats.res_usage;
        } else {
          return pnw.nation.res_usage(this.nation);
        }
      },
      coal () { return this.resource(pnw.res.COAL); },
      oil () { return this.resource(pnw.res.OIL); },
      bauxite () { return this.resource(pnw.res.BAUXITE); },
      iron () { return this.resource(pnw.res.IRON); },
      lead () { return this.resource(pnw.res.LEAD); },
      uranium () { return this.resource(pnw.res.URANIUM); },
      food () { return this.resource(pnw.res.FOOD); },
      gasoline () { return this.resource(pnw.res.GASOLINE); },
      aluminum () { return this.resource(pnw.res.ALUMINUM); },
      steel () { return this.resource(pnw.res.STEEL); },
      munitions () { return this.resource(pnw.res.MUNITIONS); },

      coalNet () { return this.resourceNet(pnw.res.COAL); },
      oilNet () { return this.resourceNet(pnw.res.OIL); },
      bauxiteNet () { return this.resourceNet(pnw.res.BAUXITE); },
      ironNet () { return this.resourceNet(pnw.res.IRON); },
      leadNet () { return this.resourceNet(pnw.res.LEAD); },
      uraniumNet () { return this.resourceNet(pnw.res.URANIUM); },
      foodNet () { return this.resourceNet(pnw.res.FOOD); },
      gasolineNet () { return this.resourceNet(pnw.res.GASOLINE); },
      aluminumNet () { return this.resourceNet(pnw.res.ALUMINUM); },
      steelNet () { return this.resourceNet(pnw.res.STEEL); },
      munitionsNet () { return this.resourceNet(pnw.res.MUNITIONS); }
    },
    data () {
      return {
        allianceRevenueTax: 0,
        allianceResourceTax: 0
      };
    },
    methods: {
      resource (resource) {
        return format(this.resourcesProduction[resource]) + ' / ' + format(this.resourcesUsage[resource]);
      },
      resourceNet (resource) {
        const net = this.resourcesProduction[resource] - this.resourcesUsage[resource];
        return format(net > 0 ? net * (1 - this.allianceResourceTax / 100) : net);
      }
    }
  };
</script>

<style>
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
</style>
