import { useContext } from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import { TokenContext } from "../../App";

function DiwaNavBar({ navs }: { navs: { name: string, icon: any, link: string, iconProps?: object, onClick?: any }[] }) {
  const { token, navOption, setNavOption, darkMode } = useContext(TokenContext);
  return (
    <>
    {token !== null ?
    <Navbar bg={darkMode?"secondary":"dark"} variant={darkMode?"ligh":"dark"} expand="lg" collapseOnSelect fixed="bottom" data-testid="navbar-parent" className="translucent-navbar">
        <Container>
          {navs.map((nav) => {
            return (
              <Nav.Link
                className={`fs-5 text-center ${navOption === nav.name ? 'text-danger' : 'text-color'}`}
                key={nav.name}
                href={`#${nav.name}`}
                data-testid="nav-item"
                onClick={() => { if (!nav.onClick) {
                  setNavOption(nav.name);
                } else {
                  nav.onClick();
                }}}>
                  <nav.icon style={{ marginTop: -4, marginRight: 4 }} {...nav.iconProps} data-testid={`nav-icon-${nav.name}`}/>
                  <p className="small" style={{ marginTop: -4 }} data-testid={`nav-text-${nav.name}`}>{nav.name}</p>
              </Nav.Link>
            )
          })}
        </Container>
    </Navbar> : ''}
    </>);
}

export default DiwaNavBar;