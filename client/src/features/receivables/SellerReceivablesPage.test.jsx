import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";

// ─── Mock slices to avoid axios/ESM issues ───────────────────────────────────
jest.mock("../slices/sellerReceivablesSlice", () => {
  const { createSlice, createAsyncThunk } = jest.requireActual(
    "@reduxjs/toolkit"
  );
  const fetchSellerReceivables = createAsyncThunk(
    "sellerReceivables/fetchSellerReceivables",
    async () => []
  );
  const slice = createSlice({
    name: "sellerReceivables",
    initialState: { items: [], isLoading: false, hasError: false, error: null },
    reducers: {},
    extraReducers: (b) => {
      b.addCase(fetchSellerReceivables.pending, (s) => { s.isLoading = true; });
      b.addCase(fetchSellerReceivables.fulfilled, (s, a) => { s.isLoading = false; s.items = a.payload; });
      b.addCase(fetchSellerReceivables.rejected, (s, a) => { s.isLoading = false; s.hasError = true; s.error = a.payload || "Error"; });
    },
  });
  return { __esModule: true, fetchSellerReceivables, default: slice.reducer };
});

jest.mock("../slices/sellerPaymentsSlice", () => {
  const { createSlice, createAsyncThunk } = jest.requireActual(
    "@reduxjs/toolkit"
  );
  const fetchSellerPayments = createAsyncThunk(
    "sellerPayments/fetchSellerPayments",
    async () => []
  );
  const slice = createSlice({
    name: "sellerPayments",
    initialState: { items: [], isLoading: false, hasError: false, error: null, isSubmitting: false },
    reducers: {},
    extraReducers: (b) => {
      b.addCase(fetchSellerPayments.pending, (s) => { s.isLoading = true; });
      b.addCase(fetchSellerPayments.fulfilled, (s, a) => { s.isLoading = false; s.items = a.payload; });
      b.addCase(fetchSellerPayments.rejected, (s, a) => { s.isLoading = false; s.hasError = true; s.error = a.payload || "Error"; });
    },
  });
  return { __esModule: true, fetchSellerPayments, default: slice.reducer };
});

jest.mock("../slices/clientInvoicesSlice", () => {
  const { createSlice, createAsyncThunk } = jest.requireActual(
    "@reduxjs/toolkit"
  );
  const fetchClientInvoices = createAsyncThunk(
    "clientInvoices/fetchClientInvoices",
    async () => []
  );
  const slice = createSlice({
    name: "clientInvoices",
    initialState: { items: [], isLoading: false, hasError: false, error: null, clientId: null },
    reducers: { clearInvoices: (s) => { s.items = []; } },
    extraReducers: (b) => {
      b.addCase(fetchClientInvoices.pending, (s) => { s.isLoading = true; });
      b.addCase(fetchClientInvoices.fulfilled, (s, a) => { s.isLoading = false; s.items = a.payload; });
    },
  });
  return {
    __esModule: true,
    fetchClientInvoices,
    clearInvoices: slice.actions.clearInvoices,
    default: slice.reducer,
  };
});

// Mock heavy child components to keep tests focused on page behavior
jest.mock("./components/ClientDrawer", () => {
  return function MockClientDrawer({ client, onClose }) {
    if (!client) return null;
    return (
      <div data-testid="client-drawer">
        <span>{client.client_name}</span>
        <button onClick={onClose}>Cerrar</button>
      </div>
    );
  };
});

jest.mock("./components/ReportPaymentModal", () => {
  return function MockReportPaymentModal({ onClose }) {
    return (
      <div data-testid="report-payment-modal">
        <button onClick={onClose}>Cerrar modal</button>
      </div>
    );
  };
});

import SellerReceivablesPage, {
  calculateTotalNetDebt,
} from "./SellerReceivablesPage";
import sellerReceivablesReducer from "../slices/sellerReceivablesSlice";
import sellerPaymentsReducer from "../slices/sellerPaymentsSlice";
import clientInvoicesReducer from "../slices/clientInvoicesSlice";

// ─── Unit tests: pure function ─────────────────────────────────────────────
describe("calculateTotalNetDebt", () => {
  test("returns sum of net_debt across multiple clients", () => {
    const items = [
      { net_debt: "100.00" },
      { net_debt: "250.50" },
      { net_debt: "49.50" },
    ];
    expect(calculateTotalNetDebt(items)).toBeCloseTo(400.0, 2);
  });

  test("returns 0 for empty array", () => {
    expect(calculateTotalNetDebt([])).toBe(0);
  });

  test("handles null/undefined net_debt gracefully (treats as 0)", () => {
    const items = [
      { net_debt: null },
      { net_debt: undefined },
      { net_debt: "200.00" },
    ];
    expect(calculateTotalNetDebt(items)).toBeCloseTo(200.0, 2);
  });
});

