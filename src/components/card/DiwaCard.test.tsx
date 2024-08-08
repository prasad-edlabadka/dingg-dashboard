import { render, screen, within } from "@testing-library/react";
import DiwaCard from "./DiwaCard";

describe('DiwaCard', () => {
    test('DiwaCard should render', () => {
        render(<DiwaCard varient="purple" loadingTracker={false} />);
        const parent = screen.getByTestId('card-parent');
        expect(parent).toBeInTheDocument();
    });

    test('DiwaCard should render with loading', () => {
        render(<DiwaCard varient="purple" loadingTracker={true} />);
        const parent = screen.getByTestId('card-parent');
        expect(parent).toBeInTheDocument();
        const loadingBody = screen.getByTestId('card-loading-body');
        expect(loadingBody).toBeInTheDocument();
        const contentBody = screen.queryByTestId('card-content-body');
        expect(contentBody).toBe(null);
    });

    test('DiwaCard should render with content', () => {
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

    test('DiwaCard should not render content with loading as true', () => {
        render(<DiwaCard varient="purple" loadingTracker={true}><div>test</div></DiwaCard>);
        const parent = screen.getByTestId('card-parent');
        expect(parent).toBeInTheDocument();
        const loadingBody = screen.getByTestId('card-loading-body');
        expect(loadingBody).toBeInTheDocument();
        const contentBody = screen.queryByTestId('card-content-body');
        expect(contentBody).toBe(null);
    });

    test('DiwaCard should render with correct varient', () => {
        render(<DiwaCard varient="purple" loadingTracker={false} />);
        const parent = screen.getByTestId('card-parent');
        expect(parent).toHaveClass('bg-purple');
    });

    test('DiwaCard should render with correct text color', () => {
        render(<DiwaCard varient="purple" loadingTracker={false} />);
        const parent = screen.getByTestId('card-parent');
        expect(parent).toHaveClass('text-dark');
    });

    test('DiwaCard should render with correct shadow', () => {
        render(<DiwaCard varient="purple" loadingTracker={false} />);
        const parent = screen.getByTestId('card-parent');
        expect(parent).toHaveClass('shadow');
    });

    // Test case: Check if DiwaCard component renders with different variants
    test('DiwaCard should render with different variants', () => {
        const variants: Array<"danger" | "success" | "primary" | "warning" | "dark" | "indigo" | "purple" | "pink"> = ["danger", "success", "primary", "warning", "dark", "indigo", "purple", "pink"];
        variants.forEach((variant) => {
            const { getByTestId, unmount } = render(<DiwaCard varient={variant} loadingTracker={false} />);
            const parent = getByTestId('card-parent');
            expect(parent).toHaveClass(`bg-${variant}`);
            unmount();
        });
    });

    // Test case: Check if DiwaCard component does not render content when loading is true
    test('DiwaCard should not render content when loading is true', () => {
        render(<DiwaCard varient="purple" loadingTracker={true}><div>test</div></DiwaCard>);
        const loadingBody = screen.getByTestId('card-loading-body');
        expect(loadingBody).toBeInTheDocument();
        const contentBody = screen.queryByTestId('card-content-body');
        expect(contentBody).not.toBeInTheDocument();

    });

    // Test case: Check if DiwaCard component renders content when loading is false
    test('DiwaCard should render content when loading is false', () => {
        render(<DiwaCard varient="purple" loadingTracker={false}><div>test</div></DiwaCard>);
        const loadingBody = screen.queryByTestId('card-loading-body');
        expect(loadingBody).not.toBeInTheDocument();
        const contentBody = screen.getByTestId('card-content-body');
        expect(contentBody).toBeInTheDocument();
        const text = within(contentBody).getByText('test');
        expect(text).toBeInTheDocument();
    });

    // Test case: Check if DiwaCard component renders with correct text color for dark mode
    test('DiwaCard should render with correct text color for dark mode', () => {
        const { getByTestId } = render(<DiwaCard varient="purple" loadingTracker={false} />);
        const parent = getByTestId('card-parent');
        expect(parent).toHaveClass('text-dark');
    });

    // Test case: Check if DiwaCard component renders with correct text color for light mode
    test('DiwaCard should render with correct text color for light mode', () => {
        const { getByTestId } = render(<DiwaCard varient="danger" loadingTracker={false} />);
        const parent = getByTestId('card-parent');
        expect(parent).toHaveClass('text-light');
    });

    // Test case: Check if DiwaCard component renders with correct shadow
    test('DiwaCard should render with correct shadow', () => {
        const { getByTestId } = render(<DiwaCard varient="danger" loadingTracker={false} />);
        const parent = getByTestId('card-parent');
        expect(parent).toHaveClass('shadow');
    });

    // Test case: Check if loading tracker is true, DiwaCard component should render loading body
    test('DiwaCard should render loading body when loading tracker is true', () => {
        const { getByTestId } = render(<DiwaCard varient="danger" loadingTracker={true} />);
        const loadingBody = getByTestId('card-loading-body');
        expect(loadingBody).toBeInTheDocument();
    });
}
);