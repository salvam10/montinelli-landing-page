import React, { useState, useMemo, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { submitPaymentReport } from "../../slices/sellerPaymentsSlice";
// import { fetchClientInvoices } from "../../slices/clientInvoicesSlice";
import {
  extractReceiptData,
  uploadReceipt as uploadReceiptApi,
} from "../../../api/receivablesApi";
import ClientAvatar from "./ClientAvatar";
import { fmtMoney } from "../receivablesHelpers";

// ─── Iconos SVG inline ───────────────────────────────────────────────────────
const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

const UploadIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v13M6 9l6-6 6 6" /><path d="M5 21h14" />
  </svg>
);

const ChevronIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 6 6 6-6 6" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m5 12 5 5 9-11" />
  </svg>
);

const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3 2 21h20L12 3z" /><path d="M12 10v5M12 18v.5" />
  </svg>
);

// ─── Stepper ──────────────────────────────────────────────────────────────────
const Stepper = ({ step }) => (
  <div className="flex items-center gap-1.5">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className={`h-1.5 rounded transition-all ${
          i <= step ? "bg-orange-500" : "bg-gray-200"
        } ${i === step ? "w-5" : "w-1.5"}`}
      />
    ))}
  </div>
);

const inputClass =
  "w-full px-2.5 py-2 rounded-lg border border-gray-200 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400";

const METHODS_BS = ["transferencia", "pago_movil"];
const METHODS_USD = ["zelle", "efectivo"];

const CURRENCIES = [
  { value: "VES", label: "Bs" },
  { value: "USD", label: "USD" },
];

const BANKS = [
  "Banesco",
  "Mercantil",
  "Provincial",
  "BNC",
  "Venezuela",
  "Bicentenario",
  "Tesoro",
  "Exterior",
  "Caribe",
  "Sofitasa",
  "Plaza",
  "Fondo Común",
  "Activo",
  "BOD",
  "Bancrecer",
  "Zelle",
  "Otro",
];

const PAYMENT_TYPES = [
  { value: "pago_factura", label: "Pago de factura" },
  { value: "retencion", label: "Retención" },
  { value: "ambos", label: "Ambos" },
];

