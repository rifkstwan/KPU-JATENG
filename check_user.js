const { PrismaClient } = require("@prisma/client")
const { PrismaPg } = require("@prisma/adapter-pg")
const { Client } = require("pg")
const bcrypt = require("bcryptjs")
require("dotenv").config()

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()
  const adapter = new PrismaPg(client)
  const prisma = new PrismaClient({ adapter })

  const users = await prisma.user.findMany()
  console.log("=== USERS IN DATABASE ===")
  for (const u of users) {
    console.log(`Email: ${u.email}, Role: ${u.role}, Name: ${u.nama}`)
  }
  await client.end()
}

main().catch(console.error)
