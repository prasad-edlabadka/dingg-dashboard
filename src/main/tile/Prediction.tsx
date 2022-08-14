import { useEffect, useRef, useState } from "react";
import { Card, Col, Form, Row, Spinner } from "react-bootstrap";
import { NeuralNetwork } from 'brain.js';
// import trainingData from './TrainingData.json'
import { INeuralNetworkData } from "brain.js/dist/src/neural-network";
import callAPI from "./Utility";

export default function Prediction({ token, setToken }: { token: string, setToken: any }) {
    const [modelReady, setModelReady] = useState(false);
    const [network, setNetwork] = useState<NeuralNetwork<INeuralNetworkData, INeuralNetworkData>>();
    const [prediction, setPrediction] = useState([0.0, 0.0, 0.0, 0.0])
    const customerCountRef = useRef<HTMLInputElement>(null);
    
    useEffect(() => {
        if(network) {
            console.log("Model already trained. Skipping.");
            return; 
        }
        setModelReady(false);
        const net = new NeuralNetwork({
            activation: 'sigmoid', // activation function
            hiddenLayers: [6],
            iterations: 40000,
            learningRate: 0.8
        });
        const date = new Date();
        const startDate = "2022-01-10";
        const endDate = formatDate(addDays(date, -1));
        const apiURL = `https://api.dingg.app/api/v1/vendor/report/sales?start_date=${startDate}&end_date=${endDate}&report_type=by_revenue&app_type=web`;
        callAPI(apiURL, token, setToken, (trainingData: any) => {
            const data = trainingData.data.map((v: any) => {
                const val = Math.round(v.total);
                return {
                    input: [(new Date(v.date)).getDay(), v.customers],
                    output: [val < 1000 ? 1 : 0, val >= 1000 && val < 5000 ? 1 : 0, val >= 5000 && val < 10000 ? 1 : 0, val >= 10000 ? 1 : 0]
                }
            });
            const SPLIT = 200;
            const trainData = data.slice(0, SPLIT);
            //const testData = data.slice(SPLIT + 1);
            console.log('training...');
            net.train(trainData);
            console.log('trained.');
            setNetwork(net);
            setModelReady(true);
    
        });
        
    }, []);

    const handleClick = () => {
        const output = network?.run([new Date().getDay(), Number.parseInt(customerCountRef.current?.value || "0")]) as Array<number>;
        setPrediction([output[0],output[1], output[2], output[3]]);
    }
    return (
        <Card className="shadow" style={{ backgroundColor: "blue" }} text="light">
            {
                !modelReady ? <Card.Body><Spinner animation="grow" /></Card.Body> :
                    <Card.Body>
                        <h3>Today's Sales Prediction</h3>
                        <Form>
                            <Form.Group className="mb-3" controlId="customers">
                                <Form.Label>Expected Number of Customers</Form.Label>
                                <Form.Control type="number" placeholder="No. of customers" ref={customerCountRef} onChange={() => handleClick()} />
                            </Form.Group>
                        </Form>
                        <Row>
                            <Col xs={6}>₹0 to ₹1000</Col>
                            <Col xs={6}>{Math.round(prediction[0] * 100) +"% Chance"}</Col>
                        </Row>
                        <Row>
                            <Col xs={6}>₹1000 to ₹5000</Col>
                            <Col xs={6}>{Math.round(prediction[1] * 100) +"% Chance"}</Col>
                        </Row>
                        <Row>
                            <Col xs={6}>₹5000 to ₹10000</Col>
                            <Col xs={6}>{Math.round(prediction[2] * 100) +"% Chance"}</Col>
                        </Row>
                        <Row>
                            <Col xs={6}>More than ₹10000</Col>
                            <Col xs={6}>{Math.round(prediction[3] * 100) +"% Chance"}</Col>
                        </Row>
                    </Card.Body>
            }

        </Card>
    )
}
function formatDate(dt: Date): string {
    return [dt.getFullYear(), padTo2Digits(dt.getMonth() + 1), padTo2Digits(dt.getDate())].join('-');
}

function padTo2Digits(num: number) {
    return num.toString().padStart(2, '0');
}

function addDays(dt: Date, days: number): Date {
    let retDate = new Date(dt);
    const result = retDate.setDate(retDate.getDate() + days);
    return new Date(result);
}


// function getAccuracy(net: NeuralNetwork<import("brain.js/dist/src/neural-network").INeuralNetworkData, import("brain.js/dist/src/neural-network").INeuralNetworkData>, testData: { input: number[]; output: number[]; }[]) {
//     let hits = 0;
//     testData.forEach((datapoint) => {
//         const output = net.run(datapoint.input) as Array<number>;
//         console.log(datapoint.input, datapoint.output, [Math.round(output[0]), Math.round(output[1]), Math.round(output[2]), Math.round(output[3])]);
//         const outputArray = [Math.round(output[0]), Math.round(output[1]), Math.round(output[2]), Math.round(output[3])];
//         if (outputArray[0] === datapoint.output[0] && outputArray[1] === datapoint.output[1] && outputArray[2] === datapoint.output[2] && outputArray[3] === datapoint.output[3]) {
//             hits += 1;
//         }
//     });
//     console.log(hits, testData.length);
//     return hits / testData.length;
// }

