<template>
  <v-dialog v-model="show" max-width="500px">
    <v-card v-if="show">
      <v-card-title>
        <span class="headline">
          {{ actionType }}
          {{ entity.type | capitalize }}
          <ChipView :entity="editingEntity" />
        </span>
      </v-card-title>
      <v-card-text>
        <v-container grid-list-md>
          <v-layout wrap>
            <v-flex xs12 sm6>
              <v-text-field
                v-model="editingEntity.name"
                label="Name"
                autofocus
                required
                @keyup.enter="save"
              />
            </v-flex>
            <v-flex xs12 sm6>
              <v-autocomplete
                :items="icons"
                v-model="editingEntity.icon"
                label="Icon"
              >
                <template slot="item" slot-scope="data">
                  <v-list-tile-content>
                    <span>
                      <v-icon>{{ data.item }}</v-icon>
                      {{ data.item }}
                    </span>
                  </v-list-tile-content>
                </template>
              </v-autocomplete>
            </v-flex>
            <v-flex xs12 sm12>
              <v-autocomplete
                :items="colors"
                v-model="editingEntity.color"
                label="Background Color"
              >
                <template slot="item" slot-scope="data">
                  <v-list-tile-content :class="[data.item, getColorClass(data.item)]">
                    {{ data.item }}
                  </v-list-tile-content>
                </template>
              </v-autocomplete>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-btn color="error" depressed @click="confirmRemove = true">
          <v-icon>mdi-delete-forever</v-icon>
          Remove
        </v-btn>
        <v-spacer/>
        <v-btn color="secondary darken-2" flat @click.native="show = false">Close</v-btn>
        <v-btn color="secondary darken-2 dialog-save" flat @click.native="save">Save</v-btn>
      </v-card-actions>
    </v-card>

    <v-dialog v-if="confirmRemove" v-model="confirmRemove" hide-overlay max-width="290">
      <v-card>
        <v-card-title class="headline">Are you sure?</v-card-title>
        <v-card-actions>
          <v-spacer/>
          <v-btn color="secondary darken-1" flat="flat" @click="confirmRemove = false">No</v-btn>
          <v-btn color="secondary darken-1" flat="flat" @click="remove">Yes</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>

<script>
import ChipView from './ChipView'
import colors from 'vuetify/es5/util/colors'
import icons from '@/icons.json'
import _ from 'lodash'

export default {
  compontents: { ChipView },

  props: {
    actionType: {
      type: String,
      default: 'Edit',
    },
    entity: {
      type: Object,
      default: () => ({}),
    },
  },

  data () {
    return {
      editingEntity: this.entity,
      show: false,
      icons: icons,
      confirmRemove: false,
    }
  },

  computed: {
    colors () {
      const kebab = (str) => {
        return (str || '').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
      }

      const all = [
        'primary',
        ..._.times(4, i => `primary darken-${i + 1}`),
        ..._.times(4, i => `primary lighten-${i + 1}`),
        'secondary',
        ..._.times(4, i => `secondary darken-${i + 1}`),
        ..._.times(4, i => `secondary lighten-${i + 1}`),
        'accent',
        ..._.times(4, i => `accent darken-${i + 1}`),
        ..._.times(4, i => `accent lighten-${i + 1}`),
      ]
      Object.keys(colors).forEach(key => {
        const kebabKey = kebab(key).toLowerCase()
        Object.keys(colors[key]).forEach(key2 => {
          all.push(`${kebabKey} ${this.convertToClass(key2)}`)
        })
      })
      return all
    },
  },

  beforeCreate () {
    this.$options.components.ChipView = require('./ChipView.vue').default
  },

  methods: {
    endStr (str) {
      return str[str.length - 1]
    },
    convertToClass (str) {
      const end = this.endStr(str)
      const sub = str.substr(0, str.length - 1)
      if (isNaN(parseInt(end))) return str
      return `${sub}-${end}`
    },
    getColorClass (key) {
      if (['white', 'transparent'].includes(key) ||
          key.indexOf('light') > -1
      ) return 'black--text'
      return 'white--text'
    },

    async save () {
      await this.$store.dispatch('entities/save', Object.assign({ type: this.editingEntity.type }, this.editingEntity))

      this.show = false
      if (!this.entity['.key']) {
        for (let k in this.editingEntity) {
          if (k === 'type') { continue }
          this.editingEntity[k] = ''
        }
      }
    },

    open () {
      this.show = true
    },

    remove () {
      this.$store.dispatch('entities/remove', this.entity['.key'])
    },
  },
}
</script>
