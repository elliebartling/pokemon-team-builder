// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.

/* eslint-disable no-new */
var Pokedex = require('pokedex-promise-v2')
var P = new Pokedex()

import Vue from 'vue'
import VueResource from 'vue-resource'
import Vuex from 'vuex'
// import $ from 'jquery'
// import './javascripts/tooltips.js'

Vue.use(Vuex)
Vue.use(VueResource)
import App from './App'

const state = {
  pokemon: '',
  types: '',
  filteredPokemon: '',
  pokemonDetailed: [],
  team: []
}

// Cache Mutations
const mutations = {

  // Get Pokemon list
  getNewCache (state) {
    P.getPokemonsList({ limit: 811 - 28 })
      .then((response) => {
        state.pokemon = response.results
        state.filteredPokemon = response.results
      })
  },

  // Get Types list
  getNewTypesCache (state) {
    P.getTypesList()
      .then((response) => {
        console.log(response.results)
        state.types = response.results
      })
  },

  // Clear caches
  clearCache (state) {
    state.filteredPokemon = ''
    state.pokemon = ''
    state.pokemonDetailed = ''
    state.types = ''
  },

  clearFilters (state) {
    state.filteredPokemon = state.pokemon
  }
}

const store = new Vuex.Store({
  state,
  mutations
})

store.commit('getNewCache')
store.commit('getNewTypesCache')
store.commit('clearFilters')

var app = new Vue({
  el: '#app',
  render: h => h(App),
  store,
  // data: {
  //   pokemon: store.pokemon
  // },

  created: function () {
    // this.$store.commit('clearFilters')
    // this.$store.commit('getNewTypesCache')
    // this.getPokemon()
    // this.$store.commit('getNewCache')
  },
  watch: {
    // pokemon: function () {
    //   console.log('Pokemon update!', this.pokemon)
    // }
  },

  methods: {

    // getPokemon () {
    //   this.$store.commit('getNewCache')
    // }

    // Get a list of all pokemon from pokeapi
    // getPokemon () {
    //   console.log('Getting pokemon, hold tight.')
    //   this.$http.get('http://pokeapi.co/api/v2/pokemon')
    //     .then(function (data) {
    //       console.log(data)
    //       this.pokemon = data.body.results
    //     })
    // }
  }

})
console.log('DATA --------')
console.log(app.$data)
