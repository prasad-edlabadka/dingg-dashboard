import { useEffect, useState } from "react";
import { Card, Spinner } from "react-bootstrap";
import { NeuralNetwork } from 'brain.js';
// import trainingData from './TrainingData.json'
import { INeuralNetworkData } from "brain.js/dist/src/neural-network";
import callAPI, { currencyFormatter } from "./Utility";

export default function Prediction({ token, setToken }: { token: string, setToken: any }) {
    const [modelReady, setModelReady] = useState(false);
    const [network, setNetwork] = useState<NeuralNetwork<INeuralNetworkData, INeuralNetworkData>>();
    const [prediction, setPrediction] = useState(0);

    useEffect(() => {
        if (network) {
            console.log("Model already trained. Skipping.");
            return;
        }
        setModelReady(false);
        const net = new NeuralNetwork({
            activation: 'sigmoid', // activation function
            hiddenLayers: [2],
            iterations: 40000,
            learningRate: 0.8
        });
        const date = new Date();
        const startDate = "2022-01-10";
        const endDate = formatDate(addDays(date, -1));
        const apiURL = `https://api.dingg.app/api/v1/vendor/report/sales?start_date=${startDate}&end_date=${endDate}&report_type=by_revenue&app_type=web`;
        callAPI(apiURL, token, setToken, (trainingData: any) => {
            let data = [];
            for (let i = 0; i < trainingData.data.length - 1; i++) {
                console.log(trainingData.data[i + 1]?.total, trainingData.data[i]?.total)
                if (trainingData.data[i].total === 0) {
                    data.push(0);
                } else {
                    data.push((trainingData.data[i + 1]?.total - trainingData.data[i].total) / (trainingData.data[i].total * 100));
                }
            }
            const data2 = []
            for (let i = 0; i < data.length - 4; i++) {
                data2.push({
                    input: [data[i], data[i + 1], data[i + 2]],
                    output: [data[i + 3]]
                })
            }

            const SPLIT = 200;
            const trainData = data2.slice(0, SPLIT);
            //const testData = data.slice(SPLIT + 1);

            console.log('training...', trainData);
            net.train(trainData);
            console.log('trained.');
            setNetwork(net);

            const len = data.length;
            const input = [data[len - 4], data[len - 3], data[len - 2]];
            console.log(data, input);
            const output = net.run(input) as Array<number>;
            const prevVal = trainingData.data[trainingData.data.length - 1].total;
            const result = prevVal + (prevVal * output[0])
            console.log(prevVal, output, result);
            setPrediction(result);
            setModelReady(true);

        });
    }, []);

    return (
        <Card className="shadow" style={{ backgroundColor: "blue" }} text="light">
            {
                !modelReady ? <Card.Body><Spinner animation="grow" /></Card.Body> :
                    <Card.Body>
                        <h3>Today's Sales Prediction</h3>
                        <h1 className="display-3"><strong>{currencyFormatter.format(prediction)}</strong></h1>
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