import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, Smartphone, Send, Activity, BarChart3 } from 'lucide-react';

function Navbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-brand">
          <Bell size={28} />
          PushNotify Dashboard
        </Link>
        
        <ul className="navbar-nav">
          <li>
            <Link 
              to="/" 
              className={isActive('/') ? 'active' : ''}
            >
              <BarChart3 size={16} />
              Dashboard
            </Link>
          </li>
          <li>
            <Link 
              to="/devices" 
              className={isActive('/devices') ? 'active' : ''}
            >
              <Smartphone size={16} />
              Devices
            </Link>
          </li>
          <li>
            <Link 
              to="/send" 
              className={isActive('/send') ? 'active' : ''}
            >
              <Send size={16} />
              Send Notification
            </Link>
          </li>
          <li>
            <Link 
              to="/history" 
              className={isActive('/history') ? 'active' : ''}
            >
              <Activity size={16} />
              History
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;