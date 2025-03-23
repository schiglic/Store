import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from './constants'; // Імпортуємо BASE_URL

export const api = createApi({
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL, // Використовуємо BASE_URL із constants.ts
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('jwtToken');
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        deleteCategory: builder.mutation<void, number>({
            query: (id) => ({
                url: `/api/categories/${id}`,
                method: 'DELETE',
            }),
        }),
    }),
});

export const { useDeleteCategoryMutation } = api;

export const store = configureStore({
    reducer: {
        [api.reducerPath]: api.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(api.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;