// ─── Integration tests: component rendering ────────────────────────────────
const makeStore = (sellerReceivables, sellerPayments, clientInvoices) =>
  configureStore({
    reducer: {
      sellerReceivables: sellerReceivablesReducer,
      sellerPayments: sellerPaymentsReducer,
      clientInvoices: clientInvoicesReducer,
    },
    preloadedState: {
      sellerReceivables,
      sellerPayments: sellerPayments || {
        items: [],
        isLoading: false,
        hasError: false,
        error: null,
        isSubmitting: false,
      },
      clientInvoices: clientInvoices || {
        items: [],
        isLoading: false,
        hasError: false,
        error: null,
        clientId: null,
      },
    },
  });

const renderPage = (storeState, paymentsState, invoicesState) =>
  render(
    <MemoryRouter>
      <Provider store={makeStore(storeState, paymentsState, invoicesState)}>
        <SellerReceivablesPage user={null} />
      </Provider>
    </MemoryRouter>
  );

describe("SellerReceivablesPage — loading state", () => {
  test("shows loading indicator when isLoading is true", () => {
    renderPage({ items: [], isLoading: true, hasError: false, error: null });
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });
});

describe("SellerReceivablesPage — error state", () => {
  test("shows error message when hasError is true", () => {
    renderPage({
      items: [],
      isLoading: false,
      hasError: true,
      error: "Error de red",
    });
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Error de red");
  });
});

describe("SellerReceivablesPage — empty state", () => {
  test("shows empty state message when items is empty array", () => {
    renderPage({ items: [], isLoading: false, hasError: false, error: null });
    expect(screen.getByText(/sin clientes/i)).toBeInTheDocument();
  });
});

const sampleItems = [
  {
    client_id: 1,
    client_name: "Cliente Alpha",
    phone: "04141234567",
    credit_days: 30,
    net_debt: "500.00",
    gross_debt: "600.00",
    client_credits: "100.00",
    overdue_amount: "200.00",
    overdue_invoices_count: 2,
    pending_amount: "300.00",
    pending_invoices_count: 3,
    max_morosidad_days: 15,
    last_payment: "2026-04-01",
    trend: [100, 200, 150, 300, 200],
  },
  {
    client_id: 2,
    client_name: "Cliente Beta",
    phone: null,
    credit_days: 0,
    net_debt: "250.00",
    gross_debt: "250.00",
    client_credits: "0.00",
    overdue_amount: "0.00",
    overdue_invoices_count: 0,
    pending_amount: "250.00",
    pending_invoices_count: 1,
    max_morosidad_days: 0,
    last_payment: null,
    trend: [50, 80, 60, 100, 250],
  },
];

