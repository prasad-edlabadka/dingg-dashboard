import { useContext, useEffect, useRef, useState } from "react";
import { Button, Col, Form, Image, Row } from "react-bootstrap";
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
    const handleClick = () => {
        setLoading(true);
        const userid = "91" + phoneRef.current?.value;
        const password = passwordRef.current?.value;
        const requestMetadata = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "isWeb": false, "password": password, "fcm_token": "", "mobile": userid })
        };
        fetch(apiURL, requestMetadata)
            .then(res => res.json())
            .then(recipes => {
                updateToken(recipes.token);
                setEmployeeName(recipes.data.employee.name);
                setLocation(`${recipes.data.vendor_locations[0].business_name} - ${recipes.data.vendor_locations[0].locality}`);
                setLoading(false);
            })
            .catch(err => { console.log(err); setError(err.message); setLoading(false); });
    };


    const [darkMode, setDarkMode] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches);
    const [neverChange,] = useState(0);
    const darkModeHandler = (e: MediaQueryListEvent) => {
        console.log("Dark mode is " + (e.matches ? "on" : "off"));
        setDarkMode(e.matches);
    }

    useEffect(() => {
        darkMode ? document.body.classList.add('dark') : document.body.classList.remove('dark');
    }, [darkMode]);

    useEffect(() => {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', darkModeHandler);
    }, [neverChange]);
    return (
        <div>
            <Row>
                <Col>
                    <DiwaCard varient="dark" loadingTracker={false}>
                        <h2 className="text-color">Login</h2>
                        <Form>
                            <Form.Group className="mb-3" controlId="phone">
                                <Form.Label className="text-color">Mobile Number</Form.Label>
                                <Form.Control type="tel" placeholder="Enter phone number" ref={phoneRef} />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="password">
                                <Form.Label className="text-color">Password</Form.Label>
                                <Form.Control type="password" placeholder="Password" ref={passwordRef} />
                            </Form.Group>
                            <Row>
                                <Col><Button variant="primary" type="button" className="bg-danger border-0 bg-color-diwa" onClick={handleClick} disabled={loading}>{loading ? "Please wait..." : "Login"}</Button>
                                </Col>
                                <Col className="d-flex justify-content-end align-items-center">
                                    <span className="d-inline pe-2 text-color">Light <FontAwesomeIcon icon={faSun} className="text-color" /></span>
                                    <span className="d-inline">
                                        <Form.Check // prettier-ignore
                                            type="switch"
                                            id="dark-mode-switch"
                                            className="form-control-lg pe-0"
                                            checked={darkMode}
                                            onChange={() => setDarkMode(!darkMode)}
                                        />
                                    </span>
                                    <span className="d-inline text-color"><FontAwesomeIcon icon={faMoon} className="text-color" /> Dark</span>

                                </Col>
                            </Row>

                            {error === "" ? "" : <p className="text-danger">{error}</p>}
                        </Form>
                    </DiwaCard>
                </Col>
            </Row>
            <Row className="mt-4">
                <Image src={logo} fluid className="mt-4 d-block mx-auto" style={{ maxWidth: '60%' }} />
            </Row>
            <Row className="mt-4">
                <p className="small text-color text-center">&copy; 2023, All Rights Reserverd.</p>
            </Row>
        </div>
    )
}
export default DinggLogin;