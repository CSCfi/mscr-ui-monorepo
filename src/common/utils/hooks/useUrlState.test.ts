import { renderHook } from '@testing-library/react-hooks';
import { useRouter } from 'next/router';
import useUrlState, { initialUrlState, isInitial } from './useUrlState';

jest.mock('next/router');
const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('useUrlState', () => {
  test('no query parameters is same as initial state', () => {
    mockedUseRouter.mockReturnValue({
      query: {},
    } as any);

    const { result } = renderHook(() => useUrlState());

    expect(result.current.urlState).toEqual(initialUrlState);
  });

  test('isInitial return true for initialState', () => {
    mockedUseRouter.mockReturnValue({
      query: initialUrlState,
    } as any);

    const { result } = renderHook(() => useUrlState());

    expect(isInitial(result.current.urlState, 'q')).toBeTruthy();
    expect(isInitial(result.current.urlState, 'domain')).toBeTruthy();
    expect(isInitial(result.current.urlState, 'organization')).toBeTruthy();
    expect(isInitial(result.current.urlState, 'status')).toBeTruthy();
    expect(isInitial(result.current.urlState, 'type')).toBeTruthy();
    expect(isInitial(result.current.urlState, 'page')).toBeTruthy();
  });

  test('query parameters are mapped to url state', () => {
    mockedUseRouter.mockReturnValue({
      query: {
        q: 'q-query-param',
        domain: ['domain-query-param'],
        organization: 'organization-query-param',
        status: ['status-query-param'],
        type: 'type-query-param',
        page: '10',
      },
    } as any);

    const { result } = renderHook(() => useUrlState());

    expect(result.current.urlState).toEqual({
      q: 'q-query-param',
      domain: ['domain-query-param'],
      organization: 'organization-query-param',
      status: ['status-query-param'],
      type: 'type-query-param',
      page: 10
    });
  });

  test('in case of non-numerical page, default page number is is used instead', () => {
    mockedUseRouter.mockReturnValue({
      query: {
        page: 'invalid-number',
      },
    } as any);

    const { result } = renderHook(() => useUrlState());

    expect(isInitial(result.current.urlState, 'page')).toBeTruthy();
  });

  test('resetUrlState clears query parameters', () => {
    const push = jest.fn();
    mockedUseRouter.mockReturnValue({
      query: {
        q: 'q-query-param',
        domain: ['domain-query-param'],
        organization: 'organization-query-param',
        status: ['status-query-param'],
        type: 'type-query-param',
        page: '10',
      },
      push,
    } as any);

    const { result } = renderHook(() => useUrlState());
    result.current.resetUrlState();

    expect(push.mock.calls[0][0]).toEqual(expect.objectContaining({
      query: {},
    }));
  });

  test('updateUrlState updates given query parameters', () => {
    const push = jest.fn();
    mockedUseRouter.mockReturnValue({
      query: {
        q: 'q-query-param',
        domain: ['domain-query-param'],
        organization: 'organization-query-param',
        status: ['status-query-param'],
        type: 'type-query-param',
        page: '10',
      },
      push,
    } as any);

    const { result } = renderHook(() => useUrlState());
    result.current.updateUrlState({
      q: 'new-q-query-param',
      domain: ['new-domain-query-param'],
      organization: 'new-organization-query-param',
      status: ['new-status-query-param'],
      type: 'new-type-query-param',
      page: 11,
    });

    expect(push.mock.calls[0][0]).toEqual(expect.objectContaining({
      query: {
        q: 'new-q-query-param',
        domain: ['new-domain-query-param'],
        organization: 'new-organization-query-param',
        status: ['new-status-query-param'],
        type: 'new-type-query-param',
        page: 11,
      },
    }));
  });

  test('patchUrlState updates given query parameters', () => {
    const push = jest.fn();
    mockedUseRouter.mockReturnValue({
      query: {
        q: 'q-query-param',
        domain: ['domain-query-param'],
        organization: 'organization-query-param',
        status: ['status-query-param'],
        type: 'type-query-param',
        page: '10',
      },
      push,
    } as any);

    const { result } = renderHook(() => useUrlState());
    result.current.patchUrlState({
      q: 'new-q-query-param',
    });

    expect(push.mock.calls[0][0]).toEqual(expect.objectContaining({
      query: expect.objectContaining({
        q: 'new-q-query-param',
      }),
    }));
  });

  test('patchUrlState does not update other query parameters', () => {
    const push = jest.fn();
    mockedUseRouter.mockReturnValue({
      query: {
        q: 'q-query-param',
        domain: ['domain-query-param'],
        organization: 'organization-query-param',
        status: ['status-query-param'],
        type: 'type-query-param',
        page: '10',
      },
      push,
    } as any);

    const { result } = renderHook(() => useUrlState());
    result.current.patchUrlState({
      q: 'new-q-query-param',
    });

    expect(push.mock.calls[0][0]).toEqual(expect.objectContaining({
      query: expect.objectContaining({
        domain: ['domain-query-param'],
        organization: 'organization-query-param',
        status: ['status-query-param'],
        type: 'type-query-param',
        page: 10,
      }),
    }));
  });
});