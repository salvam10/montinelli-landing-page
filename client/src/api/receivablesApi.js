const SERVER_URL = process.env.REACT_APP_SERVER_URL;

/** Obtener facturas pendientes/vencidas de un cliente */
export const getClientInvoices = async (clientId) => {
  const response = await fetch(
    `${SERVER_URL}/api/clients/${clientId}/invoices`,
    {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Error al obtener facturas del cliente");
  }

  return response.json();
};

/** Obtener pagos reportados por un vendedor */
export const getSellerPayments = async (userId) => {
  const response = await fetch(
    `${SERVER_URL}/api/payments/seller/${userId}`,
    {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.message || "Error al obtener pagos del vendedor"
    );
  }

  return response.json();
};

/** Reportar un pago (vendedor → tesorería) */
export const reportPayment = async (paymentData) => {
  const response = await fetch(`${SERVER_URL}/api/payments`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(paymentData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Error al reportar el pago");
  }

  return response.json();
};

/** Subir comprobante de pago a R2 */
export const uploadReceipt = async (paymentId, file) => {
  const formData = new FormData();
  formData.append("receipt", file);

  const response = await fetch(
    `${SERVER_URL}/api/payments/${paymentId}/receipt`,
    {
      method: "POST",
      credentials: "include",
      body: formData,
      // No Content-Type header — FormData lo setea con boundary
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Error al subir el comprobante");
  }

  return response.json();
};

export const extractReceiptData = async (file) => {
  const formData = new FormData();
  formData.append("receipt", file);

  const response = await fetch(`${SERVER_URL}/api/payments/extract-receipt`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!response.ok) return null;

  return response.json();
};

/** Obtener URL firmada del comprobante (admin) */
export const getReceiptUrl = async (paymentId) => {
  const response = await fetch(
    `${SERVER_URL}/api/payments/${paymentId}/receipt`,
    {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Error al obtener el comprobante");
  }

  return response.json();
};

/** Obtener pagos con comprobante para validación (admin) */
export const getPendingReceipts = async () => {
  const response = await fetch(
    `${SERVER_URL}/api/payments/pending-receipts`,
    {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Error al obtener comprobantes");
  }

  return response.json();
};

/** Actualizar estado de un pago (admin: validar o rechazar) */
export const updatePaymentStatus = async (paymentId, status) => {
  const response = await fetch(
    `${SERVER_URL}/api/payments/${paymentId}/status`,
    {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Error al actualizar el estado del pago");
  }

  return response.json();
};
