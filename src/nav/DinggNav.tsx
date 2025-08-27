import * as Icon from "react-bootstrap-icons";
import { faIndianRupeeSign, faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext } from "react";
import { TokenContext } from "../App";
// import DiwaNavBar from "../components/nav/DiwaNavBar";
import ModernNavBar from "../components/nav/ModernNavBar";

function DinggNav() {
  const { updateToken } = useContext(TokenContext);
  const navs = [
    { name: "home", icon: Icon.HouseDoor, link: "#home" },
    { name: "products", icon: Icon.CartCheck, link: "#home" },
    { name: "finance", icon: FontAwesomeIcon, link: "#home", iconProps: { icon: faIndianRupeeSign } },
    { name: "staff", icon: FontAwesomeIcon, link: "#home", iconProps: { icon: faUsers } },
    { name: "reload", icon: Icon.ArrowClockwise, link: "#home", onClick: () => window.location.reload() },
    {
      name: "logout",
      icon: Icon.Power,
      link: "#home",
      onClick: () => {
        updateToken(null);
        localStorage.setItem("autoLogin", "false");
      },
    },
  ];
  return <ModernNavBar navs={navs} />;
}

export default DinggNav;
