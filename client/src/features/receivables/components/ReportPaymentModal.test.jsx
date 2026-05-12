import React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { useDispatch, useSelector } from "react-redux";
import ReportPaymentModal from "./ReportPaymentModal";
import { submitPaymentReport } from "../../slices/sellerPaymentsSlice";
import { extractReceiptData } from "../../../api/receivablesApi";

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
  extractReceiptData: jest.fn(),
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

const createDeferred = () => {
  let resolve;
  let reject;

  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
};

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
  extractReceiptData.mockReset();

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

  extractReceiptData.mockResolvedValue(null);
});

describe("ReportPaymentModal", () => {
  test("muestra el estado de extracción mientras corre el OCR", async () => {
    const deferred = createDeferred();
    extractReceiptData.mockReturnValue(deferred.promise);

    await goToStepOne();

    expect(
      screen.getByText(/extrayendo datos del comprobante/i)
    ).toBeInTheDocument();

    deferred.resolve({});

    await waitFor(() => {
      expect(
        screen.queryByText(/extrayendo datos del comprobante/i)
      ).not.toBeInTheDocument();
    });
  });

  test("precompleta datos del OCR y permite editarlos", async () => {
    extractReceiptData.mockResolvedValue({
      amount: 1500,
      date: "2026-05-10",
      reference: "12345",
      bank: "Banesco",
      method: "zelle",
    });

    await goToStepOne();

    expect(
      await screen.findByText(/datos extraídos del comprobante/i)
    ).toBeInTheDocument();

    const amountInput = screen.getByDisplayValue("1500");
    const dateInput = screen.getByDisplayValue("2026-05-10");
    const referenceInput = screen.getByDisplayValue("12345");
    const bankSelect = screen.getByDisplayValue("Banesco");
    const zelleButton = screen.getByRole("button", { name: "zelle" });

    expect(amountInput).toBeInTheDocument();
    expect(dateInput).toBeInTheDocument();
    expect(referenceInput).toBeInTheDocument();
    expect(bankSelect).toBeInTheDocument();
    expect(zelleButton).toHaveAttribute("aria-pressed", "true");

    fireEvent.change(amountInput, { target: { value: "1750.5" } });
    fireEvent.change(dateInput, { target: { value: "2026-05-11" } });
    fireEvent.change(referenceInput, { target: { value: "54321" } });
    fireEvent.change(bankSelect, { target: { value: "Mercantil" } });
    fireEvent.click(screen.getByRole("button", { name: /transferencia/i }));

    expect(screen.getByDisplayValue("1750.5")).toBeInTheDocument();
    expect(screen.getByDisplayValue("2026-05-11")).toBeInTheDocument();
    expect(screen.getByDisplayValue("54321")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Mercantil")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /transferencia/i })
    ).toHaveAttribute("aria-pressed", "true");
  });

  test("muestra fallback cuando OCR falla y no bloquea el avance al paso 1", async () => {
    extractReceiptData.mockRejectedValue(new Error("ocr failed"));

    await goToStepOne();

    expect(
      await screen.findByText(/no pudimos extraer los datos, completá manualmente/i)
    ).toBeInTheDocument();

    expect(screen.getByText("Cliente")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("0.00")).toHaveValue(null);
  });

  test("muestra chips de tipo de pago en lugar de un select", async () => {
    await goToStepOne();

    expect(
      screen.queryByRole("option", { name: /pago de factura/i })
    ).not.toBeInTheDocument();

    const paymentTypeButtons = [
      screen.getByRole("button", { name: /pago de factura/i }),
      screen.getByRole("button", { name: /retención/i }),
      screen.getByRole("button", { name: /ambos/i }),
    ];

    expect(paymentTypeButtons).toHaveLength(3);
  });

  test("permite seleccionar un solo chip de tipo de pago a la vez", async () => {
    await goToStepOne();

    const invoiceButton = screen.getByRole("button", {
      name: /pago de factura/i,
    });
    const retentionButton = screen.getByRole("button", { name: /retención/i });
    const bothButton = screen.getByRole("button", { name: /ambos/i });

    expect(invoiceButton).toHaveAttribute("aria-pressed", "false");
    expect(retentionButton).toHaveAttribute("aria-pressed", "false");
    expect(bothButton).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(retentionButton);

    expect(retentionButton).toHaveAttribute("aria-pressed", "true");
    expect(invoiceButton).toHaveAttribute("aria-pressed", "false");
    expect(bothButton).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(bothButton);

    expect(bothButton).toHaveAttribute("aria-pressed", "true");
    expect(retentionButton).toHaveAttribute("aria-pressed", "false");
  });

  test("sigue requiriendo seleccionar tipo de pago para avanzar al paso 2", async () => {
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

    fireEvent.click(screen.getByRole("button", { name: /retención/i }));

    fireEvent.click(screen.getByRole("button", { name: /revisar/i }));

    await waitFor(() => {
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
