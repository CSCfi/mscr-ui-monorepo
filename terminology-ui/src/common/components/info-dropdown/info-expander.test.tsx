/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';
import { render, screen } from '@testing-library/react';
import InfoExpander from '@app/common/components/info-dropdown/info-expander';
import { getMockContext, themeProvider } from '@app/tests/test-utils';
import { Provider } from 'react-redux';
import { makeStore } from '@app/store';
import {
  setLogin,
  initialState,
} from '@app/common/components/login/login.slice';
import mockRouter from 'next-router-mock';
import { v4 } from 'uuid';

jest.mock('next/dist/client/router', () => require('next-router-mock'));

describe('infoExpander', () => {
  it('should render export button', () => {
    const store = makeStore(getMockContext());
    mockRouter.setCurrentUrl('/terminology/123-123');

    render(
      <Provider store={store}>
        <InfoExpander
          data={
            {
              properties: {},
              references: {
                contributor: [{ properties: { prefLabel: [] }, id: v4() }],
                inGroup: [{ properties: { prefLabel: [] } }],
              },
            } as any
          }
        />
      </Provider>,
      { wrapper: themeProvider }
    );

    expect(
      screen.getByText('tr-vocabulary-info-vocabulary-export')
    ).toBeInTheDocument();
  });

  it('should render subscribe button', async () => {
    const store = makeStore(getMockContext());
    const loginInitialState = Object.assign({}, initialState);
    loginInitialState['anonymous'] = false;
    loginInitialState['email'] = 'admin@localhost';
    loginInitialState['firstName'] = 'Admin';
    loginInitialState['lastName'] = 'User';
    store.dispatch(setLogin(loginInitialState));

    mockRouter.setCurrentUrl('/terminology/123-123');

    render(
      <Provider store={store}>
        <InfoExpander
          data={
            {
              properties: {},
              references: {
                contributor: [{ properties: { prefLabel: [] }, id: v4() }],
                inGroup: [{ properties: { prefLabel: [] } }],
              },
            } as any
          }
        />
      </Provider>,
      { wrapper: themeProvider }
    );

    await expect(
      screen.findByText('tr-email-subscription-add')
    ).resolves.toBeInTheDocument();
  });

  it('should render createdBy and modifiedBy when available', () => {
    const store = makeStore(getMockContext());
    const loginInitialState = Object.assign({}, initialState);
    loginInitialState['anonymous'] = false;
    loginInitialState['email'] = 'admin@localhost';
    loginInitialState['firstName'] = 'Admin';
    loginInitialState['lastName'] = 'User';
    store.dispatch(setLogin(loginInitialState));

    mockRouter.setCurrentUrl('/terminology/123-123');

    render(
      <Provider store={store}>
        <InfoExpander
          data={
            {
              createdBy: 'Creator',
              createdDate: '1970-01-01T00:00:00.000+00:00',
              lastModifiedBy: 'Modifier',
              lastModifiedDate: '1970-01-02T00:00:00.000+00:00',
              properties: {},
              references: {
                contributor: [{ properties: { prefLabel: [] }, id: v4() }],
                inGroup: [{ properties: { prefLabel: [] } }],
              },
            } as any
          }
        />
      </Provider>,
      { wrapper: themeProvider }
    );

    expect(screen.getByText(/1.1.1970, 0.00/)).toBeInTheDocument();
    expect(screen.getByText(/Creator/)).toBeInTheDocument();

    expect(screen.getByText(/2.1.1970, 0.00/)).toBeInTheDocument();
    expect(screen.getByText(/Modifier/)).toBeInTheDocument();
  });

  it('should render one or multiple organizations', () => {
    const store = makeStore(getMockContext());
    const loginInitialState = Object.assign({}, initialState);
    loginInitialState['anonymous'] = false;
    loginInitialState['email'] = 'admin@localhost';
    loginInitialState['firstName'] = 'Admin';
    loginInitialState['lastName'] = 'User';
    store.dispatch(setLogin(loginInitialState));

    mockRouter.setCurrentUrl('/terminology/123-123');

    render(
      <Provider store={store}>
        <InfoExpander
          data={
            {
              createdBy: 'Creator',
              createdDate: '1970-01-01T00:00:00.000+00:00',
              lastModifiedBy: 'Modifier',
              lastModifiedDate: '1970-01-02T00:00:00.000+00:00',
              properties: {},
              references: {
                contributor: [
                  {
                    id: 'testi 1',
                    properties: {
                      prefLabel: [{ lang: 'en', value: 'testi 1' }],
                    },
                  },
                  {
                    id: 'testi 2',
                    properties: {
                      prefLabel: [{ lang: 'en', value: 'testi 2' }],
                    },
                  },
                  {
                    id: 'testi 3',
                    properties: {
                      prefLabel: [{ lang: 'en', value: 'testi 3' }],
                    },
                  },
                ],
                inGroup: [{ properties: { prefLabel: [] } }],
              },
            } as any
          }
        />
      </Provider>,
      { wrapper: themeProvider }
    );

    expect(screen.getByText('testi 1')).toBeInTheDocument();
    expect(screen.getByText('testi 2')).toBeInTheDocument();
    expect(screen.getByText('testi 3')).toBeInTheDocument();
  });
});
