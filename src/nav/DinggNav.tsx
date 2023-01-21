import { Container, Nav, Navbar } from "react-bootstrap";
import logo from './logo.png';

function DinggNav({ token, setToken, navOption, setNavOption }: { token: string | null, setToken: any, navOption: string | null, setNavOption: any }) {
  return (
    <Navbar bg="dark" variant="dark" expand="lg" collapseOnSelect>
      <Container>
        <Navbar.Brand href="#home" className="evergreen"><img
          alt=""
          src={logo}
          width="32"
          height="32"
          className="d-inline-block align-top"
        />{' '} Owner's Dashboard</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        {token !== null ?
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="#home" onClick={() => setNavOption('home')}>Home</Nav.Link>
              <Nav.Link href="#home" onClick={() => setNavOption('products')}>Products</Nav.Link>
              <Nav.Link href="#home" onClick={() => setNavOption('finance')}>Finance</Nav.Link>
              <Nav.Link href="#home" onClick={() => setToken(null)}>Logout</Nav.Link>
            </Nav>
          </Navbar.Collapse> : ''
        }

      </Container>
    </Navbar>
  );
}

export default DinggNav;