const ReportPaymentModal = ({ clients, initialClient, onClose, userId }) => {
  const dispatch = useDispatch();
  const { isSubmitting } = useSelector((state) => state.sellerPayments);
  // const { items: invoices } = useSelector((state) => state.clientInvoices);

  const [step, setStep] = useState(0);
  const [receipt, setReceipt] = useState(null);
  const [client, setClient] = useState(initialClient || null);
  const [query, setQuery] = useState("");
  const [showClientPicker, setShowClientPicker] = useState(false);
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [currency, setCurrency] = useState("VES");
  const [method, setMethod] = useState("transferencia");
  const [bank, setBank] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [notes, setNotes] = useState("");
  // const [selectedInv, setSelectedInv] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [ocrNotice, setOcrNotice] = useState("");
  const fileRef = useRef(null);

  // Cerrar con Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Facturas deshabilitadas — la asignación la hace admin
  // useEffect(() => {
  //   if (client?.client_id) {
  //     dispatch(fetchClientInvoices(client.client_id));
  //   }
  // }, [dispatch, client?.client_id]);

  const runOcr = async (file) => {
    setIsExtracting(true);
    setOcrNotice("");

    try {
      const data = await extractReceiptData(file);

      if (data && (data.amount || data.date || data.reference || data.bank || data.method || data.payment_type)) {
        if (data.amount) {
          const num = Number(data.amount);
          setAmount(num > 0 ? formatAmount(num, currency) : String(data.amount));
        }
        if (data.date) setDate(data.date);
        if (data.reference) setReference(data.reference);
        if (data.bank) setBank(data.bank);
        if (data.method) setMethod(data.method);
        if (data.payment_type) setPaymentType(data.payment_type);

        setOcrNotice("Datos extraídos del comprobante. Verificá y corregí si es necesario.");
      } else {
        setOcrNotice("No pudimos extraer los datos, completá manualmente.");
      }
    } catch {
      setOcrNotice("No pudimos extraer los datos, completá manualmente.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleFile = (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setReceipt({
        file,           // File original para upload a R2
        dataUrl: reader.result,
        name: file.name,
        type: file.type,
        size: file.size,
      });

      runOcr(file);
    };
    reader.readAsDataURL(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const filteredClients = useMemo(() => {
    if (!query) return clients.slice(0, 12);
    const q = query.toLowerCase();
    return clients
      .filter((c) => c.client_name.toLowerCase().includes(q))
      .slice(0, 12);
  }, [clients, query]);

  // Parsear monto crudo a número
  const parseAmount = (raw) => {
    if (!raw) return 0;
    // Quitar todo excepto dígitos, puntos y comas
    const clean = raw.replace(/[^0-9.,]/g, "");
    // Si tiene coma como decimal (formato Bs: 140.758,00)
    if (clean.includes(",") && clean.lastIndexOf(",") > clean.lastIndexOf(".")) {
      return Number(clean.replace(/\./g, "").replace(",", ".")) || 0;
    }
    // Formato USD normal: 1,500.50 o plain number
    return Number(clean.replace(/,/g, "")) || 0;
  };
  const amountNum = parseAmount(amount);

  // Formatear número para display
  const formatAmount = (num, curr) => {
    if (!num || num === 0) return "";
    if (curr === "VES") {
      return num.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const [submitError, setSubmitError] = useState(null);

  const submit = async () => {
    setSubmitError(null);

    const paymentData = {
      client_id: client.client_id,
      amount: amountNum,
      currency_code: currency,
      method,
      reference,
      payment_date: date,
      notes,
      bank: bank || undefined,
      payment_type: paymentType,
      receipt_url: null,
      reported_by: userId,
      status: "pendiente_validacion",
    };

    let payment;
    try {
      payment = await dispatch(submitPaymentReport(paymentData)).unwrap();
    } catch (err) {
      setSubmitError(err?.message || err || "Error al crear el pago");
      return;
    }

    // Subir comprobante a R2 solo si el pago se creó exitosamente
    if (receipt?.file && payment?.id) {
      try {
        await uploadReceiptApi(payment.id, receipt.file);
      } catch (err) {
        console.error("Error subiendo comprobante:", err);
        // El pago se creó — no bloquear por fallo de upload
      }
    }

    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  const canProceedStep0 = !!receipt;
  const canProceedStep1 = !!client && amountNum > 0 && !!paymentType;

  if (submitted) {
    return (
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl p-8 text-center max-w-sm shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
            <CheckIcon />
          </div>
          <div className="font-bold text-lg">Pago enviado</div>
          <div className="text-sm text-gray-500 mt-2">
            Tu reporte de {fmtMoney(amountNum)} fue enviado a tesorería para
            validación.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-50 rounded-2xl w-[760px] max-w-full max-h-[94%] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-white">
          <div>
            <div className="text-base font-bold">Reportar pago</div>
            <div className="text-xs text-gray-400 mt-0.5">
              {step === 0
                ? "Sube el comprobante que te envió el cliente"
                : step === 1
                  ? "Confirma los datos y asigna a facturas"
                  : "Revisa y envía a tesorería"}
            </div>
          </div>
          <div className="flex items-center gap-3.5">
            <Stepper step={step} />
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-gray-100 text-gray-500"
              aria-label="Cerrar"
            >
              <XIcon />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-5">
          {/* Step 0: Upload receipt */}
          {step === 0 && (
            <div>
              {!receipt ? (
                <div
                  onDrop={onDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className="border-2 border-dashed border-gray-200 rounded-2xl p-10 bg-white text-center flex flex-col items-center gap-3.5"
                >
                  <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
                    <UploadIcon />
                  </div>
                  <div>
                    <div className="text-[15px] font-bold mb-1">
                      Arrastra el comprobante aquí
                    </div>
                    <div className="text-xs text-gray-400">
                      Captura de pantalla o PDF de la transferencia. Máx. 10 MB.
                    </div>
                  </div>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white text-xs font-semibold rounded-lg hover:bg-orange-600"
                  >
                    Seleccionar archivo
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*,application/pdf"
                    hidden
                    onChange={(e) => handleFile(e.target.files?.[0])}
                  />
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                    {receipt.type?.startsWith("image/") ? (
                      <img
                        src={receipt.dataUrl}
                        alt="Comprobante"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-400 text-xs">PDF</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">
                      {receipt.name}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {(receipt.size / 1024).toFixed(0)} KB
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setReceipt(null);
                      setOcrNotice("");
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 border border-gray-200 rounded"
                  >
                    Cambiar
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 1: Details + invoice assignment */}
          {step === 1 && (
            <div className="space-y-4">
              {(isExtracting || ocrNotice) && (
                <div
                  role="status"
                  className={`rounded-xl border px-3 py-2 text-xs flex items-start justify-between gap-3 ${
                    isExtracting || ocrNotice.includes("No pudimos")
                      ? "border-yellow-200 bg-yellow-50 text-yellow-700"
                      : "border-blue-200 bg-blue-50 text-blue-700"
                  }`}
                >
                  <div>
                    {isExtracting && (
                      <div className="font-semibold animate-pulse">
                        Extrayendo datos del comprobante...
                      </div>
                    )}
                    {!isExtracting && ocrNotice && <div>{ocrNotice}</div>}
                  </div>
                  {ocrNotice && !isExtracting && (
                    <button
                      type="button"
                      aria-label="Ocultar aviso de OCR"
                      onClick={() => setOcrNotice("")}
                      className="shrink-0 text-[11px] font-semibold hover:opacity-80"
                    >
                      Ocultar
                    </button>
                  )}
                </div>
              )}

              {/* Client picker */}
              <div>
                <label className="block text-[11px] text-gray-400 uppercase tracking-wide font-bold mb-1.5">
                  Cliente
                </label>
                {!client ? (
                  <div>
                    <input
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        setShowClientPicker(true);
                      }}
                      onFocus={() => setShowClientPicker(true)}
                      placeholder="Buscar cliente…"
                      className={inputClass}
                    />
                    {showClientPicker && (
                      <div className="mt-1.5 bg-white border border-gray-200 rounded-lg max-h-48 overflow-auto">
                        {filteredClients.map((c) => (
                          <button
                            key={c.client_id}
                            onClick={() => {
                              setClient(c);
                              setShowClientPicker(false);
                              setQuery("");
                            }}
                            className="flex items-center gap-2.5 px-3 py-2 w-full text-left hover:bg-gray-50 border-b border-gray-100 text-[13px]"
                          >
                            <ClientAvatar name={c.client_name} size={26} />
                            <span className="flex-1 truncate">
                              {c.client_name}
                            </span>
                            <span className="text-[11px] text-gray-400 tabular-nums">
                              {fmtMoney(c.net_debt)}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 p-2.5 bg-white border border-gray-200 rounded-lg">
                    <ClientAvatar name={client.client_name} size={32} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold">
                        {client.client_name}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        Bruto {fmtMoney(client.gross_debt)} · Neto{" "}
                        {fmtMoney(client.net_debt)}
                      </div>
                    </div>
                    <button
                      onClick={() => setClient(null)}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Cambiar
                    </button>
                  </div>
                )}
              </div>

              {/* Payment details */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-gray-400 uppercase tracking-wide font-bold mb-1.5">
                    Moneda
                  </label>
                  <div className="flex gap-1.5">
                    {CURRENCIES.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => {
                          setCurrency(c.value);
                          const methods = c.value === "VES" ? METHODS_BS : METHODS_USD;
                          setMethod(methods[0]);
                        }}
                        aria-pressed={currency === c.value}
                        className={`px-3 py-1.5 rounded text-xs font-semibold border ${
                          currency === c.value
                            ? "border-orange-400 bg-orange-50 text-orange-600"
                            : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] text-gray-400 uppercase tracking-wide font-bold mb-1.5">
                    Monto ({currency === "VES" ? "Bs" : "$"})
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9.,]/g, "");
                      setAmount(raw);
                    }}
                    onBlur={() => {
                      const num = parseAmount(amount);
                      if (num > 0) setAmount(formatAmount(num, currency));
                    }}
                    onFocus={() => {
                      // Al enfocar, mostrar el número crudo para editar fácil
                      const num = parseAmount(amount);
                      if (num > 0) setAmount(String(num));
                    }}
                    className={inputClass}
                    placeholder={currency === "VES" ? "0,00" : "0.00"}
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-400 uppercase tracking-wide font-bold mb-1.5">
                    Referencia / Nº operación
                  </label>
                  <input
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-400 uppercase tracking-wide font-bold mb-1.5">
                    Fecha del pago
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-400 uppercase tracking-wide font-bold mb-1.5">
                    Método
                  </label>
                  <div className="flex gap-1.5 flex-wrap">
                    {(currency === "VES" ? METHODS_BS : METHODS_USD).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMethod(m)}
                        aria-pressed={method === m}
                        className={`px-3 py-1.5 rounded text-xs font-semibold border capitalize ${
                          method === m
                            ? "border-orange-400 bg-orange-50 text-orange-600"
                            : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {m.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] text-gray-400 uppercase tracking-wide font-bold mb-1.5">
                    Tipo de pago
                  </label>
                  <div className="flex gap-1.5 flex-wrap">
                    {PAYMENT_TYPES.map((paymentOption) => (
                      <button
                        key={paymentOption.value}
                        type="button"
                        onClick={() => setPaymentType(paymentOption.value)}
                        aria-pressed={paymentType === paymentOption.value}
                        className={`px-3 py-1.5 rounded text-xs font-semibold border ${
                          paymentType === paymentOption.value
                            ? "border-orange-400 bg-orange-50 text-orange-600"
                            : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {paymentOption.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] text-gray-400 uppercase tracking-wide font-bold mb-1.5">
                  Notas para tesorería (opcional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Ej: cliente abona parcial; resto la próxima semana"
                  className={`${inputClass} resize-y`}
                />
              </div>
            </div>
          )}

          {/* Step 2: Confirmation */}
          {step === 2 && client && (
            <div className="space-y-3">
              <div className="bg-white border border-gray-200 rounded-xl p-4.5">
                <div className="flex items-center gap-1.5 text-blue-600 mb-1.5">
                  <AlertIcon />
                  <span className="text-[11px] font-bold uppercase tracking-wide">
                    Pendiente de validación por tesorería
                  </span>
                </div>
                <div className="text-3xl font-extrabold text-gray-900 tracking-tight tabular-nums">
                  {fmtMoney(amountNum)}
                </div>
                <div className="text-[13px] text-gray-500 mt-1">
                  {client.client_name}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex justify-between border-b border-dashed border-gray-100 pb-1">
                  <span className="text-gray-400">Referencia</span>
                  <span className="font-semibold">{reference || "—"}</span>
                </div>
                <div className="flex justify-between border-b border-dashed border-gray-100 pb-1">
                  <span className="text-gray-400">Fecha</span>
                  <span className="font-semibold">{date}</span>
                </div>
                <div className="flex justify-between border-b border-dashed border-gray-100 pb-1">
                  <span className="text-gray-400">Método</span>
                  <span className="font-semibold capitalize">
                    {method.replace("_", " ")}
                  </span>
                </div>
                <div className="flex justify-between border-b border-dashed border-gray-100 pb-1">
                  <span className="text-gray-400">Comprobante</span>
                  <span className="font-semibold">{receipt?.name || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Moneda</span>
                  <span className="font-semibold">
                    {currency === "VES" ? "Bolívares" : "Dólares"}
                  </span>
                </div>
              </div>

              {notes && (
                <div className="p-3 bg-gray-100 rounded-lg text-xs text-gray-600 border-l-3 border-blue-500">
                  <strong className="text-gray-900">Notas:</strong> {notes}
                </div>
              )}

              <div className="p-3 bg-blue-50 rounded-xl text-xs text-blue-600 flex gap-2.5">
                <AlertIcon />
                <div>
                  Tesorería verificará el comprobante contra el banco. El pago
                  se aplicará al estado de cuenta del cliente{" "}
                  <strong>una vez validado</strong>. Si hay un error, te llegará
                  una notificación.
                </div>
              </div>

              {submitError && (
                <div className="p-3 bg-red-50 rounded-xl text-xs text-red-600 flex gap-2.5">
                  <AlertIcon />
                  <div>{submitError}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-200 bg-white">
          <button
            onClick={() => {
              if (step === 0) onClose();
              else setStep(step - 1);
            }}
            className="px-3 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700"
          >
            {step === 0 ? "Cancelar" : "Atrás"}
          </button>
          <div>
            {step === 0 && (
              <button
                disabled={!canProceedStep0}
                onClick={() => setStep(1)}
                className={`inline-flex items-center gap-1 px-4 py-2 bg-orange-500 text-white text-xs font-semibold rounded-lg ${
                  canProceedStep0
                    ? "hover:bg-orange-600"
                    : "opacity-50 cursor-not-allowed"
                }`}
              >
                Continuar <ChevronIcon />
              </button>
            )}
            {step === 1 && (
              <button
                disabled={!canProceedStep1}
                onClick={() => setStep(2)}
                className={`inline-flex items-center gap-1 px-4 py-2 bg-orange-500 text-white text-xs font-semibold rounded-lg ${
                  canProceedStep1
                    ? "hover:bg-orange-600"
                    : "opacity-50 cursor-not-allowed"
                }`}
              >
                Revisar <ChevronIcon />
              </button>
            )}
            {step === 2 && (
              <button
                disabled={isSubmitting}
                onClick={submit}
                className={`inline-flex items-center gap-1 px-4 py-2 bg-orange-500 text-white text-xs font-semibold rounded-lg ${
                  isSubmitting
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-orange-600"
                }`}
              >
                <CheckIcon /> {isSubmitting ? "Enviando..." : "Enviar a tesorería"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPaymentModal;
