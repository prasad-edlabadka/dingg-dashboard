// import { Button, ButtonGroup } from "react-bootstrap";

function DiwaPaginationButton({
  previous,
  current,
  next,
}: {
  previous: () => void;
  current: () => void;
  next: () => void;
}) {
  const buttons = [
    { title: "< Prev", onClick: () => previous() },
    { title: "Reset", onClick: () => current() },
    { title: "Next >", onClick: () => next() },
  ];

  return (
    <div className="segmented position-relative mt-3" role="tablist" aria-label="Range">
      {buttons.map((button, index) => {
        return (
          <button className="seg-btn" role="tab" aria-selected={false} onClick={() => button.onClick()}>
            {button.title}
          </button>
        );
      })}
    </div>
  );
}

export default DiwaPaginationButton;
