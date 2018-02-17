#!/usr/bin/env node

require("colors")
const fs = require("fs")
const path = require("path")

const envs = JSON.parse(fs.readFileSync(path.join(path.basename(__dirname), "..", ".firebaserc"))).projects

const env = envs[process.argv[process.argv.length - 1]]

if (!env) {
  console.error("No environment configured. ".red)
  console.error("Pass in valid environment name as argument to migration runner.".red)
  let errorString = "Value given (".red
  errorString += process.argv[process.argv.length - 1].bold.yellow
  errorString += ") not found in ".red
  errorString += Object.keys(envs).map(e => e.bold.yellow).join(", ".red)
  errorString += ". Aborting...".red
  console.error(errorString)
  process.exit(1)
}

console.log(`Running migrations for ${env.bold}...`.green)

const admin = require("firebase-admin")
var serviceAccount = require(`${process.env.HOME}/.secrets/${env}-service-account.json`)
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${env}.firebaseio.com`,
})

const db = admin.database()

const migrationsDir = path.basename(__dirname)
const migrations = []

fs.readdirSync(migrationsDir).forEach(file => {
  if (file.match(/^\d{4}_.*\.migration\.js$/)) {
    const name = file.replace(".migration.js", "")
    const Migration = require("./" + name)
    const migration = new Migration(db)
    const version = parseInt(name.split("_")[0])
    migrations.push({ name, migration, version })
  }
})

const up = async () => {
  let currentSchema = (await db.ref("/schema/version").once("value")).val()
  const targetVersion = migrations[migrations.length - 1].version
  if (currentSchema) {
    const message = "Current schema version: ".blue
    + currentSchema.toString().yellow.bold
    + ", targetVersion: ".blue
    + targetVersion.toString().green.bold
    + ".".blue
    console.log(message)

    if (targetVersion === currentSchema) {
      console.log("Versions match, schema up to date :)".green)
      process.exit()
    }
  } else {
    console.log("No schema version found, starting from scratch (no data will be lost)...".yellow)
    currentSchema = 0
  }

  await db.ref("/schema/migrating").set(true)

  migrations.forEach(async ({ name, migration, version }) => {
    if (version <= currentSchema) { return }
    process.stdout.write(`Running ${name.blue}...`)
    await migration.up()
    process.stdout.write(" Done!\n".green)
    await db.ref("/schema/version").set(version)
  })

  await db.ref("/schema/migrating").set(false)
  console.log("SUCCESS".green)

  process.exit()
}

up()
