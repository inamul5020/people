import { createAdminUser, initializeDefaultAdmin } from '../lib/dbAuth';

async function setupAdmin() {
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'admin123';

  console.log('Setting up admin user...');
  console.log(`Username: ${username}`);
  
  const result = await createAdminUser(username, password);
  
  if (result.success) {
    console.log('✓ Admin user created/updated successfully!');
    process.exit(0);
  } else {
    console.error('✗ Failed to create admin user:', result.error);
    process.exit(1);
  }
}

setupAdmin();

