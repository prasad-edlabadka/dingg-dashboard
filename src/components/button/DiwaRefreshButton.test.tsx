import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import DiwaRefreshButton from "./DiwaRefreshButton";

describe('DiwaRefreshButton component tests', () => {
    test('DiwaRefreshButton component renders', () => {
        render(<DiwaRefreshButton refresh={jest.fn()} />);
        const button = screen.getByTestId('refresh-button');
        expect(button).toBeInTheDocument();
    });

    test('DiwaRefreshButton component renders with correct icon', () => {
        render(<DiwaRefreshButton refresh={jest.fn()} />);
        const button = screen.getByTestId('refresh-button');
        expect(button).toBeInTheDocument();
        const icon = screen.getByTestId('refresh-icon');
        expect(icon).toBeInTheDocument();
    });

    test('DiwaRefreshButton component invokes refresh function', () => {
        const refresh = jest.fn();
        render(<DiwaRefreshButton refresh={refresh} />);
        const button = screen.getByTestId('refresh-button');
        expect(button).toBeInTheDocument();
        fireEvent.click(button);
        expect(refresh).toHaveBeenCalledTimes(1);
    });

    // New test cases
    test('DiwaRefreshButton component does not invoke refresh function on right click', () => {
        const refresh = jest.fn();
        render(<DiwaRefreshButton refresh={refresh} />);
        const button = screen.getByTestId('refresh-button');
        expect(button).toBeInTheDocument();
        fireEvent.contextMenu(button);
        expect(refresh).toHaveBeenCalledTimes(0);
    });

    test('DiwaRefreshButton component invokes refresh function multiple times', () => {
        const refresh = jest.fn();
        render(<DiwaRefreshButton refresh={refresh} />);
        const button = screen.getByTestId('refresh-button');
        expect(button).toBeInTheDocument();
        fireEvent.click(button);
        fireEvent.click(button);
        fireEvent.click(button);
        expect(refresh).toHaveBeenCalledTimes(3);
    });

    // Negative case: refresh function throws an error
    test('DiwaRefreshButton component handles error when refresh function throws', () => {
        const refresh = jest.fn(() => {
            throw new Error('Refresh failed');
        });
        render(<DiwaRefreshButton refresh={refresh} />);
        const button = screen.getByTestId('refresh-button');
        expect(button).toBeInTheDocument();
        fireEvent.click(button); // This should not crash the component
        expect(refresh).toHaveBeenCalledTimes(1);
    });

    // Edge case: refresh function is slow
    test('DiwaRefreshButton component handles slow refresh function', async () => {
        const refresh = jest.fn(() => new Promise(resolve => setTimeout(resolve, 5000)));
        render(<DiwaRefreshButton refresh={refresh} />);
        const button = screen.getByTestId('refresh-button');
        expect(button).toBeInTheDocument();
        fireEvent.click(button); // This should not block the UI
        await waitFor(() => expect(refresh).toHaveBeenCalledTimes(1));
    });

});