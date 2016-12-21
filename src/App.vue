<template>
  <div id="app">

    <!-- YOUR TEAM SECTION -->
    <div class="team">
      <h2 class="special">YOUR TEAM</h2>
      <ul class="team-members">
        <li class="empty-text" v-if="team.length === 0">No team members yet! Add some by clicking the sprites below.</li>
        <transition-group name="list-complete">
          <li v-bind:key="poke" v-for="(poke, index) in team" :id="poke.name" class="team-member list-complete-item">
            <div class="sprite-container" v-on:click="removePokemonFromTeam(poke.name)"><img class="sprite" v-bind:src="poke.id | getSpriteFromId" /></div>
          </li>
        </transition-group>
      </ul>

      <!-- YOUR TEAM TYPING SECTION -->
      <div class="animated-wrapper" :class="{ closed: isCollapsed }">
      <table id="types" class="team-typing table">
        <thead>
          <tr>
            <th>types</th>
            <!-- <th>team</th> -->
            <th>weak</th>
            <th>resist</th>
            <!-- <th>immune</th> -->
            <th id="toggle-button" style="text-align:right"><a v-on:click="toggleTable()" class="btn btn-primary"><i class="fa fa-expand"></i></a></th>
          </tr>
        </thead>
        <tbody v-bind:class="{ hidden: isCollapsed }">
          <tr v-for="type in allTypes">
            <!-- Type Name -->
            <th scope="row" :class="type.name">
              <span :class="{ active: teamTypes.indexOf(type.name) > -1 }" class="btn type"> {{ type.name }}</span>
            </th>



            <!-- Which Types are in Your Party -->
              <!-- <td class="all-types">
                <template v-for="p in team" :class="p.name">
                  <template v-for="t in p.types">
                    <span v-bind:title="p.name" v-if="t.type.name === type.name" class="btn marker"> </span>
                  </template>
                </template>
              </td> -->

              <!-- Which Types Your Team is Weak Against -->
              <td class="weak-against-types">
                <template v-for="p in team" :class="p.name">
                  <template v-if="p.damageTaken[type.name] > 1">
                    <span class="btn marker" v-bind:title="p.name"></span>
                  </template>
                </template>
              </td>

              <!-- Which Types Your Team is Weak Against -->
              <td class="resists-against-types">
                <template v-for="p in team">
                  <template v-if="p.damageTaken[type.name] < 1 && p.damageTaken[type.name] > 0">
                    <span class="btn marker" v-bind:title="p.name"></span>
                  </template>
                </template>
                <template v-for="p in team">
                  <template v-if="p.damageTaken[type.name] === 0">
                    <span class="btn marker immune" v-bind:title="p.name"></span>
                  </template>
                </template>
              </td>


            <!-- Which Types Your Team Resists -->
            <!-- <td class="immune-against-types">
              <template v-for="p in team" :class="p.name">
                <template v-if="p.damageTaken[type.name] === 0">
                  <span class="btn marker" v-bind:title="p.name"></span>
                </template>
              </template>
            </td> -->
          </tr>
        </tbody>
      </table>
      </div>
    </div>

    <!-- ALL POKEMON -->
    <div id="pokebank">
      <h2 class="special">ALL POKEMON</h2>

      <!-- FILTERS -->
      <ul id="types">
        <li v-on:click="filterPokesByType(type.name)" v-for="type in allTypes" class="type" :class="type.name">
          <span class="btn type">{{ type.name }}</span>
        </li>
        <li v-on:click="clearFilters()"><span class="btn btn-ghost">clear filters</span></li>
      </ul>

      <!-- SEARCH -->
      <div class="search-box">
        <input v-model="search" class="form-control" placeholder="filter pokemon by name"></input>
      </div>

      <!-- POKEMON LIST -->
      <ul id="pokemon">
        <transition-group name="list-complete">
        <li v-for="poke in visiblePokes" v-bind:key="poke" :id="poke.name" class="pokemon list-complete-item" v-on:click="addPokeToTeam(poke.name)">
          <div class="sprite-container">
            <img v-bind:alt="poke.name" v-bind:title="poke.name" class="sprite tip fadeIn" v-bind:src="poke.url | getSpriteUrl" />
          </div>
        </li>
        </transition-group>
      </ul>
    </div>
  </div>

</template>

<script>
var Pokedex = require('pokedex-promise-v2')
var Dex = new Pokedex()

import $ from 'jquery'
import 'tooltipster'

var activateTipster = function () {
  console.log('tipster activated')
  $('.tip').tooltipster()
}

