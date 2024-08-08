import { render, fireEvent, screen } from '@testing-library/react';
import DiwaPaginationButton from './DiwaPaginationButton';

describe('DiwaPaginationButton component tests', () => {
    let previousMock: jest.Mock<any, any>, currentMock: jest.Mock<any, any>, nextMock: jest.Mock<any, any>;

    beforeEach(() => {
        previousMock = jest.fn();
        currentMock = jest.fn();
        nextMock = jest.fn();
    });

    // Test case 1: Check if DiwaPaginationButton component renders
    test('DiwaPaginationButton component renders', () => {
        render(<DiwaPaginationButton previous={previousMock} current={currentMock} next={nextMock} />);
        const buttonGroup = screen.getByTestId('button-parent');
        expect(buttonGroup).toBeInTheDocument();
    });

    // Test case 2: Check if DiwaPaginationButton component renders with correct number of buttons
    test('DiwaPaginationButton component renders with correct number of buttons', () => {
        render(<DiwaPaginationButton previous={previousMock} current={currentMock} next={nextMock} />);
        const buttons = screen.getAllByTestId('button');
        expect(buttons.length).toBe(3);
    });

    // Test case 3: Check if DiwaPaginationButton component calls the correct function on button click
    test('DiwaPaginationButton component calls the correct function on button click', () => {
        render(<DiwaPaginationButton previous={previousMock} current={currentMock} next={nextMock} />);
        const buttons = screen.getAllByTestId('button');
        fireEvent.click(buttons[0]);
        expect(previousMock).toHaveBeenCalled();
        fireEvent.click(buttons[1]);
        expect(currentMock).toHaveBeenCalled();
        fireEvent.click(buttons[2]);
        expect(nextMock).toHaveBeenCalled();
    });

    // Test case 4: Check if DiwaPaginationButton component renders with correct button text
    test('DiwaPaginationButton component renders with correct button text', () => {
        render(<DiwaPaginationButton previous={previousMock} current={currentMock} next={nextMock} />);
        const buttons = screen.getAllByTestId('button');
        expect(buttons[0].textContent).toBe('< Prev');
        expect(buttons[1].textContent).toBe('Reset');
        expect(buttons[2].textContent).toBe('Next >');
    });

    // Test case 5: Check if DiwaPaginationButton component renders with correct button color
    test('DiwaPaginationButton component renders with correct button color', () => {
        render(<DiwaPaginationButton previous={previousMock} current={currentMock} next={nextMock} />);
        const buttons = screen.getAllByTestId('button');
        expect(buttons[0]).toHaveClass('btn-outline-color');
        expect(buttons[1]).toHaveClass('btn-outline-color');
        expect(buttons[2]).toHaveClass('btn-outline-color');
    });

    // Test case 6: Check if DiwaPaginationButton component renders with correct button size
    test('DiwaPaginationButton component renders with correct button size', () => {
        render(<DiwaPaginationButton previous={previousMock} current={currentMock} next={nextMock} />);
        const buttons = screen.getAllByTestId('button');
        expect(buttons[0]).toHaveClass('btn');
        expect(buttons[1]).toHaveClass('btn');
        expect(buttons[2]).toHaveClass('btn');
        expect(buttons[0]).not.toHaveClass('btn-sm');
        expect(buttons[1]).not.toHaveClass('btn-sm');
        expect(buttons[2]).not.toHaveClass('btn-sm');
        expect(buttons[0]).not.toHaveClass('btn-lg');
        expect(buttons[1]).not.toHaveClass('btn-lg');
        expect(buttons[2]).not.toHaveClass('btn-lg');
    });


});