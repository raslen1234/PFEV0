import { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Table, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash } from 'react-icons/fa';

export default function Users({ user }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('worker');
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState('worker');
  const navigate = useNavigate();

  // Check if user is admin, redirect if not
  if (!user || user.role !== 'admin') {
    navigate('/');
  }

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost/municipality-sdg-tracker/municipality-sdg-tracker/src/api/users.php', {
          method: 'GET',
          credentials: 'include',
        });
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error('Invalid response format');
        setUsers(data);
      } catch (err) {
        setError('Failed to load users: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await fetch('http://localhost/municipality-sdg-tracker/municipality-sdg-tracker/src/api/users.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', username, password, role }),
        credentials: 'include',
      });
      const data = await response.json();
      console.log('Fetch response:', data);
      if (response.ok) {
        setMessage('User added successfully!');
        setUsername('');
        setPassword('');
        setRole('worker');
        // Refresh user list
        const updatedResponse = await fetch('http://localhost/municipality-sdg-tracker/municipality-sdg-tracker/src/api/users.php', {
          method: 'GET',
          credentials: 'include',
        });
        const updatedData = await updatedResponse.json();
        setUsers(updatedData);
      } else {
        setMessage(`Error: ${data.error || 'An unknown error occurred'}`);
      }
    } catch (err) {
      setMessage('An error occurred while adding the user. Check server logs.');
      console.error('Fetch error:', err);
    }
  };

  const handleDelete = async (userId) => {
    try {
      const response = await fetch(`http://localhost/municipality-sdg-tracker/municipality-sdg-tracker/src/api/users.php?id=${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) {
        setUsers(users.filter((u) => u.user_id !== userId));
        setMessage('User deleted successfully!');
      } else {
        setMessage(`Error: ${data.error || 'Failed to delete user'}`);
      }
    } catch (err) {
      setMessage('An error occurred while deleting the user.');
      console.error('Delete error:', err);
    }
  };

  const handleEdit = (user) => {
    setEditUser(user);
    setEditUsername(user.username);
    setEditPassword(''); // Leave blank; user can optionally set a new password
    setEditRole(user.role);
    setShowEditModal(true);
  };

  const handleEditSubmit = async () => {
    try {
      const response = await fetch(`http://localhost/municipality-sdg-tracker/municipality-sdg-tracker/src/api/users.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: editUser.user_id,
          username: editUsername,
          password: editPassword, // Will be ignored if empty
          role: editRole,
        }),
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) {
        setUsers(
          users.map((u) =>
            u.user_id === editUser.user_id ? { ...u, username: editUsername, role: editRole } : u
          )
        );
        setMessage('User updated successfully!');
        setShowEditModal(false);
        setEditUser(null);
        setEditUsername('');
        setEditPassword('');
        setEditRole('worker');
      } else {
        setMessage(`Error: ${data.error || 'Failed to update user'}`);
      }
    } catch (err) {
      setMessage('An error occurred while updating the user.');
      console.error('Update error:', err);
    }
  };

  return (
    <Container className="my-5" style={{ backgroundColor: '#ADD8E6', padding: '20px', borderRadius: '5px' }}>
      <h2 style={{ color: '#000', textAlign: 'center' }}>Manage Users</h2>
      {message && <Alert variant={message.includes('Error') ? 'danger' : 'success'}>{message}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="formUsername">
          <Form.Label style={{ color: '#000' }}>Username</Form.Label>
          <Form.Control
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formPassword">
          <Form.Label style={{ color: '#000' }}>Password</Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formRole">
          <Form.Label style={{ color: '#000' }}>Role</Form.Label>
          <Form.Select value={role} onChange={(e) => setRole(e.target.value)} required>
            <option value="worker">Worker</option>
            <option value="municipality_head">Municipality Head</option>
            <option value="admin">Admin</option>
          </Form.Select>
        </Form.Group>
        <Button variant="outline-dark" type="submit">
          Add User
        </Button>
      </Form>

      <h3 className="mt-4" style={{ color: '#000', textAlign: 'center' }}>User List</h3>
      {loading ? (
        <p style={{ color: '#000', textAlign: 'center' }}>Loading users...</p>
      ) : error ? (
        <p style={{ color: '#000', textAlign: 'center' }}>{error}</p>
      ) : users.length === 0 ? (
        <p style={{ color: '#000', textAlign: 'center' }}>No users found.</p>
      ) : (
        <Table striped bordered hover responsive className="mt-3">
          <thead>
            <tr>
              <th>Username</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.user_id}>
                <td>{user.username}</td>
                <td>{user.role}</td>
                <td>
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={() => handleEdit(user)}
                    className="me-2"
                  >
                    <FaEdit /> Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(user.user_id)}
                  >
                    <FaTrash /> Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Edit User Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>New Password (leave blank to keep unchanged)</Form.Label>
              <Form.Control
                type="password"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select value={editRole} onChange={(e) => setEditRole(e.target.value)} required>
                <option value="worker">Worker</option>
                <option value="municipality_head">Municipality Head</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleEditSubmit}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}