export default {
  name: 'app',

  data: function () {
    return {
      types: '',
      title: 'Pokemon Team Builder',
      team: [],
      teamTypes: [],
      isCollapsed: true,
      visiblePokes: '',
      search: ''
    }
  },
  props: ['pokemon'],
  computed: {
    allPokes () {
      return this.$store.state.pokemon
    },
    allTypes () {
      return this.$store.state.types
    },
    visiblePokes () {
      return this.$store.state.filteredPokemon
    }
  },

  created: function () {
    // this.initCache()
  },

  ready: function () {
    activateTipster()
  },

  watch: {
    search () {
      this.filterPokesBySearch('check')
    },

    team () {
      var app = this
      app.teamTypes = []

      app.team.forEach((p) => {
        // Get this pokemon's typing data
        p.types.forEach((t) => {
          app.teamTypes.push(t.type.name)
        })
        app.checkTeamDamageStats(p)
      })
    }
  },

  methods: {

    initCache () {
      this.visiblePokes = this.$store.state.pokemon
    },

    // Add a pokemon to your Team
    // var poke = name
    addPokeToTeam (poke) {
      var app = this

      if (app.team.length === 6) {
        app.team.shift()
      }

      Dex.getPokemonByName(poke).then((response) => {
        response.damageTaken = {}
        app.team.push(response)
      })
    },

    toggleTable () {
      this.isCollapsed = !this.isCollapsed
    },

    clearFilters () {
      this.$store.state.filteredPokemon = this.$store.state.pokemon
      this.search = ''
    },

    filterPokesByType (type) {
      var app = this
      Dex.getTypeByName(type)
        .then((response) => {
          // Get an array of names of pokemon that should be visible
          var pokeNames = []
          response.pokemon.forEach(function (p) {
            pokeNames.push(p.pokemon.name)
          })
          // Filter allPokes by pokeNames list,
          // and return that value to visiblePokes
          var visPokes = app.allPokes.filter(function (z) {
            return (pokeNames.indexOf(z.name) > -1)
          })
          app.$store.state.filteredPokemon = visPokes
        })
    },

    filterPokesBySearch () {
      var app = this
      console.log(app.search)
      var visPokes = app.allPokes.filter(function (z) {
        return (z.name.indexOf(app.search) > -1)
      })
      app.$store.state.filteredPokemon = visPokes
    },

    teamIncludesType (type) {
      var app = this
      // return true
      console.log(type)
      app.team.forEach((t) => {
        t.types.forEach((q) => {
          // console.log(q.type.name)
          if (type.indexOf(q.type.name) > -1) {
            console.log('found one')
            return true
          } else {
            return false
          }
        })
      })
    },

    removePokemonFromTeam (name) {
      var app = this
      console.log(name)
      var newTeam = app.team.filter((p) => {
        console.log(p.name)
        return p.name !== name
      })

      app.team = newTeam
    },

    checkTeamDamageStats (pokemon) {
      var app = this
      var thisPokemonTypes = []

      // Default damage calculations
      var thisPokemonDamageTaken = {
        'normal': 1,
        'fighting': 1,
        'flying': 1,
        'poison': 1,
        'ground': 1,
        'rock': 1,
        'bug': 1,
        'ghost': 1,
        'steel': 1,
        'fire': 1,
        'water': 1,
        'grass': 1,
        'electric': 1,
        'psychic': 1,
        'ice': 1,
        'dragon': 1,
        'dark': 1,
        'fairy': 1
      }

      function retrieveTypeFromAPI (type) {
        // Get type information from the API
        Dex.getTypeByName(type).then((response) => {
          thisPokemonTypes.push(response)
          evaluatePokemonDamageTaken(response)
        })
      }

      function evaluatePokemonDamageTaken (type) {
        // Collect the damage-to arrays into more management vars
        var noDamageFrom = type.damage_relations.no_damage_from
        var halfDamageFrom = type.damage_relations.half_damage_from
        var doubleDamageFrom = type.damage_relations.double_damage_from

        // For each type that this pokemon is immune to,
        // multiply this pokemon's damage index by 0
        noDamageFrom.forEach((n) => {
          console.log('Takes no damage from ' + n.name)
          thisPokemonDamageTaken[n.name] = thisPokemonDamageTaken[n.name] * 0
        })

        halfDamageFrom.forEach((h) => {
          console.log('Takes half damage from ' + h.name)
          thisPokemonDamageTaken[h.name] = thisPokemonDamageTaken[h.name] * 0.5
        })

        doubleDamageFrom.forEach((d) => {
          console.log('Takes double damage from ' + d.name)
          thisPokemonDamageTaken[d.name] = thisPokemonDamageTaken[d.name] * 2
        })

        // Find this pokemon in the Team array and add its final
        // damage multipliers object to it
        for (var i = 0; i < app.team.length; i++) {
          if (app.team[i].name === pokemon.name) {
            console.log(app.team[i].name)
            app.$set(app.team[i], 'damageTaken', thisPokemonDamageTaken)
          }
        }
      }

      // Run this series of functions for each type the pokemon has
      pokemon.types.forEach((t) => {
        retrieveTypeFromAPI(t.type.name)
      })
    }
  },

  filters: {
    getSpriteUrl: function (url) {
      if (!url) return ''
      var id = url.split('/').slice(-2)[0]
      return '/static/sprites/pokemon/' + id + '.png'
    },

    getSpriteFromId: function (id) {
      if (!id) return ''
      return '/static/sprites/pokemon/other-sprites/official-artwork/' + id + '.png'
    },

    checkIfMatch: function (typeName, multiplier) {
      return 'working'
    }
  }
}
</script>

<style lang="scss">
  @import 'stylesheets/app';
  // @import '../../node_modules/tooltipster/dist/css/tooltipster.bundle.min.css';

  ul {
    list-style-type: none;
    padding: 0;
  }

  li {
    display: inline-block;
    margin: 0 10px;
  }

  a {
    color: #42b983;
  }
  .special {
    text-transform: uppercase;
    font-weight: bold;
    letter-spacing: 3px;
    font-size: 1.2rem;
    color: rgba(0,0,0,.3);
    margin-top: 1rem;
  }

  .search-box {
    width: 90%;
    max-width: 400px;
    margin: auto;
  }

  #pokebank {
    border: 1px solid $light-gray;
    max-width: 90%;
    margin: auto;
    border-radius: 4px;
    margin-bottom: 4rem;
  }

  #toggle-button {
    a.btn { padding: .5rem .75rem}
    width: 50px;
    padding: .75rem 0rem .75rem 0rem
  }
</style>
