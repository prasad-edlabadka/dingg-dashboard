import { fireEvent, render, screen } from "@testing-library/react";
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
});