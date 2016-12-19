<template>
  <div id="app">

    <!-- YOUR TEAM SECTION -->
    <div class="team">
      <h2 class="special">YOUR TEAM</h2>
      <ul class="team-members">
        <li class="empty-text" v-if="team.length === 0">No team members yet! Add some by clicking the sprites below.</li>
        <li v-for="(poke, index) in team" :id="poke.name" class="team-member">
          <div class="sprite-container" v-on:click="removePokemonFromTeam(poke.name)"><img class="sprite" v-bind:src="poke.id | getSpriteFromId" /></div>
        </li>
      </ul>

      <!-- YOUR TEAM TYPING SECTION -->
      <div class="animated-wrapper" :class="{ closed: isCollapsed }">
      <table id="types" class="team-typing table">
        <thead>
          <tr>
            <th>types</th>
            <th>in team</th>
            <th>weak</th>
            <th>resist</th>
            <th>immune</th>
            <th id="toggle-button" style="text-align:right"><a v-on:click="toggleTable()" class="btn btn-primary"><i class="fa fa-expand"></i></a></th>
          </tr>
        </thead>
        <tbody v-bind:class="{ hidden: isCollapsed }">
          <tr v-for="type in allTypes">
            <!-- Type Name -->
            <th scope="row" :class="type.name">
              <span :class="{ active: teamIncludesType(type.name) }" class="btn type"> {{ type.name }}</span>
            </th>

            <!-- Which Types are in Your Party -->
            <td class="all-types">
              <template v-for="p in team" :class="p.name">
                <template v-for="t in p.types">
                  <span v-bind:title="p.name" v-if="t.type.name === type.name" class="btn marker"> </span>
                </template>
              </template>
            </td>

            <!-- Which Types Your Team is Weak Against -->
            <td class="weak-against-types">
              <template v-for="t in teamTypes" :class="t.name">
                <template v-for="d in t.damage_relations.double_damage_from">
                  <span class="btn marker" v-if="d.name === type.name"></span>
                </template>
              </template>
            </td>

            <!-- Which Types Your Team Resists -->
            <td class="resists-against-types">
              <template v-for="t in teamTypes" :class="t.name">
                <template v-for="d in t.damage_relations.half_damage_from">
                  <span class="btn marker" v-if="d.name === type.name"></span>
                </template>
              </template>
            </td>


            <!-- Which Types Your Team Resists -->
            <td class="immune-against-types">
              <template v-for="t in teamTypes" :class="t.name">
                <template v-for="d in t.damage_relations.no_damage_from">
                  <span class="btn marker" v-if="d.name === type.name"></span>
                </template>
              </template>
            </td>
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
        <li v-for="poke in visiblePokes" :id="poke.name" class="pokemon fadeIn" v-on:click="addPokeToTeam(poke.url)">
          <div class="sprite-container">
            <img v-bind:alt="poke.name" v-bind:title="poke.name" class="sprite tip" v-bind:src="poke.url | getSpriteUrl" />
          </div>
        </li>
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
      teamTypesDamage: {
        'resists': [],
        'weak': [],
        'immune': [],
        'normal': []
      },
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
          Dex.getTypeByName(t.type.name)
            .then((response) => {
              app.teamTypes.push(response)
              // checkTypingRules()
            })
        })
      })
    },

    teamTypes () {
      var app = this
      app.team.forEach((p) => {
        // Damage multipliers
        // var multipliers = {
        //   'immune': 0,
        //   'weak': 2,
        //   'resist': 0.5,
        //   'neutral': 1
        // }
        // Blank array for holding typing data
        var pokeTypesData = []

        // Check typing rules function
        var checkTypingRules = function () {
          pokeTypesData.forEach((type) => {
            if (type.damage_relations.no_damage_from.length > 0) {
              type.damage_relations.no_damage_from.length.forEach((t) => {
                this.teamTypes.immune.push(t.name)
                return
              })
            }
          })

          checkTypingRules()
          // If immune, add to immune and return
          // If resist,
        }
      })
    }
  },

  methods: {

    checkCache () {
      if (this.$store.state.pokemon) {
        console.log('there is already a cache')
        return this.$store.state.pokemon
      } else {
        console.log('no cache yet')
        this.$store.commit('getNewCache')
        // console.log('now theres a cache')
        // return this.$store.state.pokemon
      }
    },

    initCache () {
      this.visiblePokes = this.$store.state.pokemon
    },

    // Add a pokemon to your Team
    // var poke = url
    addPokeToTeam (poke) {
      var app = this
      var cache = app.$store.state.pokemonDetailed
      // var pokemonData

      // If team is to big, remove the first item
      if (this.team.length === 6) {
        app.team.shift()
      }

      // If there's cached pokemon data at all, check it
      if (cache.length > 0) {
        // Filter the pokemon data by pokemon name
        console.log(cache)
        var cachedPoke = cache.filter(function (p) {
          return p.url === poke
        })
        console.log(cachedPoke)
        if (cachedPoke.length > 0) {
          console.log('Found pokemon in cache')
          console.log(cachedPoke[0])
          app.team.push(cachedPoke)
          return
        } else {
          console.log('Didn\'t find poke in cache. Creating new request.')
          this.fetchPokeFromAPI(poke)
        }
      } else {
        // Otherwise, get new data from pokeapi
        console.log('No detailed cache yet. Creating new request.')
        this.fetchPokeFromAPI(poke)
      }
    },

    fetchPokeFromAPI (url) {
      var app = this
      // Dex.getPokemonByName()
      this.$http.get(url).then((response) => {
        // Add data to the cache
        app.team.push(response.body)
        this.$store.state.pokemonDetailed.push(response.body)
        return response.body
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
      // console.log(type)
      app.teamTypes.forEach((t) => {
        if (t.name === type) {
          return true
        } else {
          return false
        }
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
