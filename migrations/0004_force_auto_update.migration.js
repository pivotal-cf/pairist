const Migration = require('./migration')

module.exports = class extends Migration {
  async up () {
    // here to bump version to 4
    // (force clients to reload their pages)
  }
}
