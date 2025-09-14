// DinggLogin.tsx  — visual overhaul only; logic unchanged
import { useContext, useEffect, useRef, useState, useCallback } from "react";
import { Alert, Col, Container, Form, Image, Row } from "react-bootstrap";
import { TokenContext, API_BASE_URL } from "../App";
import DiwaCard from "../components/card/DiwaCard";
import { faSun, faMoon, faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";
import { faPhone, faLock } from "@fortawesome/free-solid-svg-icons";
import logo from "./logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./login-modern.css"; // ← new styles (glass card, inputs, switches, gradient CTA)

function LoginModern() {
  const apiURL = "https://api.dingg.app/api/v1/vendor/login";
  const phoneRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const { updateToken, setEmployeeName, setLocation, callAPIPromiseWithToken } = useContext(TokenContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [initialUserId, setInitialUserId] = useState(localStorage.getItem("userId") || "");
  const [initialPassword, setInitialPassword] = useState(localStorage.getItem("password") || "");
  const [showPw, setShowPw] = useState(false);

  const login = useCallback(
    async (userId: string, password: string) => {
      setLoading(true);
      try {
        const response = await fetch(apiURL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isWeb: false, password, fcm_token: "", mobile: "91" + userId }),
        });
        const resp = await response.json();
        if (resp.success) {
          const userProfile = (
            await callAPIPromiseWithToken(`${API_BASE_URL}/employee/get/${resp.data.employee.id}`, resp.token)
          ).data;

          if (
            userProfile.title === "Owner" ||
            userProfile.title === "Administrator" ||
            userProfile.title === "Manager"
          ) {
            setEmployeeName(resp.data.employee.name);
            setLocation(`${resp.data.vendor_locations[0].business_name} - ${resp.data.vendor_locations[0].locality}`);
            localStorage.setItem("userId", userId);
            localStorage.setItem("password", password);
            updateToken(resp.token);
          } else {
            setError("You are not authorized to access this application.");
            localStorage.removeItem("userId");
            localStorage.removeItem("password");
          }
        } else {
          setError(resp.message);
          localStorage.removeItem("userId");
          localStorage.removeItem("password");
        }
      } catch (err) {
        console.error(err);
        if (err instanceof Error) setError(err.message);
        else setError("An unknown error occurred");
        localStorage.removeItem("userId");
        localStorage.removeItem("password");
      } finally {
        setLoading(false);
      }
    },
    [updateToken, setEmployeeName, setLocation, callAPIPromiseWithToken]
  );

  const handleClick = useCallback(() => {
    const userId = phoneRef.current?.value || "";
    const password = passwordRef.current?.value || "";
    login(userId, password);
  }, [login]);

  const localDarkMode = localStorage.getItem("darkMode");
  const localAutoLogin = localStorage.getItem("autoLogin");
  const [darkMode, setDarkMode] = useState(
    localDarkMode ? localDarkMode.toLowerCase() === "true" : window.matchMedia("(prefers-color-scheme: dark)").matches
  );
  const [autoLogin, setAutoLogin] = useState(localAutoLogin ? localAutoLogin.toLowerCase() === "true" : false);

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

  const toggleAutoLogin = useCallback(() => {
    setAutoLogin((prevAutoLogin) => {
      const newAutoLogin = !prevAutoLogin;
      localStorage.setItem("autoLogin", newAutoLogin.toString());
      return newAutoLogin;
    });
  }, []);

  useEffect(() => {
    darkMode ? document.body.classList.add("dark") : document.body.classList.remove("dark");
  }, [darkMode]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", darkModeHandler);
    if (autoLogin && initialUserId && initialPassword) {
      handleClick();
    }
    return () => {
      mediaQuery.removeEventListener("change", darkModeHandler);
    };
  }, [initialUserId, initialPassword, autoLogin, handleClick, darkModeHandler]);

  return (
    <Container fluid className="p-0 app">
      <Row className="m-0 w-100 justify-content-center">
        {/* Single centered column like the mockup */}
        <Col xs={12} sm={10} md={7} lg={5} className=" gy-0 d-flex justify-content-center">
          {/* DiwaCard kept (no logic change), but make it transparent to avoid clashing styles */}
          <DiwaCard varient="pink" loadingTracker={false} className="w-100 bg-transparent border-0 p-0">
            {/* Glassy login card */}
            <div className="login-card position-relative">
              {/* Card top-right theme pill (mockup) */}
              <div className="theme-toggle" aria-label="Theme">
                <button type="button" className="theme-toggle__btn" onClick={toggleDarkMode} aria-pressed={darkMode}>
                  <FontAwesomeIcon icon={darkMode ? faMoon : faSun} />
                  <span className="theme-toggle__txt">{darkMode ? "Dark" : "Light"}</span>
                </button>
              </div>

              {/* Centered brand wordmark (mockup) */}
              <div className="brand d-grid justify-content-center mb-2">
                <Image className="brand__logo" src={logo} alt="Diwa" />
              </div>

              {/* Form */}
              <Form className="form mt-1" onSubmit={(e) => e.preventDefault()}>
                {/* Mobile field with left icon */}
                <Form.Group className="field" controlId="phone">
                  <Form.Label className="label">Mobile Number</Form.Label>
                  <div className="input-wrap">
                    <span className="input__icon">
                      <FontAwesomeIcon icon={faPhone} />
                    </span>
                    <Form.Control
                      type="tel"
                      placeholder="Enter phone number"
                      ref={phoneRef}
                      value={initialUserId}
                      onChange={(e) => setInitialUserId(e.target.value)}
                      className="input"
                    />
                  </div>
                </Form.Group>

                {/* Password field with left icon + right eye toggle */}
                <Form.Group className="field" controlId="password">
                  <Form.Label className="label">Password</Form.Label>
                  <div className="input-wrap">
                    <span className="input__icon">
                      <FontAwesomeIcon icon={faLock} />
                    </span>
                    <Form.Control
                      type={showPw ? "text" : "password"}
                      placeholder="Password"
                      ref={passwordRef}
                      value={initialPassword}
                      onChange={(e) => setInitialPassword(e.target.value)}
                      className="input"
                    />
                    <button
                      type="button"
                      className="input__action"
                      aria-label={showPw ? "Hide password" : "Show password"}
                      onClick={() => setShowPw((v) => !v)}
                    >
                      <FontAwesomeIcon icon={showPw ? faEyeSlash : faEye} />
                    </button>
                  </div>
                </Form.Group>

                {/* Remember + Forgot (inline like mockup) */}
                <div className="d-flex align-items-center justify-content-between mt-1">
                  <label htmlFor="auto-login-mode-switch" className="d-flex align-items-center gap-2">
                    {/* Styled pill switch wrapping the original checkbox (logic unchanged) */}
                    <span className="switch" data-checked={autoLogin}>
                      <input
                        type="checkbox"
                        id="auto-login-mode-switch"
                        className="visually-hidden"
                        checked={autoLogin}
                        onChange={toggleAutoLogin}
                      />
                    </span>
                    <span className="helper">Remember me</span>
                  </label>

                  {/* <a className="link" href="/forgot">
                    Forgot password?
                  </a> */}
                </div>

                {/* Big gradient CTA (full width) */}
                <button type="button" className="login-btn mt-2" onClick={handleClick} disabled={loading}>
                  {loading ? "Please wait..." : "Login"}
                </button>

                {/* Error (keeps your Alert logic, styled) */}
                {error && (
                  <Alert variant="danger" className="mt-3 error-block" role="alert">
                    {error}
                  </Alert>
                )}

                {/* Footer note */}
                <p className="copyright">© 2023, All Rights Reserved.</p>
              </Form>
            </div>
          </DiwaCard>
        </Col>

        {/* Hide the old right column & separator to match the mockup’s single-column layout */}
        <Col xs={0} className="d-none" />
      </Row>
    </Container>
  );
}

export default LoginModern;
