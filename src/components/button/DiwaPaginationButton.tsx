import { Button, ButtonGroup } from "react-bootstrap";
import { TokenContext } from "../../App";
import { useContext } from "react";

function DiwaPaginationButton({ previous, current, next }: { previous: any, current: any, next: any}) {

    const buttons = [
        { title: "< Prev", onClick: () => previous() },
        { title: "Reset", onClick: () => current() },
        { title: "Next >", onClick: () => next() }
    ];
    const handleButtonClick = (index: number, cb: any) => {
        if(cb && typeof cb === 'function') {
            cb();
        };
    }
    const {darkMode} = useContext(TokenContext);
    return (<div className="position-relative mb-3">
        <ButtonGroup size="sm" data-testid="button-parent">
            {buttons.map((button, index) => {
                return <Button variant={`outline-${darkMode?"dark":"light"}`} onClick={() => handleButtonClick(index, button.onClick)}
                    key={`button-${button.title}-${index}`} data-testid="button">{button.title}</Button>
            })
            }
        </ButtonGroup>
    </div>);
}

export default DiwaPaginationButton ;