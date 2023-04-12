import { Container, Nav, Navbar } from "react-bootstrap";
import * as Icon from 'react-bootstrap-icons';
import { faIndianRupeeSign, faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext } from "react";
import { TokenContext } from "../App";

function DinggNav() {
  const {token, updateToken, navOption, setNavOption} = useContext(TokenContext);
  return (
    <Navbar bg="dark" variant="dark" expand="lg" collapseOnSelect fixed="bottom">
      {token !== null?
      <Container>
        <Nav.Link className={`fs-5 text-center ${navOption === 'home' ? 'text-danger' : 'text-white'}`} href="#home" onClick={() => setNavOption('home')}><Icon.HouseDoor style={{ marginTop: -4, marginRight: 4 }} /><p className="small" style={{ marginTop: -4 }}>Home</p></Nav.Link>
        <Nav.Link className={`fs-5 text-center ${navOption === 'products' ? 'text-danger' : 'text-white'}`} href="#home" onClick={() => setNavOption('products')}><Icon.CartCheck style={{ marginTop: -4, marginRight: 4 }} /><p className="small" style={{ marginTop: -4 }}>Products</p></Nav.Link>
        <Nav.Link className={`fs-5 text-center ${navOption === 'finance' ? 'text-danger' : 'text-white'}`} href="#home" onClick={() => setNavOption('finance')}><FontAwesomeIcon icon={faIndianRupeeSign} style={{ marginTop: -4, marginRight: 4 }} /><p className="small" style={{ marginTop: -4 }}>Finance</p></Nav.Link>
        <Nav.Link className={`fs-5 text-center ${navOption === 'staff' ? 'text-danger' : 'text-white'}`} href="#home" onClick={() => setNavOption('staff')}><FontAwesomeIcon icon={faUsers} style={{ marginTop: -4, marginRight: 4 }} /><p className="small" style={{ marginTop: -4 }}>Staff</p></Nav.Link>
        <Nav.Link className={`fs-5 text-center ${navOption === 'reload' ? 'text-danger' : 'text-white'}`} href="#home" onClick={() => window.location.reload()}><Icon.ArrowClockwise style={{ marginTop: -4, marginRight: 4 }} /><p className="small" style={{ marginTop: -4 }}>Reload</p></Nav.Link>
        <Nav.Link className={`fs-5 text-center ${navOption === 'logout' ? 'text-danger' : 'text-white'}`} href="#home" onClick={() => updateToken(null)}><Icon.Power style={{ marginTop: -4, marginRight: 4 }} /><p className="small" style={{ marginTop: -4 }}>Logout</p></Nav.Link>
      </Container>:''}
    </Navbar>
  );
}

export default DinggNav;