import { NavLink } from 'react-router-dom'
import { IconButton, Nav, Navbar } from 'rsuite'
import { useAuth } from '../../contexts/AuthContext';
import { FaHome, FaCog, FaSignOutAlt, FaUser, FaChartBar, FaCheckSquare, FaUpload } from 'react-icons/fa';
import './MainNavigation.css';

function MainNavigation() {
  const { user, signOut } = useAuth()

  const handleLogout = () => {
    signOut()
  }

  return (
    <Navbar appearance='inverse'>
      <Navbar.Brand to={'/'} as={NavLink}>Trading Journal</Navbar.Brand>
      <Nav>
        <Nav.Item as={NavLink} to="/" icon={<FaHome />}>Home</Nav.Item>
        <Nav.Item as={NavLink} to="/manage-entities" icon={<FaCog />}>Manage Entities</Nav.Item>
        <Nav.Item as={NavLink} to="/closed-trades" icon={<FaCheckSquare />}>Closed Trades</Nav.Item>
        <Nav.Item as={NavLink} to="/report" icon={<FaChartBar />}>Trade Report</Nav.Item>
        <Nav.Item as={NavLink} to="/upload-data" icon={<FaUpload />}>Upload Data</Nav.Item>
      </Nav>
      <Nav pullRight>
        <Nav.Item>
          <IconButton size='sm' onClick={handleLogout} appearance='primary' icon={<FaSignOutAlt />}>Logout</IconButton>
        </Nav.Item>
        {user && <Nav.Item icon={<FaUser />}><p>{user?.email}</p></Nav.Item>}
      </Nav>
    </Navbar>
  );
}

export default MainNavigation;