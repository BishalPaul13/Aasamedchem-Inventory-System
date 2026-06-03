const crypto = require('node:crypto');
require('./env');
const { neon } = require('@neondatabase/serverless');

const PASSWORD_ITERATIONS = 120000;

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, PASSWORD_ITERATIONS, 32, 'sha256').toString('hex');
  return `pbkdf2$${PASSWORD_ITERATIONS}$${salt}$${hash}`;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required');
  }
  const sql = neon(process.env.DATABASE_URL);

  await sql`
    INSERT INTO users (name, email, password_hash, role)
    VALUES
      ('Admin', 'admin@example.com', ${hashPassword('Admin@12345')}, 'admin'),
      ('Seller', 'seller@example.com', ${hashPassword('Seller@12345')}, 'seller'),
      ('Buyer', 'buyer@example.com', ${hashPassword('Buyer@12345')}, 'buyer')
    ON CONFLICT (email) DO UPDATE
      SET name = EXCLUDED.name,
          password_hash = EXCLUDED.password_hash,
          role = EXCLUDED.role
  `;

  await sql`
    INSERT INTO products (sku, name, category, description, dimension, base_unit, inventory_base_quantity, price_per_base_unit_inr)
    VALUES
      ('CHEM-NA-001', 'Sodium Chloride', 'Salts', 'Analytical grade sodium chloride.', 'weight', 'g', 250000.000000000000, 0.420000000000),
      ('SOL-IPA-001', 'Isopropyl Alcohol', 'Solvents', 'Laboratory solvent, 99.8%.', 'volume', 'mL', 180000.000000000000, 0.180000000000),
      ('KIT-PH-001', 'pH Indicator Strips', 'Consumables', 'Packaged indicator strip unit.', 'count', 'unit', 5000.000000000000, 12.500000000000),
      ('CHEM-GLY-001', 'Glycerol', 'Solvents', 'Viscous liquid reagent.', 'volume', 'mL', 65000.000000000000, 0.260000000000),
      ('CHEM-CIT-001', 'Citric Acid', 'Acids', 'Food and pharma grade crystalline powder.', 'weight', 'g', 90000.000000000000, 0.950000000000)
    ON CONFLICT (sku) DO UPDATE
      SET name = EXCLUDED.name,
          category = EXCLUDED.category,
          description = EXCLUDED.description,
          dimension = EXCLUDED.dimension,
          base_unit = EXCLUDED.base_unit,
          inventory_base_quantity = EXCLUDED.inventory_base_quantity,
          price_per_base_unit_inr = EXCLUDED.price_per_base_unit_inr,
          updated_at = now()
  `;

  console.log('Seed data inserted.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
