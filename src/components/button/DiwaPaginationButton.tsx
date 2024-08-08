import { Button, ButtonGroup } from "react-bootstrap";

function DiwaPaginationButton({ previous, current, next }: { previous: () => void, current: () => void, next: () => void }) {

    const buttons = [
        { title: "< Prev", onClick: () => previous() },
        { title: "Reset", onClick: () => current() },
        { title: "Next >", onClick: () => next() }
    ];

    return (<div className="position-relative mb-3">
        <ButtonGroup size="sm" data-testid="button-parent">
            {buttons.map((button, index) => {
                return <Button variant={`outline-color`} onClick={() => button.onClick()}
                    key={`button-${button.title}-${index}`} data-testid="button">{button.title}</Button>
            })
            }
        </ButtonGroup>
    </div>);
}

export default DiwaPaginationButton;