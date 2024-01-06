//write test cases for DiwaNavBar component
import { render, screen } from "@testing-library/react";
import DiwaNavBar from "./DiwaNavBar";
import * as Icon from "react-bootstrap-icons";
import { TokenContext } from "../../App";

const navs = [
    { name: 'home', icon: Icon.HouseDoor, link: '#home' },
    { name: 'products', icon: Icon.CartCheck, link: '#home' },
]

describe('DiwaNavBar component tests', () => {
    //test case 1: check if DiwaNavBar component renders
    test('DiwaNavBar component renders', () => {
        renderNav(navs, 'dummyToken');
        const diwaNavBar = screen.getByTestId('navbar-parent');
        expect(diwaNavBar).toBeInTheDocument();
    });

    //test case 2: check if DiwaNavBar component renders with correct number of navs
    test('DiwaNavBar component renders with correct number of navs', () => {
        renderNav(navs, 'dummyToken');
        const diwaNavBar = screen.getByTestId('navbar-parent');
        expect(diwaNavBar).toBeInTheDocument();
        const navsCount = screen.getAllByTestId('nav-item');
        expect(navsCount.length).toBe(navs.length);
    });

    //test case 3: check if DiwaNavBar component renders with correct navs
    test('DiwaNavBar component renders with correct navs', () => {
        renderNav(navs, 'dummyToken');
        const diwaNavBar = screen.getByTestId('navbar-parent');
        expect(diwaNavBar).toBeInTheDocument();
        const navsCount = screen.getAllByTestId('nav-item');
        expect(navsCount.length).toBe(navs.length);
        navs.forEach((nav) => {
            const navLink = screen.getByTestId(`nav-text-${nav.name}`);
            expect(navLink).toBeInTheDocument();
            const navIcon = screen.getByTestId(`nav-icon-${nav.name}`);
            expect(navIcon).toBeInTheDocument();
        });
    });

});
describe('DiwaNavBar component tests with different props', () => {

    //test case 4: check if DiwaNavBar component renders with correct navs when token is null
    test('DiwaNavBar component renders with no navs when token is null', () => {
        renderNav(navs, null);
        const diwaNavBar = screen.queryByTestId('navbar-parent');
        expect(diwaNavBar).toBeNull();
    });

    //test case 5: check if DiwaNavBar component renders with correct navs when navOption is null
    test('DiwaNavBar component renders with correct navs when navOption is null', () => {
        renderNav(navs, 'dummyToken', '');
        const diwaNavBar = screen.getByTestId('navbar-parent');
        expect(diwaNavBar).toBeInTheDocument();
        const navsCount = screen.getAllByTestId('nav-item');
        expect(navsCount.length).toBe(navs.length);
        const count = navsCount.filter((nav) => nav.className.includes('text-danger'));
        expect(count.length).toBe(0);
    });

    //test case 6: check if DiwaNavBar component renders with correct navs without any actie navs when navOption is invalid value
    test('DiwaNavBar component renders with correct navs without any actie navs when navOption is invalid value', () => {
        renderNav(navs, 'dummyToken', 'dummy');
        const diwaNavBar = screen.getByTestId('navbar-parent');
        expect(diwaNavBar).toBeInTheDocument();
        const navsCount = screen.getAllByTestId('nav-item');
        expect(navsCount.length).toBe(navs.length);
        const count = navsCount.filter((nav) => nav.className.includes('text-danger'));
        expect(count.length).toBe(0);
    });

    //test case 7: check if DiwaNavBar component renders with correct navs when navOption is null
    test('DiwaNavBar component renders with correct navs with one actie nav when navOption is valid value', () => {
        renderNav(navs, 'dummyToken', 'home');
        const diwaNavBar = screen.getByTestId('navbar-parent');
        expect(diwaNavBar).toBeInTheDocument();
        const navsCount = screen.getAllByTestId('nav-item');
        expect(navsCount.length).toBe(navs.length);
        const count = navsCount.filter((nav) => nav.className.includes('text-danger'));
        expect(count.length).toBe(1);
    });


});

function renderNav(navs: {
    name: string; icon: any;
    link: string; iconProps?: object | undefined; onClick?: any;
}[], token: string | null, navOption: string = '') {
    return render(
        <TokenContext.Provider value={{ token: token, employeeName: '', location: '', setLocation: () => {}, setEmployeeName: ()=>{}, updateToken: () => { }, navOption: navOption, setNavOption: () => { }, callAPI: () => { }, callPOSTAPI: () => { }, darkMode: false }}>
            <DiwaNavBar navs={navs} />
        </TokenContext.Provider>);
}
