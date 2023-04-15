import { render, screen, within } from "@testing-library/react";
import DiwaCard from "./DiwaCard";

describe('DiwaCard', () => {
    test('should render', () => {
        render(<DiwaCard varient="purple" loadingTracker={false} />);
        const parent = screen.getByTestId('card-parent');
        expect(parent).toBeInTheDocument();
    });

    test('should render with loading', () => {
        render(<DiwaCard varient="purple" loadingTracker={true} />);
        const parent = screen.getByTestId('card-parent');
        expect(parent).toBeInTheDocument();
        const loadingBody = screen.getByTestId('card-loading-body');
        expect(loadingBody).toBeInTheDocument();
        const contentBody = screen.queryByTestId('card-content-body');
        expect(contentBody).toBe(null);
    });

    test('should render with content', () => {
        render(<DiwaCard varient="purple" loadingTracker={false}><div>test</div></DiwaCard>);
        const parent = screen.getByTestId('card-parent');
        expect(parent).toBeInTheDocument();
        const loadingBody = screen.queryByTestId('card-loading-body');
        expect(loadingBody).toBe(null);
        const contentBody = screen.getByTestId('card-content-body');
        expect(contentBody).toBeInTheDocument();
        const text = within(contentBody).getByText('test');
        expect(text).toBeInTheDocument();
    });

    test('should not render content with loading as true', () => {
        render(<DiwaCard varient="purple" loadingTracker={true}><div>test</div></DiwaCard>);
        const parent = screen.getByTestId('card-parent');
        expect(parent).toBeInTheDocument();
        const loadingBody = screen.getByTestId('card-loading-body');
        expect(loadingBody).toBeInTheDocument();
        const contentBody = screen.queryByTestId('card-content-body');
        expect(contentBody).toBe(null);
    });

    test('should render with correct varient', () => {
        render(<DiwaCard varient="purple" loadingTracker={false} />);
        const parent = screen.getByTestId('card-parent');
        expect(parent).toHaveClass('bg-purple');
    });

    test('should render with correct text color', () => {
        render(<DiwaCard varient="purple" loadingTracker={false} />);
        const parent = screen.getByTestId('card-parent');
        expect(parent).toHaveClass('text-light');
    });

    test('should render with correct shadow', () => {
        render(<DiwaCard varient="purple" loadingTracker={false} />);
        const parent = screen.getByTestId('card-parent');
        expect(parent).toHaveClass('shadow');
    });
}
);