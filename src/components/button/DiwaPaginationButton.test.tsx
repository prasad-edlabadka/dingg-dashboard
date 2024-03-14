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
});