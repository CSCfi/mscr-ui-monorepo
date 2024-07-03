import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { HYDRATE } from 'next-redux-wrapper';
import { getDataTypeRegistryBaseQuery } from '@app/store/api-base-query';
import { DataTypeResults } from '@app/common/interfaces/data-type.interface';

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
    getTypesSearchResults: builder.query<DataTypeResults, string>({
      query: (query) => ({
        url: `/collections/types/documents/search?q=${query}&query_by=name`,
        method: 'GET',
      }),
    }),
  }),
});

export const { useGetTypesCollectionQuery, useGetTypesSearchResultsQuery } = dataTypeApi;
