import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Forms from './components/Forms';
import Dashboard from './components/Dashboard';
import Users from './components/Users';
import Nav from './components/Nav';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
//main componenet appjsx
function App() {
  // do user state with localStorage value 
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
     //  sync user state with localStorage(kol chy front wkhw )
    console.log('App.jsx: user state updated:', user); // Log user state
    if (user) {
      localStorage.setItem('user', JSON.stringify(user)); //CLEAAAAR
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  return (
    //render nav bar 
    <Router>
      {user && <Nav user={user} setUser={setUser} />}
      <Routes>
        <Route path="/" element={<Login setUser={setUser} />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route
          path="/forms"
          element={user ? <Forms user={user} /> : <Login setUser={setUser} />}
        />
        <Route
          path="/dashboard"
          element={user ? <Dashboard user={user} /> : <Login setUser={setUser} />}
        />
        <Route
          path="/users"
          element={
            user && user.role === 'admin' ? (
              <Users user={user} />
            ) : (
              <Login setUser={setUser} /> //raja llogin ken mch admin(front localstorage)
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;