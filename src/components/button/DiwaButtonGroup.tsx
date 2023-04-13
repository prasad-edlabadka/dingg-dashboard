import { Button, ButtonGroup } from "react-bootstrap";

function DiwaButtonGroup({ buttons, state }: { buttons: { title: string,  onClick: any, onClickParams?: any[] }[], state: any }) {
    const [activeButtonIndex, setActiveButtonIndex] = state;
    const handleButtonClick = (index: number, cb: any, onClickParams: any[] = []) => {
        setActiveButtonIndex(index);
        if(cb && typeof cb === 'function') {
            cb(...onClickParams);
        };
    }
    return (<div className="position-relative mb-3">
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