// backend/scripts/createTestUsers.js
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'bib_esprim_db',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

const testUsers = [
  {
    firstName: 'Ahmed',
    lastName: 'Ben Salem',
    email: 'ahmed.bensalem@esprim.tn',
    password: 'student123',
    role: 'student'
  },
  {
    firstName: 'Ahmed',
    lastName: 'Ben Salem',
    email: 'ahmed.bensalem.teacher@esprim.tn',
    password: 'teacher123',
    role: 'teacher'
  },
  {
    firstName: 'Fatma',
    lastName: 'Gharbi',
    email: 'fatma.gharbi@esprim.tn',
    password: 'teacher456',
    role: 'teacher'
  },
  {
    firstName: 'Admin',
    lastName: 'System',
    email: 'admin.system@esprim.tn',
    password: 'admin123',
    role: 'admin'
  },
  {
    firstName: 'Hanen',
    lastName: 'Benmanaa',
    email: 'hanen.benmanaa@esprim.tn',
    password: 'student456',
    role: 'student'
  },
  {
  firstName: 'Leila',
  lastName: 'Trabelsi',
  email: 'leila.trabelsi@esprim.tn',
  password: 'prof123',
  role: 'teacher'
},
{
  firstName: 'Fatma',
  lastName: 'Mansouri',
  email: 'fatma.mansouri@esprim.tn',
  password: 'prof222',
  role: 'teacher'
}

];

async function createTestUsers() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Creating test users...\n');
    
    for (const user of testUsers) {
      // Check if user already exists
      const existingUser = await client.query(
        'SELECT email FROM users WHERE email = $1',
        [user.email]
      );
      
      if (existingUser.rows.length > 0) {
        console.log(`⚠️  User ${user.email} already exists, skipping...`);
        continue;
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      // Insert user
      const result = await client.query(
        `INSERT INTO users (first_name, last_name, email, password, role)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, email, role`,
        [user.firstName, user.lastName, user.email, hashedPassword, user.role]
      );
      
      console.log(`✅ Created user: ${user.email} (${user.role})`);
      console.log(`   Password: ${user.password}`);
      console.log(`   ID: ${result.rows[0].id}\n`);
    }
    
    console.log('✨ All test users created successfully!\n');
    console.log('📝 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    testUsers.forEach(user => {
      console.log(`${user.role.toUpperCase().padEnd(10)} | ${user.email.padEnd(30)} | ${user.password}`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
  } catch (error) {
    console.error('❌ Error creating test users:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

createTestUsers();