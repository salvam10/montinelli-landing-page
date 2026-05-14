import React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import ReportPaymentModal from "./ReportPaymentModal";
import { extractReceiptData, uploadReceipt } from "../../../api/receivablesApi";

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

const defaultClient = {
  client_id: 7,
  client_name: "Farmacia Central",
  gross_debt: 1500,
  net_debt: 1200,
};

const submitPaymentMock = jest.fn();

const renderModal = (props = {}) =>
  render(
    <ReportPaymentModal
      clients={props.clients || [defaultClient]}
      initialClient={Object.prototype.hasOwnProperty.call(props, "initialClient") ? props.initialClient : defaultClient}
      onClose={jest.fn()}
      submitPayment={submitPaymentMock}
      isSubmitting={false}
      {...props}
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

const getAmountInput = () => screen.getByPlaceholderText("0,00");

beforeAll(() => {
  global.FileReader = class MockFileReader {
    readAsDataURL() {
      this.result = "data:image/png;base64,receipt";
      this.onload();
    }
  };
});

beforeEach(() => {
  submitPaymentMock.mockReset();
  extractReceiptData.mockReset();
  uploadReceipt.mockReset();

  submitPaymentMock.mockResolvedValue({ id: 501 });
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

    const amountInput = screen.getByDisplayValue("1.500,00");
    const dateInput = screen.getByDisplayValue("2026-05-10");
    const referenceInput = screen.getByDisplayValue("12345");

    expect(amountInput).toBeInTheDocument();
    expect(dateInput).toBeInTheDocument();
    expect(referenceInput).toBeInTheDocument();

    fireEvent.change(amountInput, { target: { value: "1750.5" } });
    fireEvent.change(dateInput, { target: { value: "2026-05-11" } });
    fireEvent.change(referenceInput, { target: { value: "54321" } });
    fireEvent.click(screen.getByRole("button", { name: /transferencia/i }));

    expect(screen.getByDisplayValue("1750.5")).toBeInTheDocument();
    expect(screen.getByDisplayValue("2026-05-11")).toBeInTheDocument();
    expect(screen.getByDisplayValue("54321")).toBeInTheDocument();
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
    expect(getAmountInput()).toHaveValue("");
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

    fireEvent.change(getAmountInput(), {
      target: { value: "250" },
    });

    expect(screen.getByRole("button", { name: /revisar/i })).toBeDisabled();
  });

  test("envía sólo campos de negocio al submit inyectado", async () => {
    await goToStepOne();

    fireEvent.change(getAmountInput(), {
      target: { value: "250" },
    });

    fireEvent.click(screen.getByRole("button", { name: /retención/i }));

    fireEvent.click(screen.getByRole("button", { name: /revisar/i }));

    await waitFor(() => {
      fireEvent.click(screen.getByRole("button", { name: /enviar a tesorería/i }));
    });

    await waitFor(() => {
      expect(submitPaymentMock).toHaveBeenCalledWith(
        expect.objectContaining({
          client_id: defaultClient.client_id,
          payment_type: "retencion",
        })
      );
    });

    expect(submitPaymentMock).toHaveBeenCalledWith(
      expect.not.objectContaining({
        reported_by: expect.anything(),
      })
    );
    expect(submitPaymentMock).toHaveBeenCalledWith(
      expect.not.objectContaining({
        status: expect.anything(),
      })
    );

    await screen.findByText(/pago enviado/i);
  });

  test("muestra el buscador de clientes y copy inyectado en contexto admin", async () => {
    renderModal({
      initialClient: null,
      successCopy: {
        title: "Pago registrado",
        description: "El pago quedó listo para validación administrativa.",
      },
      stepCopy: {
        upload: "Subí el comprobante enviado por el cliente",
        details: "Elegí el cliente y verificá los datos",
        review: "Revisá y registrá el pago",
      },
    });

    expect(screen.getByText(/subí el comprobante enviado por el cliente/i)).toBeInTheDocument();

    const actualFileInput = document.querySelector('input[type="file"]');
    const file = new File(["receipt"], "receipt.png", { type: "image/png" });
    fireEvent.change(actualFileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText("receipt.png")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /continuar/i }));

    expect(screen.getByPlaceholderText(/buscar cliente/i)).toBeInTheDocument();
    expect(screen.getByText(/elegí el cliente y verificá los datos/i)).toBeInTheDocument();
  });
});
