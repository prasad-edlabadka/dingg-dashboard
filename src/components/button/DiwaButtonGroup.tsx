import { useState } from "react";
import { Button, ButtonGroup } from "react-bootstrap";

function DiwaButtonGroup({ buttons }: { buttons: { title: string, onClick: any, onClickParams?: any[] }[] }) {
    const [activeButtonIndex, setActiveButtonIndex] = useState(0);
    const handleButtonClick = (index: number, cb: any, onClickParams: any[] = []) => {
        setActiveButtonIndex(index);
        if(cb && typeof cb === 'function') {
            cb(...onClickParams);
        };
    }
    return (<div className="position-relative">
        <ButtonGroup size="sm" data-testid="button-parent">
            {buttons.map((button, index) => {
                return <Button variant={activeButtonIndex === index ? "dark" : "light"} onClick={() => handleButtonClick(index, button.onClick, button.onClickParams)}
                    key={`button-${button.title}-${index}`} data-testid="button">{button.title}</Button>
            })
            }
        </ButtonGroup>
    </div>);
}

export default DiwaButtonGroup;