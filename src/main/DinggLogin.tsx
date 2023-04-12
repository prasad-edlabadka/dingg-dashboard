import { useContext, useRef } from "react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { TokenContext } from "../App";

function DinggLogin() { 
    const apiURL = "https://api.dingg.app/api/v1/vendor/login";
    const phoneRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const {updateToken} = useContext(TokenContext);
    const handleClick = () => {
        const  userid="91"+phoneRef.current?.value;
        const  password=passwordRef.current?.value;
        const requestMetadata = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({"isWeb":false,"password":password,"fcm_token":"","mobile":userid})
        };
        fetch(apiURL, requestMetadata)
            .then(res => res.json())
            .then(recipes => {
                updateToken(recipes.token);
            });
    };
    return (
        <div className="position-absolute top-50 start-50 translate-middle w-75" style={{marginTop: -160}}>
            <Row>
                <Col>
                    <Card bg="dark" text="light">
                    <Card.Header><h2>Login</h2></Card.Header>
                        <Card.Body>
                            <Form>
                                <Form.Group className="mb-3" controlId="phone">
                                    <Form.Label>Mobile Number</Form.Label>
                                    <Form.Control type="tel" placeholder="Enter phone number" ref={phoneRef}/>
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="password">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control type="password" placeholder="Password" ref={passwordRef}/>
                                </Form.Group>
                                <Button variant="primary" type="button" className="bg-danger border-0" onClick={handleClick}>Login</Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    )
}
export default DinggLogin;