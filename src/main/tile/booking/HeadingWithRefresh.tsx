import { Col, Row } from "react-bootstrap";
import DiwaRefreshButton from "../../../components/button/DiwaRefreshButton";

function HeadingWithRefresh({ todayFlag, title1, title2, title3, onRefresh }: { todayFlag: any, title1: string, title2: string, title3: string, onRefresh: () => void }) {
    const [today, setToday] = todayFlag;
    return (
        <Row>
            <Col lg="12" xs="12">
                <div className="position-relative today rounded">
                    <h5 className="text-light ">
                        {today?title1:<a href="#home" onClick={() => setToday(true)}>{title1}</a>}
                        <span> {title2 !== ""?'/':''} </span>
                        {!today?title2:<a href="#home" onClick={() => setToday(false)}>{title2}</a>}
                        <span>{title3}</span>
                    </h5>
                    <DiwaRefreshButton refresh={onRefresh} />
                </div>
            </Col>
        </Row>
    )
}

export default HeadingWithRefresh;