import { Col, Container, Row } from "react-bootstrap";
// import DinggLogin from "./DinggLogin";
import ProductTiles from "./ProductTiles";
import Tiles from "./Tiles";
import FinanceTiles from "./FinanceTiles";
import StaffTiles from "./StaffTiles";
import { useCallback, useContext, useEffect, useState } from "react";
import { TokenContext } from "../App";
import DiwaCard from "../components/card/DiwaCard";
import LoginModern from "./LoginModern";
import { faMoon, faSun } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
  const localDarkMode = localStorage.getItem("darkMode");

  const [darkMode, setDarkMode] = useState(
    localDarkMode ? localDarkMode.toLowerCase() === "true" : window.matchMedia("(prefers-color-scheme: dark)").matches
  );
  const darkModeHandler = useCallback((e: MediaQueryListEvent) => {
    setDarkMode(e.matches);
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prevMode) => {
      const newMode = !prevMode;
      localStorage.setItem("darkMode", newMode.toString());
      return newMode;
    });
  }, []);

  useEffect(() => {
    darkMode ? document.body.classList.add("dark") : document.body.classList.remove("dark");
  }, [darkMode]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", darkModeHandler);

    return () => {
      mediaQuery.removeEventListener("change", darkModeHandler);
    };
  }, [darkModeHandler]);

  // const [darkMode, setDarkMode] = useState(document.body.classList.contains('dark'));

  // const toggleDarkMode = () => {
  //     setDarkMode(!darkMode);
  //     !darkMode ? document.body.classList.add('dark') : document.body.classList.remove('dark');
  //     // localStorage.setItem("darkMode", (!darkMode).toString());
  // };

  if (!token) {
    return (
      <Container className="main-container">
        <Row>
          <Col style={{ height: 40 }}></Col>
        </Row>
        <LoginModern />
      </Container>
    );
  }
  const SelectedScreen = screens[navOption || "home"] || Tiles;

  return (
    <Container className="main-container">
      <DiwaCard varient="primary" loadingTracker={false} className="top-card glass-panel">
        <h2 className="panel-title text-color">
          Welcome {employeeName}
          <p className="small mb-0 fw-normal">To {location}</p>
        </h2>
        <div className="theme-toggle" aria-label="Theme">
          <button type="button" className="theme-toggle__btn" onClick={toggleDarkMode} aria-pressed={darkMode}>
            <FontAwesomeIcon icon={darkMode ? faMoon : faSun} />
            {/* <span className="theme-toggle__txt"></span> */}
          </button>
        </div>
        {<SelectedScreen />}
      </DiwaCard>
      {/* <DiwaCard varient="pink" loadingTracker={false}>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7257035382036921"
          crossOrigin="anonymous"
        ></script>
      </DiwaCard> */}
    </Container>
  );
}

export default Main;
