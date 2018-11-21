const Migration = require('./migration')

module.exports = class extends Migration {
  async up () {
    const all = (await this.db.ref().once('value')).val()
    await this.db.ref().set(this.migrateAll(all))
  }

  migrateState (state) {
    if (!state) { return null }

    const entities = state.entities || {}
    const people = state.people
    const roles = state.roles
    const tracks = state.tracks
    const newState = {
      entities,
      lanes: { ...state.lanes },
    }

    for (const key in people) {
      entities[key] = { type: 'person', ...people[key] }
    }

    for (const key in roles) {
      entities[key] = { type: 'role', ...roles[key] }
    }

    for (const key in tracks) {
      entities[key] = { type: 'track', ...tracks[key] }
    }

    return newState
  }

  migrateAll (all) {
    const newAll = { ...all }
    for (const teamName in all.teams) {
      const team = newAll.teams[teamName]
      team.current = this.migrateState(team.current)

      for (const key in team.history) {
        team.history[key] = this.migrateState(team.history[key])
      }
    }
    return newAll
  }
}
