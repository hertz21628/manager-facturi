import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

const AdminRoleManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { userRole } = useAuth();

  useEffect(() => {
    if (userRole === 'admin') {
      fetchUsers();
    }
  }, [userRole]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
    setLoading(false);
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: newRole
      });
      alert(`User role updated to ${newRole}`);
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Error updating user role');
    }
  };

  const assignDefaultRoles = async () => {
    setLoading(true);
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      
      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        if (!userData.role) {
          await setDoc(doc(db, 'users', userDoc.id), {
            ...userData,
            role: 'client' // Default to client
          }, { merge: true });
        }
      }
      
      alert('Default roles assigned successfully!');
      fetchUsers();
    } catch (error) {
      console.error('Error assigning default roles:', error);
      alert('Error assigning default roles');
    }
    setLoading(false);
  };

  if (userRole !== 'admin') {
    return <div>Access denied. Admin only.</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>User Role Manager</h1>
      <p>Manage user roles for the application.</p>
      
      <button 
        onClick={assignDefaultRoles}
        disabled={loading}
        style={{
          padding: '10px 20px',
          background: '#6a11cb',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          marginBottom: '20px',
          cursor: 'pointer'
        }}
      >
        {loading ? 'Processing...' : 'Assign Default Roles to All Users'}
      </button>

      <div style={{ marginTop: '20px' }}>
        <h2>Current Users</h2>
        {loading ? (
          <p>Loading users...</p>
        ) : (
          <div>
            {users.map(user => (
              <div 
                key={user.id} 
                style={{
                  border: '1px solid #ddd',
                  padding: '15px',
                  margin: '10px 0',
                  borderRadius: '5px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <strong>{user.name || 'No name'}</strong>
                  <br />
                  <small>{user.email}</small>
                  <br />
                  <span style={{ 
                    color: user.role === 'admin' ? '#28a745' : '#007bff',
                    fontWeight: 'bold'
                  }}>
                    Role: {user.role || 'No role assigned'}
                  </span>
                </div>
                <div>
                  <select
                    value={user.role || ''}
                    onChange={(e) => updateUserRole(user.id, e.target.value)}
                    style={{
                      padding: '5px',
                      marginRight: '10px'
                    }}
                  >
                    <option value="">No Role</option>
                    <option value="admin">Admin</option>
                    <option value="client">Client</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRoleManager; 