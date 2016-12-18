// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
// import Vue from 'vue'
// import App from './App'

/* eslint-disable no-new */
// new Vue({
//   el: '#app',
//   template: '<App/>',
//   components: { App }
// })

import Vue from 'vue'
import VueResource from 'vue-resource'
import Vuex from 'vuex'
import $ from 'jquery'

Vue.use(Vuex)
Vue.use(VueResource)
import App from './App'

const state = {
  pokemon: '',
  pokemonDetailed: [],
  team: []
}

// Cache Mutations
const mutations = {
  getNewCache (state) {
    $.get('http://pokeapi.co/api/v2/pokemon?limit=800', function (data) {
      console.log(data)
    })
    .done((data) => {
      console.log('Got new cache from pokeapi')
      console.log(data.results)
      state.pokemon = data.results
      $.event.trigger({
        type: 'newCache',
        message: 'Retrieved new cache!',
        time: new Date()
      })
    })
    .fail(() => {
      console.log('ERROR getting pokemon')
    })
  },

  clearCache (state) {
    state.pokemon = ''
    state.pokemonDetailed = ''
  }
}

const store = new Vuex.Store({
  state,
  mutations
})

var app = new Vue({
  el: '#app',
  render: h => h(App),
  store,
  data: {
    pokemon: store.pokemon
  },

  created: function () {
    this.$store.commit('getNewCache')
    // this.getPokemon()
    // this.$store.commit('getNewCache')
  },
  watch: {
    pokemon: function () {
      console.log('Pokemon update!', this.pokemon)
    }
  },

  methods: {

    getPokemon () {
      this.$store.commit('getNewCache')
    }

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
