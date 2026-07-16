import { seedDatabase } from "../src/lib/dbSeed";

async function main() {
  console.log("Running manual database seed...");
  const result = await seedDatabase();
  console.log(result.message);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
