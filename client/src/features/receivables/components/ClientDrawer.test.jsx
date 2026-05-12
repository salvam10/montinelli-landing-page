import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { useDispatch, useSelector } from "react-redux";
import ClientDrawer from "./ClientDrawer";

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock("../../slices/clientInvoicesSlice", () => ({
  fetchClientInvoices: jest.fn((clientId) => ({
    type: "clientInvoices/fetchClientInvoices",
    payload: clientId,
  })),
  clearInvoices: jest.fn(() => ({
    type: "clientInvoices/clearInvoices",
  })),
}));

const dispatchMock = jest.fn();

const client = {
  client_id: 7,
  client_name: "Farmacia Central",
  credit_days: 30,
  gross_debt: 1500,
  net_debt: 1200,
  client_credits: 300,
  overdue_amount: 500,
  max_morosidad_days: 22,
  phone: null,
};

const renderDrawer = (sellerPayments) => {
  render(
    <ClientDrawer
      client={client}
      onClose={jest.fn()}
      onReportPayment={jest.fn()}
      sellerPayments={sellerPayments}
    />
  );

  fireEvent.click(screen.getByRole("button", { name: /pagos reportados/i }));
};

beforeEach(() => {
  dispatchMock.mockReset();
  useDispatch.mockReturnValue(dispatchMock);
  useSelector.mockImplementation((selector) =>
    selector({
      clientInvoices: { items: [], isLoading: false },
    })
  );
});

describe("ClientDrawer", () => {
  test("muestra la etiqueta 'Pago de factura' cuando payment_type es pago_factura", () => {
    renderDrawer([
      {
        id: 1,
        client_id: 7,
        amount: 100,
        method: "transferencia",
        reference: "ABC123",
        payment_date: "2026-05-12",
        payment_type: "pago_factura",
        status: "pendiente_validacion",
      },
    ]);

    expect(screen.getByText(/pago de factura/i)).toBeInTheDocument();
    expect(screen.getByText(/en revisión/i)).toBeInTheDocument();
  });

  test("muestra la etiqueta 'Retención' cuando payment_type es retencion", () => {
    renderDrawer([
      {
        id: 2,
        client_id: 7,
        amount: 100,
        method: "transferencia",
        reference: "ABC123",
        payment_date: "2026-05-12",
        payment_type: "retencion",
        status: "validado",
      },
    ]);

    expect(screen.getAllByText(/Retención/).length).toBeGreaterThan(0);
    expect(screen.getByText("Validado")).toBeInTheDocument();
  });

  test("no muestra etiqueta de tipo de pago cuando payment_type es null", () => {
    renderDrawer([
      {
        id: 3,
        client_id: 7,
        amount: 100,
        method: "transferencia",
        reference: "ABC123",
        payment_date: "2026-05-12",
        payment_type: null,
        status: "rechazado",
        notes: "Comprobante inválido",
      },
    ]);

    expect(screen.queryByText(/pago de factura/i)).not.toBeInTheDocument();
    expect(screen.queryByText("Retención")).not.toBeInTheDocument();
    expect(screen.queryByText("Ambos")).not.toBeInTheDocument();
    expect(screen.getByText("Rechazado")).toBeInTheDocument();
    expect(screen.getByText("Comprobante inválido")).toBeInTheDocument();
  });
});
