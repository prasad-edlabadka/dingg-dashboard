import { Container, Navbar } from "react-bootstrap";
import logo from './logo.png';

function DinggNav() {
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand href="#home"><img
              alt=""
              src={logo}
              width="32"
              height="32"
              className="d-inline-block align-top"
            />{' '} Owner's Dashboard</Navbar.Brand>
        {/* <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="#home">Coming Soon...</Nav.Link>
          </Nav>
        </Navbar.Collapse> */}
      </Container>
    </Navbar>
  );
}

export default DinggNav;