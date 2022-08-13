import { Container, Nav, Navbar } from "react-bootstrap";

function DinggNav() {
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand href="#home"><img
              alt=""
              src="./dingg-dashboard/logo.png"
              width="32"
              height="32"
              className="d-inline-block align-top"
            />{' '}Salon Reports</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="#home">Coming Soon...</Nav.Link>
            {/* <Nav.Link href="#link">TBD</Nav.Link> */}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default DinggNav;