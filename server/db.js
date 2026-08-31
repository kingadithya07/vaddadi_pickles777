// Tiny JSON-file backed datastore. Keeps the project dependency free
// while still persisting users, orders and catalogue edits across restarts.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { products } from './data/seed.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const defaults = () => ({
  users: [
    {
      id: 'u-admin',
      name: 'Vaddadi Admin',
      email: 'admin@vaddadipickles.in',
      phone: '9876543210',
      passwordHash: bcrypt.hashSync('admin123', 8),
      role: 'admin',
      addresses: [],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'u-demo',
      name: 'Sita Rama Raju',
      email: 'customer@vaddadipickles.in',
      phone: '9000012345',
      passwordHash: bcrypt.hashSync('customer123', 8),
      role: 'customer',
      addresses: [
        {
          id: 'a-demo-1',
          label: 'Home',
          name: 'Sita Rama Raju',
          phone: '9000012345',
          line1: '12-4-19, Danavaipeta',
          line2: 'Near Gowtami Ghat',
          landmark: 'Opposite ISKCON temple',
          pincode: '533101',
          city: 'Rajahmundry',
          district: 'East Godavari',
          state: 'Andhra Pradesh',
          isDefault: true,
        },
      ],
      createdAt: new Date().toISOString(),
    },
  ],
  products: JSON.parse(JSON.stringify(products)),
  orders: [],
  coupons: [
    { code: 'VADDADI10', type: 'percent', value: 10, minOrder: 500, active: true },
    { code: 'FREESHIP', type: 'shipping', value: 0, minOrder: 799, active: true },
  ],
});

let db;

function load() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (fs.existsSync(DB_FILE)) {
    try {
      db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      return;
    } catch {
      /* corrupt file -> reseed */
    }
  }
  db = defaults();
  save();
}

export function save() {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

export function get() {
  if (!db) load();
  return db;
}

export function resetDb() {
  db = defaults();
  save();
  return db;
}

export const uid = (prefix) =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

load();
