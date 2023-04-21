import { Col, Row } from "react-bootstrap";
import DiwaRefreshButton from "../../../components/button/DiwaRefreshButton";

function HeadingWithRefresh({ title, onRefresh }: { title: string, onRefresh: () => void }) {
    return (
        <Row>
            <Col lg="12" xs="12">
                <div className="position-relative today rounded">
                    <h3 className="text-light ">{title}</h3>
                    <DiwaRefreshButton refresh={onRefresh} />
                </div>
            </Col>
        </Row>
    )
}

export default HeadingWithRefresh;