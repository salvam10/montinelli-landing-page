import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useDispatch, useSelector } from "react-redux";
import PendingReceiptsPage from "./PendingReceiptsPage";
import {
  changePaymentStatus,
  fetchPendingReceipts,
} from "../slices/pendingReceiptsSlice";

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock("../slices/pendingReceiptsSlice", () => ({
  fetchPendingReceipts: jest.fn(() => ({ type: "pendingReceipts/fetchPendingReceipts" })),
  changePaymentStatus: jest.fn(() => ({ type: "pendingReceipts/changePaymentStatus" })),
}));

jest.mock("../../api/receivablesApi", () => ({
  getReceiptUrl: jest.fn(),
}));

jest.mock("../receivables/components/AdminReportPaymentModal", () => {
  return function MockAdminReportPaymentModal({ onClose, onSuccess }) {
    return (
      <div data-testid="admin-report-payment-modal">
        <button onClick={onClose}>Cerrar modal admin</button>
        <button onClick={async () => onSuccess?.()}>Completar reporte admin</button>
      </div>
    );
  };
});

const dispatchMock = jest.fn();

const defaultState = {
  pendingReceipts: {
    items: [
      {
        id: 1,
        client_name: "Farmacia Central",
        reported_by_name: "Ana Pérez",
        method: "transferencia",
        amount: 100,
        status: "pendiente_validacion",
        created_at: "2026-05-14T10:00:00.000Z",
        reference: "REF-1",
        receipt_url: "receipt-1.png",
      },
    ],
    isLoading: false,
    hasError: false,
    error: null,
    isSubmittingPayment: false,
    submitError: null,
  },
};

describe("PendingReceiptsPage", () => {
  beforeEach(() => {
    dispatchMock.mockReset();
    fetchPendingReceipts.mockClear();
    changePaymentStatus.mockClear();

    useDispatch.mockReturnValue(dispatchMock);
    useSelector.mockImplementation((selector) => selector(defaultState));
    dispatchMock.mockImplementation((action) => Promise.resolve(action));
  });

  test("abre y cierra el modal admin desde el CTA Reportar pago", () => {
    render(<PendingReceiptsPage />);

    fireEvent.click(screen.getByRole("button", { name: /reportar pago/i }));
    expect(screen.getByTestId("admin-report-payment-modal")).toBeInTheDocument();

    fireEvent.click(screen.getByText(/cerrar modal admin/i));
    expect(screen.queryByTestId("admin-report-payment-modal")).not.toBeInTheDocument();
  });

  test("refresca la lista al completar un reporte admin exitoso", async () => {
    render(<PendingReceiptsPage />);

    expect(fetchPendingReceipts).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: /reportar pago/i }));
    fireEvent.click(screen.getByText(/completar reporte admin/i));

    await waitFor(() => {
      expect(fetchPendingReceipts).toHaveBeenCalledTimes(2);
    });

    expect(screen.queryByTestId("admin-report-payment-modal")).not.toBeInTheDocument();
  });
});
