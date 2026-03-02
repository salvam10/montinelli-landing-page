import { useCallback, useMemo, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import {
  EXCEL_HEADER_ROW_INDEX,
  REQUIRED_COLUMNS,
  formatExcelDate,
  getCreditProfitAmount,
  getDisplayDocumentNumber,
  getPaymentStatusLabel,
  isBlankCell,
  isCreditDocumentType,
  isExcludedDocumentType,
  isInvoiceDocumentType,
  isRowEmpty,
  mapProfitStatusToPaymentStatusId,
  normalizeClientName,
  normalizeHeader,
  normalizeInvoiceNumber,
  normalizeProfitCode,
  normalizeText,
  parseMoneyValue,
  shouldDropByTotals,
} from "../utils";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const buildNormalizedRow = (headerKeys, rowArray) =>
  headerKeys.reduce((acc, key, index) => {
    acc[key] = rowArray[index] ?? "";
    return acc;
  }, {});

const parseAndNormalizeExcel = async (selectedFile) => {
  const buffer = await selectedFile.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const matrixRows = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: "",
  });

  const headerRow = matrixRows[EXCEL_HEADER_ROW_INDEX] || [];
  const headerKeys = headerRow.map(normalizeHeader);
  const bodyRows = matrixRows.slice(EXCEL_HEADER_ROW_INDEX + 1);

  const invoiceRows = [];
  const creditRows = [];
  const normalization = {
    sourceRows: bodyRows.length,
    normalizedRows: 0,
    droppedRows: 0,
    excludedTypeRows: 0,
    unknownTypeRows: 0,
  };

  bodyRows.forEach((rowArray, index) => {
    if (isRowEmpty(rowArray)) {
      normalization.droppedRows += 1;
      return;
    }

    const rawRow = buildNormalizedRow(headerKeys, rowArray);
    if (shouldDropByTotals(rawRow)) {
      normalization.droppedRows += 1;
      return;
    }

    const hasMissingRequiredField = REQUIRED_COLUMNS.some((column) =>
      isBlankCell(rawRow[column]),
    );
    if (hasMissingRequiredField) {
      normalization.droppedRows += 1;
      return;
    }

    const tipoDocumentoOriginal = String(rawRow.tipo_de_documento || "").trim();
    const tipoDocumentoNormalized = normalizeText(tipoDocumentoOriginal);
    const numeroDisplay = getDisplayDocumentNumber(rawRow.numero);
    const numeroNormalized = normalizeInvoiceNumber(rawRow.numero);
    const neto = parseMoneyValue(rawRow.neto);
    const saldo = parseMoneyValue(rawRow.saldo);
    const emision = formatExcelDate(rawRow.emision);

    const normalizedRow = {
      rowId: `excel-${index + EXCEL_HEADER_ROW_INDEX + 2}`,
      codigoCliente: String(rawRow.codigo_cliente || "").trim(),
      cliente: String(rawRow.cliente || "").trim(),
      emision,
      tipoDocumento: tipoDocumentoOriginal,
      tipoDocumentoNormalized,
      numeroDisplay,
      numeroNormalized,
      neto,
      saldo,
      observacion: String(rawRow.observacion || "").trim(),
    };

    if (isInvoiceDocumentType(tipoDocumentoNormalized)) {
      const excelStatus = saldo === 0 ? "pagada" : "pendiente";
      invoiceRows.push({
        ...normalizedRow,
        excelStatus,
      });
      normalization.normalizedRows += 1;
      return;
    }

    if (isCreditDocumentType(tipoDocumentoNormalized)) {
      if (saldo === 0) {
        normalization.droppedRows += 1;
        return;
      }

      creditRows.push(normalizedRow);
      normalization.normalizedRows += 1;
      return;
    }

    if (isExcludedDocumentType(tipoDocumentoNormalized)) {
      normalization.excludedTypeRows += 1;
      return;
    }

    normalization.unknownTypeRows += 1;
  });

  return {
    invoiceRows,
    creditRows,
    normalization,
  };
};

