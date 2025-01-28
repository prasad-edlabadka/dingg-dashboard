import { Col, Row } from "react-bootstrap";
import { currencyFormatter } from "../Utility";

function SimpleDataPoint({ data, onClick }: { data: any[]; onClick: (id: number) => void }) {
  return (
    <Row className={"g-4"}>
      {data.map((item, index) => {
        return (
          <Col xs="4" key={item.title + index} className={`text-color ms-0 me-0`}>
            <h6 className="mb-0" onClick={() => onClick(item.id)}>
              {item.title}
            </h6>
            <h4 className="align-self-center mb-0 text-nowrap">{currencyFormatter.format(item.value)}</h4>
            {/* <div className="small text-color-50" style={{ marginTop: -2 }}>{item.subTitle || 'previous'} {item.previous}</div> */}
          </Col>
        );
      })}
    </Row>
  );
}

export default SimpleDataPoint;
