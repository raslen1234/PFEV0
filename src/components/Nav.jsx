import { Navbar, Nav as BootstrapNav, Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export default function Nav({ user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <Navbar
      expand="lg"
      className="mb-4"
      style={{ backgroundColor: '#ADD8E6' }}
    >
      <Container>
        <Navbar.Brand href="#" style={{ color: '#000' }}>
          Waste Management Tracker
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <BootstrapNav className="me-auto">
            {user && user.role === 'municipality_head' && (
              <>
                <BootstrapNav.Link href="/dashboard" style={{ color: '#000' }}>
                  Dashboard
                </BootstrapNav.Link>
                <BootstrapNav.Link href="/forms" style={{ color: '#000' }}>
                  Forms
                </BootstrapNav.Link>
              </>
            )}
            {user && user.role === 'admin' && (
              <BootstrapNav.Link href="/users" style={{ color: '#000' }}>
                Users
              </BootstrapNav.Link>
            )}
            {user && user.role === 'worker' && null} {/* famch link ll worker !!!! */}
          </BootstrapNav>
          {user && (
            <Button variant="outline-dark" onClick={handleLogout}>
              Logout
            </Button>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}