describe("SellerReceivablesPage — data state", () => {
  const storeState = {
    items: sampleItems,
    isLoading: false,
    hasError: false,
    error: null,
  };

  test("renders client names in the list", () => {
    renderPage(storeState);
    expect(screen.getByText("Cliente Alpha")).toBeInTheDocument();
    expect(screen.getByText("Cliente Beta")).toBeInTheDocument();
  });

  test("renders footer total net debt", () => {
    renderPage(storeState);
    expect(screen.getByTestId("footer-total-net-debt")).toHaveTextContent("750");
  });

  test("renders page title", () => {
    renderPage(storeState);
    expect(screen.getByText(/cuenta.*cobrar/i)).toBeInTheDocument();
  });

  test("renders summary cards", () => {
    renderPage(storeState);
    expect(screen.getByText(/por cobrar.*neto/i)).toBeInTheDocument();
    // "Vencido" and "Crítico" appear in both summary card and filter chips
    expect(screen.getAllByText("Vencido").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/crítico/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/composición de cartera/i)).toBeInTheDocument();
  });

  test("filters clients by search", () => {
    renderPage(storeState);
    const input = screen.getByPlaceholderText(/buscar cliente/i);
    fireEvent.change(input, { target: { value: "Alpha" } });
    expect(screen.getByText("Cliente Alpha")).toBeInTheDocument();
    expect(screen.queryByText("Cliente Beta")).not.toBeInTheDocument();
  });

  test("opens drawer when clicking a client row", () => {
    renderPage(storeState);
    fireEvent.click(screen.getByText("Cliente Alpha"));
    expect(screen.getByTestId("client-drawer")).toBeInTheDocument();
  });

  test("opens report payment modal when clicking header button", () => {
    renderPage(storeState);
    fireEvent.click(screen.getByText(/reportar pago/i));
    expect(screen.getByTestId("report-payment-modal")).toBeInTheDocument();
  });

  test("opens seller payments panel when clicking header button", () => {
    renderPage(storeState, {
      items: [
        {
          id: 101,
          client_id: 1,
          client_name: "Cliente Alpha",
          amount: "350.00",
          method: "transferencia",
          reference: "ABC123",
          status: "pendiente_validacion",
          payment_date: "2026-05-05",
          notes: "Pago reportado por transferencia",
          receipt_url: "receipts/test.pdf",
        },
      ],
      isLoading: false,
      hasError: false,
      error: null,
      isSubmitting: false,
    });

    fireEvent.click(screen.getByText(/mis pagos reportados/i));

    const panel = screen.getByTestId("seller-payments-panel");

    expect(panel).toBeInTheDocument();
    expect(within(panel).getByText(/cliente alpha/i)).toBeInTheDocument();
    expect(within(panel).getByText(/test\.pdf/i)).toBeInTheDocument();
    expect(within(panel).getAllByText(/en revisión/i).length).toBeGreaterThan(0);
  });

  test("filters seller payments panel by search and status", () => {
    renderPage(storeState, {
      items: [
        {
          id: 101,
          client_id: 1,
          client_name: "Cliente Alpha",
          amount: "350.00",
          method: "transferencia",
          reference: "ABC123",
          status: "pendiente_validacion",
          payment_date: "2026-05-05",
        },
        {
          id: 102,
          client_id: 2,
          client_name: "Cliente Beta",
          amount: "120.00",
          method: "efectivo",
          reference: "XYZ999",
          status: "validado",
          payment_date: "2026-05-06",
        },
      ],
      isLoading: false,
      hasError: false,
      error: null,
      isSubmitting: false,
    });

    fireEvent.click(screen.getByText(/mis pagos reportados/i));
    const panel = screen.getByTestId("seller-payments-panel");

    fireEvent.click(within(panel).getByRole("button", { name: /validados/i }));

    expect(within(panel).getByText(/cliente beta/i)).toBeInTheDocument();
    expect(within(panel).queryByText(/cliente alpha/i)).not.toBeInTheDocument();

    fireEvent.change(
      within(panel).getByPlaceholderText(/buscar por cliente, referencia o método/i),
      { target: { value: "XYZ999" } }
    );

    expect(within(panel).getByText(/cliente beta/i)).toBeInTheDocument();
  });
});

// ─── Quick filters — acceptance criteria ────────────────────────────────────
// Sample data covering multiple buckets:
//   Alpha  → overdue 200, 15d mora → "reciente" (1-29 días)
//   Beta   → overdue 0, pending 250 → "por_vencer"
//   Gamma  → overdue 500, 65d mora → "critico" (+60 días)
//   Delta  → overdue 0, pending 0  → "al_dia"
const multiItems = [
  ...sampleItems,
  {
    client_id: 3,
    client_name: "Cliente Gamma",
    phone: null,
    credit_days: 0,
    net_debt: "500.00",
    gross_debt: "500.00",
    client_credits: "0.00",
    overdue_amount: "500.00",
    overdue_invoices_count: 3,
    pending_amount: "0.00",
    pending_invoices_count: 0,
    max_morosidad_days: 65,
    last_payment: null,
    trend: [400, 300, 350, 450, 500],
  },
  {
    client_id: 4,
    client_name: "Cliente Delta",
    phone: null,
    credit_days: 0,
    net_debt: "0.00",
    gross_debt: "0.00",
    client_credits: "0.00",
    overdue_amount: "0.00",
    overdue_invoices_count: 0,
    pending_amount: "0.00",
    pending_invoices_count: 0,
    max_morosidad_days: 0,
    last_payment: null,
    trend: [0, 0, 0, 0, 0],
  },
];

const multiState = {
  items: multiItems,
  isLoading: false,
  hasError: false,
  error: null,
};

