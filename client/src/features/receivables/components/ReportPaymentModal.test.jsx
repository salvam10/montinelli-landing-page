import React, { act } from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { useDispatch, useSelector } from "react-redux";
import ReportPaymentModal from "./ReportPaymentModal";
import { submitPaymentReport } from "../../slices/sellerPaymentsSlice";

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock("../../slices/sellerPaymentsSlice", () => ({
  submitPaymentReport: jest.fn(),
}));

jest.mock("../../slices/clientInvoicesSlice", () => ({
  fetchClientInvoices: jest.fn((clientId) => ({
    type: "clientInvoices/fetchClientInvoices",
    payload: clientId,
  })),
}));

jest.mock("../../../api/receivablesApi", () => ({
  uploadReceipt: jest.fn(),
}));

const dispatchMock = jest.fn();

const defaultClient = {
  client_id: 7,
  client_name: "Farmacia Central",
  gross_debt: 1500,
  net_debt: 1200,
};

const renderModal = () =>
  render(
    <ReportPaymentModal
      clients={[defaultClient]}
      initialClient={defaultClient}
      onClose={jest.fn()}
      userId={99}
    />
  );

const goToStepOne = async () => {
  const view = renderModal();
  const fileInput = view.container.querySelector('input[type="file"]');
  const file = new File(["receipt"], "receipt.png", { type: "image/png" });

  fireEvent.change(fileInput, { target: { files: [file] } });

  await waitFor(() => {
    expect(screen.getByText("receipt.png")).toBeInTheDocument();
  });

  fireEvent.click(screen.getByRole("button", { name: /continuar/i }));

  return view;
};

beforeAll(() => {
  global.FileReader = class MockFileReader {
    readAsDataURL() {
      this.result = "data:image/png;base64,receipt";
      this.onload();
    }
  };
});

beforeEach(() => {
  dispatchMock.mockReset();
  submitPaymentReport.mockReset();

  useDispatch.mockReturnValue(dispatchMock);
  useSelector.mockImplementation((selector) =>
    selector({
      sellerPayments: { isSubmitting: false },
      clientInvoices: { items: [] },
    })
  );

  submitPaymentReport.mockImplementation((paymentData) => ({
    type: "sellerPayments/submitPaymentReport",
    meta: { paymentData },
  }));

  dispatchMock.mockImplementation((action) => {
    if (action?.type === "sellerPayments/submitPaymentReport") {
      return {
        unwrap: () => Promise.resolve({ id: 501 }),
      };
    }

    return action;
  });
});

describe("ReportPaymentModal", () => {
  test("muestra el select de tipo de pago con sus opciones en el paso 1", async () => {
    await goToStepOne();

    const placeholderOption = screen.getByRole("option", {
      name: /seleccionar tipo de pago/i,
    });
    const paymentTypeSelect = placeholderOption.closest("select");

    expect(paymentTypeSelect).toBeInTheDocument();
    expect(within(paymentTypeSelect).getByRole("option", { name: "Pago de factura" })).toBeInTheDocument();
    expect(within(paymentTypeSelect).getByRole("option", { name: "Retención" })).toBeInTheDocument();
    expect(within(paymentTypeSelect).getByRole("option", { name: "Ambos" })).toBeInTheDocument();
    expect(within(paymentTypeSelect).getAllByRole("option")).toHaveLength(4);
  });

  test("no permite avanzar al paso 2 sin seleccionar tipo de pago", async () => {
    await goToStepOne();

    fireEvent.change(screen.getByPlaceholderText("0.00"), {
      target: { value: "250" },
    });

    expect(screen.getByRole("button", { name: /revisar/i })).toBeDisabled();
  });

  test("incluye payment_type en el payload al enviar el reporte", async () => {
    await goToStepOne();

    fireEvent.change(screen.getByPlaceholderText("0.00"), {
      target: { value: "250" },
    });

    fireEvent.change(screen.getByRole("option", {
      name: /seleccionar tipo de pago/i,
    }).closest("select"), {
      target: { value: "retencion" },
    });

    fireEvent.click(screen.getByRole("button", { name: /revisar/i }));

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /enviar a tesorería/i }));
    });

    await waitFor(() => {
      expect(submitPaymentReport).toHaveBeenCalledWith(
        expect.objectContaining({ payment_type: "retencion" })
      );
    });

    await screen.findByText(/pago enviado/i);
  });
});