const buildInvoicePreview = async (normalizedInvoiceRows) => {
  const invoiceNumbers = [
    ...new Set(normalizedInvoiceRows.map((row) => row.numeroNormalized)),
  ].filter(Boolean);

  if (!invoiceNumbers.length) {
    return [];
  }

  const { data } = await axios.post(`${SERVER_URL}/api/orders/reconcile-preview`, {
    invoice_numbers: invoiceNumbers,
  });

  const dbByInvoiceNumber = new Map(
    (data.orders || []).map((order) => [
      normalizeInvoiceNumber(order.invoice_number),
      order,
    ]),
  );

  return normalizedInvoiceRows.map((row) => {
    const dbOrder = dbByInvoiceNumber.get(row.numeroNormalized);
    const targetPaymentStatusId = mapProfitStatusToPaymentStatusId(row.excelStatus);
    const dbPaymentStatusId = Number(dbOrder?.payment_status_id) || null;

    return {
      ...row,
      excelInvoiceNumber: row.numeroDisplay,
      excelInvoiceNumberMatch: row.numeroNormalized,
      excelNeto: row.neto,
      excelSaldo: row.saldo,
      targetPaymentStatusId,
      dbPaymentStatusId,
      matchedOrderId: dbOrder?.id || null,
      dbInvoice: dbOrder?.invoice_number || null,
      dbClientId: dbOrder?.client_id || null,
      dbClientName: dbOrder?.client_name || row.cliente || "-",
      dbTotal: Number(dbOrder?.total) || 0,
      dbPending: [1, 3].includes(dbPaymentStatusId) ? Number(dbOrder?.total) || 0 : 0,
      dbStatus: getPaymentStatusLabel(dbPaymentStatusId),
      approved: false,
      canToggle:
        Boolean(dbOrder?.id) &&
        Boolean(targetPaymentStatusId) &&
        targetPaymentStatusId !== dbPaymentStatusId,
    };
  });
};

const buildCreditsByClient = (creditRows, clients) => {
  const clientsByProfitCode = new Map();
  (clients || []).forEach((client) => {
    const normalizedCode = normalizeProfitCode(client.profit_code);
    if (normalizedCode) {
      clientsByProfitCode.set(normalizedCode, client);
    }
  });

  if (process.env.NODE_ENV !== "production") {
    console.log("[Reconciliation][CreditMatch] Base de clientes cargada", {
      totalClients: (clients || []).length,
      clientsWithProfitCode: clientsByProfitCode.size,
      sampleProfitCodes: Array.from(clientsByProfitCode.keys()).slice(0, 20),
    });
  }

  const groups = new Map();

  creditRows.forEach((row) => {
    const normalizedProfitCode = normalizeProfitCode(row.codigoCliente);
    const clientKey = normalizedProfitCode
      ? `code:${normalizedProfitCode}`
      : `missing-code:${normalizeClientName(row.cliente)}`;
    if (!groups.has(clientKey)) {
      const matchedClient = normalizedProfitCode
        ? clientsByProfitCode.get(normalizedProfitCode)
        : null;

      if (process.env.NODE_ENV !== "production") {
        console.log("[Reconciliation][CreditMatch] Evaluando cliente", {
          excelClientName: row.cliente,
          excelCodigoClienteRaw: row.codigoCliente,
          excelCodigoClienteNormalized: normalizedProfitCode,
          hasProfitCodeInExcel: Boolean(normalizedProfitCode),
          matched: Boolean(matchedClient),
          matchedClientId: matchedClient?.id || null,
          matchedClientName: matchedClient?.name || null,
          matchedProfitCodeRaw: matchedClient?.profit_code || null,
        });
      }

      groups.set(clientKey, {
        clientKey,
        clientName: row.cliente,
        codigoCliente: row.codigoCliente,
        clientId: matchedClient?.id || null,
        creditoProfit: 0,
        creditoSistema: Number(matchedClient?.client_credits) || 0,
        diferencia: 0,
        documents: [],
      });
    }

    const rowAmount = getCreditProfitAmount({
      saldo: row.saldo,
      neto: row.neto,
    });

    const group = groups.get(clientKey);
    group.creditoProfit += rowAmount;
    group.documents.push({
      rowId: row.rowId,
      tipoDocumento: row.tipoDocumento,
      codigoCliente: row.codigoCliente,
      numero: row.numeroDisplay,
      neto: row.neto,
      saldo: row.saldo,
      montoCredito: rowAmount,
    });
  });

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      diferencia: group.creditoProfit - group.creditoSistema,
      documents: group.documents.sort((a, b) => a.numero.localeCompare(b.numero)),
    }))
    .sort((a, b) => a.clientName.localeCompare(b.clientName, "es", { sensitivity: "base" }));
};