describe("SellerReceivablesPage — quick filters", () => {
  // AC1: renders Todos active and all clients visible by default
  test("AC1: renders Todos active with all clients visible by default", () => {
    renderPage(multiState);
    const todosBtn = screen.getByTestId("filter-todos");
    expect(todosBtn).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Cliente Alpha")).toBeInTheDocument();
    expect(screen.getByText("Cliente Beta")).toBeInTheDocument();
    expect(screen.getByText("Cliente Gamma")).toBeInTheDocument();
    expect(screen.getByText("Cliente Delta")).toBeInTheDocument();
  });

  // AC2: clicking a bucket chip shows only clients in that bucket
  test("AC2: clicking a bucket chip filters to that bucket only", () => {
    renderPage(multiState);
    fireEvent.click(screen.getByTestId("filter-critico"));
    // Only Gamma (65d mora, overdue) is critico
    expect(screen.getByText("Cliente Gamma")).toBeInTheDocument();
    expect(screen.queryByText("Cliente Alpha")).not.toBeInTheDocument();
    expect(screen.queryByText("Cliente Beta")).not.toBeInTheDocument();
    expect(screen.queryByText("Cliente Delta")).not.toBeInTheDocument();
  });

  // AC3: clicking Todos restores all clients
  test("AC3: clicking Todos restores unbucketed list", () => {
    renderPage(multiState);
    fireEvent.click(screen.getByTestId("filter-critico"));
    expect(screen.queryByText("Cliente Alpha")).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId("filter-todos"));
    expect(screen.getByText("Cliente Alpha")).toBeInTheDocument();
    expect(screen.getByText("Cliente Gamma")).toBeInTheDocument();
  });

  // AC4: search composes with active bucket
  test("AC4: search composes with active bucket filter", () => {
    renderPage(multiState);
    // reciente bucket has only Alpha (15d mora, overdue)
    fireEvent.click(screen.getByTestId("filter-reciente"));
    expect(screen.getByText("Cliente Alpha")).toBeInTheDocument();
    // search within that bucket
    const input = screen.getByPlaceholderText(/buscar cliente/i);
    fireEvent.change(input, { target: { value: "Alpha" } });
    expect(screen.getByText("Cliente Alpha")).toBeInTheDocument();
    // search for something not in this bucket
    fireEvent.change(input, { target: { value: "Gamma" } });
    expect(screen.queryByText("Cliente Gamma")).not.toBeInTheDocument();
    expect(screen.queryByText("Cliente Alpha")).not.toBeInTheDocument();
  });

  // AC5: chip counts come from full items, not visible subset
  test("AC5: chip counts are from full items, not filtered subset", () => {
    renderPage(multiState);
    const todosBtn = screen.getByTestId("filter-todos");
    // Todos count should be 4 (total items)
    expect(todosBtn).toHaveTextContent("4");
    // After filtering, the Todos count should STILL be 4
    fireEvent.click(screen.getByTestId("filter-critico"));
    expect(todosBtn).toHaveTextContent("4");
  });

  // AC6: zero-count chips are visible and disabled
  test("AC6: zero-count chips stay visible and are disabled", () => {
    renderPage(multiState);
    // "vencido" bucket (30-60 días) has no clients in our sample data
    const vencidoBtn = screen.getByTestId("filter-vencido");
    expect(vencidoBtn).toBeInTheDocument();
    expect(vencidoBtn).toHaveTextContent("0");
    expect(vencidoBtn).toBeDisabled();
  });

  // AC7: footer total remains global under all local filters
  test("AC7: footer total remains global regardless of filters", () => {
    renderPage(multiState);
    const footer = screen.getByTestId("footer-total-net-debt");
    // total net = 500 + 250 + 500 + 0 = 1250
    const globalTotal = footer.textContent;
    // Apply a filter
    fireEvent.click(screen.getByTestId("filter-critico"));
    expect(screen.getByTestId("footer-total-net-debt")).toHaveTextContent(
      globalTotal
    );
  });

  // AC8: combined bucket + search miss shows contextual empty state
  test("AC8: combined bucket + search miss shows contextual empty state", () => {
    renderPage(multiState);
    fireEvent.click(screen.getByTestId("filter-reciente"));
    const input = screen.getByPlaceholderText(/buscar cliente/i);
    fireEvent.change(input, { target: { value: "NoExiste" } });
    // The empty message includes both the search term and bucket label
    expect(
      screen.getByText(/no se encontraron clientes.*NoExiste.*Mora reciente/i)
    ).toBeInTheDocument();
  });
});
