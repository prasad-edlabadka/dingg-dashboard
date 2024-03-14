import { Button, ButtonGroup } from "react-bootstrap";

function DiwaPaginationButton({ previous, current, next }: { previous: () => void, current: () => void, next: () => void }) {

    const buttons = [
        { title: "< Prev", onClick: () => previous() },
        { title: "Reset", onClick: () => current() },
        { title: "Next >", onClick: () => next() }
    ];
    const handleButtonClick = (index: number, cb: any) => {
        if (cb && typeof cb === 'function') {
            cb();
        } else {
            console.error('No function provided');
        };
    }
    return (<div className="position-relative mb-3">
        <ButtonGroup size="sm" data-testid="button-parent">
            {buttons.map((button, index) => {
                return <Button variant={`outline-color`} onClick={() => handleButtonClick(index, button.onClick)}
                    key={`button-${button.title}-${index}`} data-testid="button">{button.title}</Button>
            })
            }
        </ButtonGroup>
    </div>);
}

export default DiwaPaginationButton;