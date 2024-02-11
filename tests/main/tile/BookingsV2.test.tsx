// FILEPATH: /Users/prasad/Desktop/code/dingg-dashboard/src/main/tile/BookingsV2.test.tsx
import { render, screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import BookingsV2, { identifyMembers, loadMembers } from "../../../src/main/tile/BookingsV2";
import { differenceInMonths, parse } from 'date-fns';

jest.mock('date-fns', () => ({
    differenceInMonths: jest.fn(),
    parse: jest.fn(),
}));

jest.mock('./api', () => ({
    callAPI: jest.fn(),
}));

describe('BookingsV2 component tests', () => {
    // Mock data
    const mockData = {
        data: [
            {
                user: {
                    id: 1,
                    is_member: false,
                },
            },
            {
                user: {
                    id: 2,
                    is_member: false,
                },
            },
        ],
    };

    const mockMembers = [
        { user_id: 1 },
        { user_id: 3 },
    ];

    // Test case 1: identifyMembers function correctly identifies members
    test('identifyMembers function correctly identifies members', () => {
        identifyMembers(mockData, mockMembers);
        expect(mockData.data[0].user.is_member).toBe(true);
        expect(mockData.data[1].user.is_member).toBe(false);
    });

    // Test case 2: loadMembers function correctly sets members and inactive members
    test('loadMembers function correctly sets members and inactive members', async () => {
        const setMembers = jest.fn();
        const setInactiveMembers = jest.fn();
        const callAPI = jest.fn().mockImplementation((url, callback) => {
            callback(mockMembers);
        });

        await act(async () => {
            loadMembers(setMembers, setInactiveMembers, callAPI);
        });

        expect(setMembers).toHaveBeenCalledWith(mockMembers);
        expect(setInactiveMembers).toHaveBeenCalled();
    });

    // Test case 3: loadMembers function correctly handles error
    test('loadMembers function correctly handles error', async () => {
        const setMembers = jest.fn();
        const setInactiveMembers = jest.fn();
        const callAPI = jest.fn().mockImplementation(() => {
            throw new Error('API error');
        });

        await act(async () => {
            loadMembers(setMembers, setInactiveMembers, callAPI);
        });

        expect(setMembers).not.toHaveBeenCalled();
        expect(setInactiveMembers).not.toHaveBeenCalled();
    });
});