<template>
  <div id="app">

    <!-- YOUR TEAM SECTION -->
    <div class="team">
      <h2 class="special">YOUR TEAM</h2>
      <ul class="team-members">
        <li class="empty-text" v-if="team.length === 0">No team members yet! Add some by clicking the sprites below.</li>
        <li v-for="(poke, index) in team" :id="poke.name" class="team-member">
          <div class="sprite-container"><img class="sprite" v-bind:src="poke.id | getSpriteFromId" /></div>
          <span>{{ poke.name }}</span>
        </li>
      </ul>

      <!-- YOUR TEAM TYPING SECTION -->
      <table id="types" class="team-typing table">
        <thead>
          <tr>
            <th>types</th>
            <th>in team</th>
            <th>weak</th>
            <th>resist</th>
            <th>immune</th>
            <th style="text-align:right"><a v-on:click="toggleTable()" class="btn btn-primary"><i class="fa fa-expand"></i></a></th>
          </tr>
        </thead>
        <tbody v-bind:class="{ collapse: isCollapsed }">
          <tr v-for="type in allTypes">
            <!-- Type Name -->
            <th scope="row" :class="type.name">
              <span class="btn type">{{ type.name }}</span>
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
              <template v-for="p in team" :class="p.name">

              </template>
            </td>

            <!-- Which Types Your Team Resists -->
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ALL POKEMON -->
    <div id="pokebank">
      <h2 class="special">ALL POKEMON</h2>

      <!-- FILTERS -->
      <ul id="types">
        <li v-on:click="filterPokes(type.name)" v-for="type in allTypes" class="type" :class="type.name">
          <span class="btn type">{{ type.name }}</span>
        </li>
      </ul>

      <!-- SEARCH -->
      <div class="search-box">
        <input class="form-control" placeholder="filter pokemon by name"></input>
      </div>

      <!-- POKEMON LIST -->
      <ul id="pokemon">
        <li v-for="poke in allPokes" :id="poke.name" class="pokemon" v-on:click="addPokeToTeam(poke.url)">
          <div class="sprite-container">
            <img v-bind:alt="poke.name" v-bind:title="poke.name" class="sprite" v-bind:src="poke.url | getSpriteUrl" />
          </div>
        </li>
      </ul>
    </div>
  </div>

</template>

<script>
// var Pokedex = require('pokedex-promise-v2')
// var P = new Pokedex()

export default {
  name: 'app',

  data: function () {
    return {
      types: '',
      title: 'Pokemon Team Builder',
      // visiblePokes: this.checkCache() /* get data from parent app variable */,
      filterPokes: '',
      team: [],
      teamTypes: [],
      isCollapsed: true
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
      // return this.allPokes.filter(function(pokeName))
    }
  },

  created: function () {
    // this.getTypes()
    // this.checkCache()
  },

  watch: {
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

    // Get a list of all the types
    // getTypes () {
    //   var app = this
    //   P.getTypesList()
    //     .then((response) => {
    //       app.types = response.body.results
    //     })
    // },

    // When you click a type, filter the pokemon list by type
    filterPokes (type) {
      console.log(type)
      var app = this

      this.$http.get('http://pokeapi.co/api/v2/type/' + type).then((response) => {
        app.filterPokes = response.body.pokemon
      })
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

    // Filter pokemon by type tag
    filterPokesByType (type) {
      this.allPokes.filter(function () {
        return ''
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
    }
  }
}
</script>

<style lang="scss">
  @import 'stylesheets/app';

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
  }
</style>
