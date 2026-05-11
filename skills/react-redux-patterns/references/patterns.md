# Redux and Component Patterns

## Slice with async thunk

```js
// features/slices/ordersSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchOrdersAPI } from '../../api/ordersApi';

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (filters, { rejectWithValue }) => {
    try {
      return await fetchOrdersAPI(filters);
    } catch (err) {
      return rejectWithValue(err.message); // must call this — don't let it throw
    }
  }
);

const slice = createSlice({
  name: 'orders',
  initialState: { items: [], status: 'idle', error: null },
  reducers: {
    clearOrders: (state) => { state.items = []; state.status = 'idle'; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => { state.status = 'loading'; state.error = null; })
      .addCase(fetchOrders.fulfilled, (state, { payload }) => { state.status = 'succeeded'; state.items = payload; })
      .addCase(fetchOrders.rejected, (state, { payload }) => { state.status = 'failed'; state.error = payload; });
  },
});

export const { clearOrders } = slice.actions;
export const selectOrders = (state) => state.orders.items;
export const selectOrdersStatus = (state) => state.orders.status;
export default slice.reducer;
```

## API layer

```js
// api/ordersApi.js
export async function fetchOrdersAPI({ status } = {}) {
  const params = new URLSearchParams();
  if (status) params.set('status', status);

  const res = await fetch(`/api/orders?${params}`, {
    credentials: 'include', // required — session cookie
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}
```

## Component consuming a slice

```jsx
export default function OrdersList() {
  const dispatch = useDispatch();
  const orders = useSelector(selectOrders);
  const status = useSelector(selectOrdersStatus);

  useEffect(() => {
    if (status === 'idle') dispatch(fetchOrders({}));
  }, [dispatch, status]);

  if (status === 'loading') return <CustomSpinner />;
  if (status === 'failed') return <p className="text-red-500">Error cargando pedidos</p>;

  return (
    <div className="flex flex-col gap-2 p-4">
      {orders.map((o) => <OrderRow key={o.id} order={o} />)}
    </div>
  );
}
```

## Custom hook (encapsulate dispatch + selector)

```js
// hooks/useOrders.js
export function useOrders(filters = {}) {
  const dispatch = useDispatch();
  const orders = useSelector(selectOrders);
  const status = useSelector(selectOrdersStatus);

  useEffect(() => { dispatch(fetchOrders(filters)); }, [dispatch]);

  return { orders, isLoading: status === 'loading', isError: status === 'failed' };
}
```

## Styling: Tailwind vs MUI

```jsx
// ✅ Tailwind for custom layout components
<div className="flex items-center gap-4 rounded-lg bg-white p-6 shadow">

// ✅ MUI DataGrid — use className for Tailwind overrides on the wrapper only
<div className="rounded-lg overflow-hidden">
  <DataGrid rows={orders} columns={cols} />
</div>

// ❌ Never mix sx + className on the same element
<Box sx={{ padding: 2 }} className="p-4">
```
