// Utility script to migrate existing users to have roles
// This can be run once to assign roles to existing users

import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const migrateExistingUsers = async () => {
  try {
    // Get all users from the users collection
    const usersSnapshot = await getDocs(collection(db, 'users'));
    
    usersSnapshot.forEach(async (userDoc) => {
      const userData = userDoc.data();
      
      // If user doesn't have a role, assign one based on email or other criteria
      if (!userData.role) {
        // You can implement your own logic here to determine if a user is admin or client
        // For now, we'll assign 'client' as default
        await setDoc(doc(db, 'users', userDoc.id), {
          ...userData,
          role: 'client'
        }, { merge: true });
        
        console.log(`Assigned role 'client' to user: ${userData.email}`);
      }
    });
    
    console.log('User migration completed');
  } catch (error) {
    console.error('Error migrating users:', error);
  }
}; 