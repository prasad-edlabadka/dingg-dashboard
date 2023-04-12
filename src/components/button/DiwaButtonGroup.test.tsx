import { fireEvent, render, screen } from "@testing-library/react";
import DiwaButtonGroup from "./DiwaButtonGroup";

const buttons = [
    { title: 'Button 1', onClick: () => {}},
    { title: 'Button 2', onClick: () => {}},
    { title: 'Button 3', onClick: () => {}}
]
describe('DiwaButtonGroup component tests', () => {
    test('DiwaButtonGroup component renders', () => {
        render(<DiwaButtonGroup buttons={buttons} />);
        const parent = screen.getByTestId('button-parent');
        expect(parent).toBeInTheDocument();
    });

    test('DiwaButtonGroup component renders with correct number of buttons', () => {
        render(<DiwaButtonGroup buttons={buttons} />);
        const parent = screen.getByTestId('button-parent');
        expect(parent).toBeInTheDocument();
        const buttonsCount = screen.getAllByTestId('button');
        expect(buttonsCount.length).toBe(buttons.length);
    });

    test('DiwaButtonGroup component renders with correct buttons', () => {
        render(<DiwaButtonGroup buttons={buttons} />);
        const parent = screen.getByTestId('button-parent');
        expect(parent).toBeInTheDocument();
        const buttonsCount = screen.getAllByTestId('button');
        expect(buttonsCount.length).toBe(buttons.length);
        buttonsCount.forEach((button, index) => {
            expect(button.innerHTML).toBe(buttons[index].title);
        });
    });

    test('DiwaButtonGroup component renders buttons in a horizontal layout', () => {
        render(<DiwaButtonGroup buttons={buttons} />);
        const parent = screen.getByTestId('button-parent');
        expect(parent).toBeInTheDocument();
        expect(parent).not.toHaveClass('btn-group-vertical');
    });

    test('DiwaButtonGroup component renders first button as active by default', () => {
        render(<DiwaButtonGroup buttons={buttons} />);
        const parent = screen.getByTestId('button-parent');
        expect(parent).toBeInTheDocument();
        const buttonsCount = screen.getAllByTestId('button');
        expect(buttonsCount.length).toBe(buttons.length);
        expect(buttonsCount[0].classList).toContain('btn-dark');
    });

    test('DiwaButtonGroup component renders active button as dark', () => {
        render(<DiwaButtonGroup buttons={buttons} />);
        const parent = screen.getByTestId('button-parent');
        expect(parent).toBeInTheDocument();
        const buttonsCount = screen.getAllByTestId('button');
        expect(buttonsCount.length).toBe(buttons.length);
        const darkButtons = buttonsCount.filter((button) => button.classList.contains('btn-dark'));
        expect(darkButtons.length).toBe(1);
    });

    test('DiwaButtonGroup component renders inactive button as light', () => {
        render(<DiwaButtonGroup buttons={buttons} />);
        const parent = screen.getByTestId('button-parent');
        expect(parent).toBeInTheDocument();
        const buttonsCount = screen.getAllByTestId('button');
        expect(buttonsCount.length).toBe(buttons.length);
        const darkButtons = buttonsCount.filter((button) => button.classList.contains('btn-light'));
        expect(darkButtons.length).toBe(2);
    });

    test('DiwaButtonGroup component renders small size buttons', () => {
        render(<DiwaButtonGroup buttons={buttons} />);
        const parent = screen.getByTestId('button-parent');
        expect(parent).toBeInTheDocument();
        expect(parent).toHaveClass('btn-group-sm');
    });
});

describe('DiwaButtonGroup component interaction tests', () => {
    test('DiwaButtonGroup component changes active button to clicked button when clicked', () => {
        render(<DiwaButtonGroup buttons={buttons} />);
        const parent = screen.getByTestId('button-parent');
        expect(parent).toBeInTheDocument();
        fireEvent.click(screen.getByText('Button 2'));
        const button = screen.getByText('Button 2');
        expect(button.classList).toContain('btn-dark');
        fireEvent.click(screen.getByText('Button 3'));
        const button2 = screen.getByText('Button 3');
        expect(button2.classList).toContain('btn-dark');
    });

    test('DiwaButtonGroup component changes active button to inactive when another button is clicked', () => {
        render(<DiwaButtonGroup buttons={buttons} />);
        const parent = screen.getByTestId('button-parent');
        expect(parent).toBeInTheDocument();
        fireEvent.click(screen.getByText('Button 2'));
        const button = screen.getByText('Button 2');
        expect(button.classList).toContain('btn-dark');
        fireEvent.click(screen.getByText('Button 3'));
        expect(button.classList).toContain('btn-light');
    });

    test('DiwaButtonGroup component calls onClick function when button is clicked', () => {
        const onClick = jest.fn();
        const buttons = [
            { title: 'Button 1', onClick: onClick},
            { title: 'Button 2', onClick: onClick},
            { title: 'Button 3', onClick: onClick}
        ]
        render(<DiwaButtonGroup buttons={buttons} />);
        const parent = screen.getByTestId('button-parent');
        expect(parent).toBeInTheDocument();
        fireEvent.click(screen.getByText('Button 2'));
        expect(onClick).toHaveBeenCalledTimes(1);
        fireEvent.click(screen.getByText('Button 3'));
        expect(onClick).toHaveBeenCalledTimes(2);
    });

    test('DiwaButtonGroup component calls onClick function with correct parameters when button is clicked', () => {
        const onClick = jest.fn();
        const onClickParams = ['param1', 'param2'];
        const onClickParams2 = [{'param3':'sample'}, 'param4'];
        const buttons = [
            { title: 'Button 1', onClick: onClick, onClickParams:onClickParams},
            { title: 'Button 2', onClick: onClick, onClickParams:onClickParams},
            { title: 'Button 3', onClick: onClick, onClickParams:onClickParams2}
        ]
        render(<DiwaButtonGroup buttons={buttons} />);
        const parent = screen.getByTestId('button-parent');
        expect(parent).toBeInTheDocument();
        fireEvent.click(screen.getByText('Button 2'));
        expect(onClick).toHaveBeenCalledWith(...onClickParams);
        fireEvent.click(screen.getByText('Button 3'));
        expect(onClick).toHaveBeenCalledWith(...onClickParams2);
    });

    test('DiwaButtonGroup component does not call onClick function when button is clicked and onClick is not defined', () => {
        const onClick = jest.fn();
        const buttons = [
            { title: 'Button 1', onClick: onClick},
            { title: 'Button 2', onClick: null},
            { title: 'Button 3', onClick: onClick}
        ]
        render(<DiwaButtonGroup buttons={buttons} />);
        const parent = screen.getByTestId('button-parent');
        expect(parent).toBeInTheDocument();
        fireEvent.click(screen.getByText('Button 2'));
        expect(onClick).toHaveBeenCalledTimes(0);
        fireEvent.click(screen.getByText('Button 3'));
        expect(onClick).toHaveBeenCalledTimes(1);
    });

})