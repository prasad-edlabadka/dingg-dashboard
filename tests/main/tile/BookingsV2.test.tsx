import { renderHook, act } from '@testing-library/react-hooks';
import { API_BASE_URL } from '../../../src/App'; // replace with your actual import

jest.mock('../../../src/App', () => ({ // replace with your actual import
    callAPIPromise: jest.fn(),
}));

describe('loadAppointments', () => {
    let useLoadAppointments: (arg0: boolean, arg1: any) => any;
    let callAPIPromise: any;

    beforeEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
        jest.spyOn(global, 'Date')
            .mockImplementationOnce(() => new Date('2022-01-01T00:00:00Z').toISOString())
            .mockImplementationOnce(() => new Date('2021-12-31T00:00:00Z').toISOString());
        callAPIPromise = require('your/api/call/location').callAPIPromise; // replace with your actual import
        useLoadAppointments = require('/Users/prasad/Desktop/code/dingg-dashboard/src/main/tile/BookingsV2.tsx').loadAppointments;
    });

    it('should call the API with the correct URL when today is true', async () => {
        const { result } = renderHook(() => useLoadAppointments(true, callAPIPromise));
        await act(async () => {
            await result.current();
        });
        expect(callAPIPromise).toHaveBeenCalledWith(`${API_BASE_URL}/calender/booking?date=2022-01-01`);
    });

    it('should call the API with the correct URL when today is false', async () => {
        const { result } = renderHook(() => useLoadAppointments(false, callAPIPromise));
        await act(async () => {
            await result.current();
        });
        expect(callAPIPromise).toHaveBeenCalledWith(`${API_BASE_URL}/calender/booking?date=2021-12-31`);
    });
});