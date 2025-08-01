import { Col, Container, Row } from "react-bootstrap";
import DinggLogin from "./DinggLogin";
import ProductTiles from "./ProductTiles";
import Tiles from "./Tiles";
import FinanceTiles from "./FinanceTiles";
import StaffTiles from "./StaffTiles";
import { useContext } from "react";
import { TokenContext } from "../App";
import DiwaCard from "../components/card/DiwaCard";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faSun, faMoon } from "@fortawesome/free-regular-svg-icons";

function Main() {
  const { token, navOption, employeeName, location } = useContext(TokenContext) as {
    token: string;
    navOption: "home" | "products" | "finance" | "staff";
    employeeName: string;
    location: string;
  };
  const screens = {
    home: Tiles,
    products: ProductTiles,
    finance: FinanceTiles,
    staff: StaffTiles,
  };
  // const [darkMode, setDarkMode] = useState(document.body.classList.contains('dark'));

  // const toggleDarkMode = () => {
  //     setDarkMode(!darkMode);
  //     !darkMode ? document.body.classList.add('dark') : document.body.classList.remove('dark');
  //     // localStorage.setItem("darkMode", (!darkMode).toString());
  // };

  if (!token) {
    return (
      <Container>
        <Row>
          <Col style={{ height: 40 }}></Col>
        </Row>
        <DinggLogin />
      </Container>
    );
  }
  const SelectedScreen = screens[navOption || "home"] || Tiles;

  return (
    <Container>
      <DiwaCard varient="pink" loadingTracker={false}>
        <h4 className="mb-0 text-color">
          Welcome {employeeName}
          <p className="small mb-0">To {location}</p>
        </h4>
      </DiwaCard>
      {/* <DiwaCard varient="pink" loadingTracker={false}>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7257035382036921"
          crossOrigin="anonymous"
        ></script>
      </DiwaCard> */}
      {<SelectedScreen />}
    </Container>
  );
}

export default Main;
