/**
 * Database Seeding Script
 *
 * This script can be run to seed the Firestore database with permanent projects.
 * Run with: npx tsx scripts/seedDatabase.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { seedPermanentProjects } from '../src/lib/seedProjects';

// Firebase configuration - you'll need to add your config here
const firebaseConfig = {
  // Add your Firebase config here
  // apiKey: "your-api-key",
  // authDomain: "your-auth-domain",
  // projectId: "your-project-id",
  // storageBucket: "your-storage-bucket",
  // messagingSenderId: "your-messaging-sender-id",
  // appId: "your-app-id"
};

async function main() {
  try {
    console.log('🚀 Starting database seeding...');

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    console.log('✅ Firebase initialized');

    // Seed the projects
    const count = await seedPermanentProjects();

    console.log(`🎉 Successfully seeded ${count} projects!`);
    console.log('✅ Database seeding complete!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the script
main();