export const useReconciliation = () => {
  const [file, setFile] = useState(null);
  const [activeTab, setActiveTab] = useState("facturas");
  const [invoiceRows, setInvoiceRows] = useState([]);
  const [creditsByClient, setCreditsByClient] = useState([]);
  const [normalizationSummary, setNormalizationSummary] = useState({
    sourceRows: 0,
    normalizedRows: 0,
    droppedRows: 0,
    excludedTypeRows: 0,
    unknownTypeRows: 0,
  });
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [updatingClientCredits, setUpdatingClientCredits] = useState({});
  const [resultMsg, setResultMsg] = useState("");

  const approvedCount = useMemo(
    () => invoiceRows.filter((row) => row.approved && row.canToggle).length,
    [invoiceRows],
  );

  const summary = useMemo(() => {
    const deudaBruta = invoiceRows.reduce(
      (acc, row) => acc + (Number(row.dbPending) || 0),
      0,
    );
    const creditoTotal = creditsByClient.reduce(
      (acc, group) => acc + (Number(group.creditoProfit) || 0),
      0,
    );
    const deudaNeta = deudaBruta - creditoTotal;
    const facturasPagadas = invoiceRows.filter(
      (row) => Number(row.excelSaldo) === 0,
    ).length;

    return {
      deudaBruta,
      creditoTotal,
      deudaNeta,
      facturasPagadas,
    };
  }, [creditsByClient, invoiceRows]);

  const loadClients = useCallback(async () => {
    const { data } = await axios.get(`${SERVER_URL}/api/clients`);
    return data || [];
  }, []);

  const handleFileChange = useCallback(
    async (event) => {
      const selectedFile = event.target.files?.[0];
      if (!selectedFile) return;

      setResultMsg("");
      setFile(selectedFile);
      setIsPreviewLoading(true);

      try {
        const { invoiceRows: parsedInvoices, creditRows, normalization } =
          await parseAndNormalizeExcel(selectedFile);

        const [previewRows, clients] = await Promise.all([
          buildInvoicePreview(parsedInvoices),
          loadClients(),
        ]);

        const groupedCredits = buildCreditsByClient(creditRows, clients);

        setInvoiceRows(previewRows);
        setCreditsByClient(groupedCredits);
        setNormalizationSummary(normalization);
      } catch (error) {
        console.error(error);
        setInvoiceRows([]);
        setCreditsByClient([]);
        setNormalizationSummary({
          sourceRows: 0,
          normalizedRows: 0,
          droppedRows: 0,
          excludedTypeRows: 0,
          unknownTypeRows: 0,
        });
        setResultMsg("No se pudo procesar el archivo.");
      } finally {
        setIsPreviewLoading(false);
      }
    },
    [loadClients],
  );

  const toggleApprove = useCallback((rowId) => {
    setInvoiceRows((previousRows) =>
      previousRows.map((row) =>
        row.rowId === rowId && row.canToggle
          ? { ...row, approved: !row.approved }
          : row,
      ),
    );
  }, []);

  const applyApprovedChanges = useCallback(async () => {
    const rowsToApply = invoiceRows.filter(
      (row) => row.approved && row.canToggle && row.matchedOrderId,
    );
    if (!rowsToApply.length) return;

    setResultMsg("");
    setIsApplying(true);

    try {
      const payload = {
        updates: rowsToApply.map((row) => ({
          order_id: row.matchedOrderId,
          payment_status_id: row.targetPaymentStatusId,
        })),
      };

      const { data } = await axios.post(
        `${SERVER_URL}/api/orders/reconcile-apply`,
        payload,
      );

      const updatedCount = Number(data?.updated_count || 0);
      setResultMsg(`Actualizaciones completadas. Éxitos: ${updatedCount}.`);

      setInvoiceRows((previousRows) =>
        previousRows.map((row) => {
          if (!row.approved) return row;
          const nextPaymentStatusId = row.targetPaymentStatusId;
          return {
            ...row,
            approved: false,
            dbPaymentStatusId: nextPaymentStatusId,
            dbStatus: getPaymentStatusLabel(nextPaymentStatusId),
            dbPending: nextPaymentStatusId === 2 ? 0 : row.dbTotal,
            canToggle: false,
          };
        }),
      );
    } catch (error) {
      console.error(error);
      setResultMsg("Error aplicando cambios.");
    } finally {
      setIsApplying(false);
    }
  }, [invoiceRows]);

  const updateClientCredit = useCallback(async (group) => {
    if (!group?.clientId) return;

    setResultMsg("");
    setUpdatingClientCredits((previous) => ({
      ...previous,
      [group.clientId]: true,
    }));

    try {
      await axios.put(`${SERVER_URL}/api/clients/${group.clientId}`, {
        client_credits: group.creditoProfit,
      });

      setCreditsByClient((previousGroups) =>
        previousGroups.map((row) => {
          if (row.clientId !== group.clientId) return row;
          return {
            ...row,
            creditoSistema: group.creditoProfit,
            diferencia: 0,
          };
        }),
      );
      setResultMsg(`Crédito actualizado para ${group.clientName}.`);
    } catch (error) {
      console.error(error);
      setResultMsg(`No se pudo actualizar crédito para ${group.clientName}.`);
    } finally {
      setUpdatingClientCredits((previous) => ({
        ...previous,
        [group.clientId]: false,
      }));
    }
  }, []);

  return {
    file,
    activeTab,
    invoiceRows,
    creditsByClient,
    normalizationSummary,
    isPreviewLoading,
    isApplying,
    updatingClientCredits,
    resultMsg,
    approvedCount,
    summary,
    setActiveTab,
    handleFileChange,
    toggleApprove,
    applyApprovedChanges,
    updateClientCredit,
  };
};
