import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { HYDRATE } from 'next-redux-wrapper';
import { getDataTypeRegistryBaseQuery } from '@app/store/api-base-query';

export const dataTypeApi = createApi({
  reducerPath: 'dataTypeApi',
  baseQuery: getDataTypeRegistryBaseQuery(),
  // baseQuery: fetchBaseQuery({baseUrl: process.env.DTR_URL ?? 'noBaseUrl'}),
  tagTypes: ['DataTypes'],
  extractRehydrationInfo(action, { reducerPath }) {
    if (action.type === HYDRATE) {
      return action.payload[reducerPath];
    }
  },
  endpoints: (builder) => ({
    getTypesCollection: builder.query<Object, void>({
      query: () => ({
        url: '/collections/types',
        method: 'GET',
      }),
    }),
  }),
});

export const { useGetTypesCollectionQuery } = dataTypeApi;
