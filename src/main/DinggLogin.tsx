import { useContext, useEffect, useRef, useState } from "react";
import { Alert, Button, Col, Container, Form, Image, Row } from "react-bootstrap";
import { TokenContext } from "../App";
import DiwaCard from "../components/card/DiwaCard";
import { faSun, faMoon } from "@fortawesome/free-regular-svg-icons";
import logo from "./logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function DinggLogin() {
  const apiURL = "https://api.dingg.app/api/v1/vendor/login";
  const phoneRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const { updateToken, setEmployeeName, setLocation } = useContext(TokenContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [initialUserId, setInitialUserId] = useState(localStorage.getItem("userId") || "");
  const [initialPassword, setInitialPassword] = useState(localStorage.getItem("password") || "");
  const handleClick = () => {
    setLoading(true);
    const userid = phoneRef.current?.value || "";
    const password = passwordRef.current?.value || "";
    login(userid, password);
  };

  const login = (userId: string, password: string) => {
    setLoading(true);
    const requestMetadata = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ isWeb: false, password: password, fcm_token: "", mobile: "91" + userId }),
    };
    fetch(apiURL, requestMetadata)
      .then((res) => res.json())
      .then((resp) => {
        if (resp.success) {
          updateToken(resp.token);
          setEmployeeName(resp.data.employee.name);
          setLocation(`${resp.data.vendor_locations[0].business_name} - ${resp.data.vendor_locations[0].locality}`);
          setLoading(false);
          localStorage.setItem("userId", userId || "");
          localStorage.setItem("password", password || "");
        } else {
          setError(resp.message);
          setLoading(false);
          localStorage.setItem("userId", "");
          localStorage.setItem("password", "");
        }
      })
      .catch((err) => {
        console.log(err);
        setError(err.message);
        setLoading(false);
        localStorage.setItem("userId", "");
        localStorage.setItem("password", "");
      });
  };

  const localDarkMode = localStorage.getItem("darkMode");
  const localAutoLogin = localStorage.getItem("autoLogin");
  const [darkMode, setDarkMode] = useState(
    localDarkMode ? localDarkMode.toLowerCase() === "true" : window.matchMedia("(prefers-color-scheme: dark)").matches
  );
  const [autoLogin, setAutoLogin] = useState(localAutoLogin ? localAutoLogin.toLowerCase() === "true" : false);
  const [neverChange] = useState(0);
  const darkModeHandler = (e: MediaQueryListEvent) => {
    console.log("Dark mode is " + (e.matches ? "on" : "off"));
    setDarkMode(e.matches);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem("darkMode", (!darkMode).toString());
  };

  const toggleAutoLogin = () => {
    setAutoLogin(!autoLogin);
    localStorage.setItem("autoLogin", (!autoLogin).toString());
  };

  useEffect(() => {
    console.log("Setting color mode in Login...");
    darkMode ? document.body.classList.add("dark") : document.body.classList.remove("dark");
  }, [darkMode]);

  useEffect(() => {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", darkModeHandler);
    if (autoLogin && initialUserId !== "" && initialPassword !== "") {
      handleClick();
    }
  }, [neverChange]);
  return (
    <Container fluid>
      <Row>
        <Col xs={12} md={5} className="me-5">
          <DiwaCard varient="pink" loadingTracker={false}>
            <h2 className="text-color">Login</h2>
            <Form>
              <Form.Group className="mb-3" controlId="phone">
                <Form.Label className="text-color">Mobile Number</Form.Label>
                <Form.Control
                  type="tel"
                  placeholder="Enter phone number"
                  ref={phoneRef}
                  value={initialUserId}
                  onChange={(e) => setInitialUserId(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="password">
                <Form.Label className="text-color">Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Password"
                  ref={passwordRef}
                  value={initialPassword}
                  onChange={(e) => setInitialPassword(e.target.value)}
                />
              </Form.Group>
              <Row>
                <Col xs="8" className="d-flex align-items-center">
                  <Button
                    variant="primary"
                    type="button"
                    className="bg-danger border-0 bg-color-diwa"
                    onClick={handleClick}
                    disabled={loading}
                  >
                    {loading ? "Please wait..." : "Login"}
                  </Button>
                  <span className="d-inline ">
                    <Form.Check // prettier-ignore
                      type="checkbox"
                      id="auto-login-mode-switch"
                      className={`form-control-lg pe-0 login-check`}
                      checked={autoLogin}
                      onChange={toggleAutoLogin}
                    />
                  </span>
                  <span className="d-inline text-color ps-2">Remember me</span>
                </Col>
                <Col xs="4" className="d-flex justify-content-end align-items-center">
                  <span className="d-inline pe-2 text-color">
                    <FontAwesomeIcon icon={faSun} className="text-color" />
                  </span>
                  <span className="d-inline">
                    <Form.Check // prettier-ignore
                      type="switch"
                      id="dark-mode-switch"
                      className="form-control-lg pe-0"
                      checked={darkMode}
                      onChange={toggleDarkMode}
                    />
                  </span>
                  <span className="d-inline text-color">
                    <FontAwesomeIcon icon={faMoon} className="text-color" />
                  </span>
                </Col>
              </Row>
              {/* <Row>
                                <Col xs="8" className="d-flex justify-content-start align-items-center">
                                    <span className="d-inline">
                                        <Form.Check // prettier-ignore
                                            type="checkbox"
                                            id="auto-login-mode-switch"
                                            className="form-control-lg pe-0"
                                            checked={autoLogin}
                                            onChange={toggleAutoLogin}
                                        />
                                    </span>
                                    <span className="d-inline text-color ps-2">Auto login?</span>
                                </Col>

                            </Row> */}

              {error !== "" && (
                <Alert variant="danger" className="mt-3">
                  {error}
                </Alert>
              )}
              {/* <p className="text-danger">{error}</p>} */}
            </Form>
          </DiwaCard>
        </Col>
        <Col
          xs={0}
          md={1}
          className="separator mt-4"
          style={{
            maxWidth: 1,
            minWidth: 1,
            borderWidth: 1,
            padding: 0,
            // marginLeft: 50,
            // marginRight: 50,
          }}
        ></Col>
        <Col sm={12} md={6} className="mt-xs-4">
          <Image src={logo} fluid className="mt-4 d-block mx-auto" style={{ maxWidth: "60%" }} />
          <p className="small text-color text-center mt-1 mx-auto" style={{ maxWidth: "60%" }}>
            &copy; 2023, All Rights Reserverd.
          </p>
        </Col>
      </Row>
      {/* <Row xs={12} md={8}>
        <Row className="mt-4"></Row>
        <Row className="mt-4"></Row>
      </Row> */}
    </Container>
  );
}
export default DinggLogin;
