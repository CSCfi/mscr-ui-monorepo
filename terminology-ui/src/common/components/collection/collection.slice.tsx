import { createApi } from '@reduxjs/toolkit/query/react';
import { Collection } from '@app/common/interfaces/collection.interface';
import { getTerminologyApiBaseQuery } from '@app/store/api-base-query';
import { HYDRATE } from 'next-redux-wrapper';

export const collectionApi = createApi({
  reducerPath: 'collectionAPI',
  baseQuery: getTerminologyApiBaseQuery(),
  extractRehydrationInfo(action, { reducerPath }) {
    if (action.type === HYDRATE) {
      return action.payload[reducerPath];
    }
  },
  tagTypes: ['Collection'],
  endpoints: (builder) => ({
    getCollection: builder.query<
      Collection,
      { terminologyId: string; collectionId: string }
    >({
      query: ({ terminologyId, collectionId }) => ({
        url: `/collection?graphId=${terminologyId}&collectionId=${collectionId}`,
        method: 'GET',
      }),
    }),
    getCollections: builder.query<Collection[], string>({
      query: (terminologyId) => ({
        url: `/collections?graphId=${terminologyId}`,
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useGetCollectionQuery,
  useGetCollectionsQuery,
  util: { getRunningQueriesThunk },
} = collectionApi;

export const { getCollection, getCollections } = collectionApi.endpoints;
