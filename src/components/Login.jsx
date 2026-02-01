import { useState } from 'react';
import { Form, Button, Container, Alert, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
//tandhim data ml form ch ne5dem b ndafa!!
export default function Login({ setUser }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
//form submit hanlder fl front (react oui)
  const handleSubmit = async (e) => {
    e.preventDefault();
    //request ll api users+ cookie sent)
    try {
      const response = await fetch('http://localhost/municipality-sdg-tracker/municipality-sdg-tracker/src/api/users.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include', // coockie mawjouda 100%
      });
      //davay!!!!!!!!!!!!!!!!!
      //parse json w ab3tho l debugging
      const data = await response.json();
      console.log('Login response:', data); // Debug
      //login t3da: update l parent component use state w 7ot data f localstorage
      if (response.ok) {
        setUser(data.user); // Use data.user instead of data
        localStorage.setItem('user', JSON.stringify(data.user)); // 5abi userdata barka !!
        //route mt3 react js base 3al role fl base!!
        if (data.user.role === 'municipality_head') {
          navigate('/dashboard');
        } else if (data.user.role === 'worker') {
          navigate('/forms');
        } else if (data.user.role === 'admin') {
          navigate('/users');
        }
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred');
      console.error('Login fetch error:', err);
    }
  };
//react js centre !!!! gamnhaaaa (card container css !!)
//tansech color tabdlo !!(DONE)
  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Card className="shadow-lg p-4" style={{ width: '400px' }}>
        <Card.Body>
          <h2 className="text-center mb-4">Login</h2>
          {error && <Alert variant="danger">{error}</Alert>} 
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </Form.Group>
           
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
              Login
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}