import React, { useState, useMemo, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { submitPaymentReport } from "../../slices/sellerPaymentsSlice";
import { fetchClientInvoices } from "../../slices/clientInvoicesSlice";
import { uploadReceipt as uploadReceiptApi } from "../../../api/receivablesApi";
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

const METHODS = ["transferencia", "pago_movil", "zelle", "efectivo", "cheque"];

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

const ReportPaymentModal = ({ clients, initialClient, onClose, userId }) => {
  const dispatch = useDispatch();
  const { isSubmitting } = useSelector((state) => state.sellerPayments);
  const { items: invoices } = useSelector((state) => state.clientInvoices);

  const [step, setStep] = useState(0);
  const [receipt, setReceipt] = useState(null);
  const [client, setClient] = useState(initialClient || null);
  const [query, setQuery] = useState("");
  const [showClientPicker, setShowClientPicker] = useState(false);
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [method, setMethod] = useState("transferencia");
  const [bank, setBank] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedInv, setSelectedInv] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef(null);

  // Cerrar con Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Cargar facturas cuando se selecciona un cliente
  useEffect(() => {
    if (client?.client_id) {
      dispatch(fetchClientInvoices(client.client_id));
    }
  }, [dispatch, client?.client_id]);

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

  const totalApplied = Object.values(selectedInv).reduce(
    (a, v) => a + (Number(v) || 0),
    0
  );
  const amountNum = Number(amount) || 0;

  const autoApply = () => {
    let remaining = amountNum;
    const next = {};
    const sorted = invoices
      .slice()
      .sort((a, b) => (b.days_overdue || 0) - (a.days_overdue || 0));
    for (const inv of sorted) {
      if (remaining <= 0) break;
      const apply = Math.min(remaining, Number(inv.amount));
      next[inv.invoice_number] = apply;
      remaining -= apply;
    }
    setSelectedInv(next);
  };

  const [submitError, setSubmitError] = useState(null);

  const submit = async () => {
    setSubmitError(null);

    const paymentData = {
      client_id: client.client_id,
      amount: amountNum,
      method,
      reference,
      payment_date: date,
      notes,
      bank: bank || undefined,
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
  const canProceedStep1 = !!client && amountNum > 0;

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
                    onClick={() => setReceipt(null)}
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
                      onClick={() => {
                        setClient(null);
                        setSelectedInv({});
                      }}
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
                    Monto
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    step="0.01"
                    className={inputClass}
                    placeholder="0.00"
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
                    {METHODS.map((m) => (
                      <button
                        key={m}
                        onClick={() => setMethod(m)}
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
                    Banco
                  </label>
                  <select
                    value={bank}
                    onChange={(e) => setBank(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Seleccionar banco</option>
                    {BANKS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Invoice assignment */}
              {client && invoices.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[11px] text-gray-400 uppercase tracking-wide font-bold">
                      Aplicar a facturas
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={autoApply}
                        className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 border border-gray-200 rounded"
                      >
                        Auto-asignar
                      </button>
                      <button
                        onClick={() => setSelectedInv({})}
                        className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 border border-gray-200 rounded"
                      >
                        Limpiar
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 max-h-48 overflow-auto">
                    {invoices.map((inv) => {
                      const checked = inv.invoice_number in selectedInv;
                      return (
                        <div
                          key={inv.order_id}
                          className={`grid grid-cols-[24px_1fr_100px_110px] gap-2.5 items-center px-3 py-2 bg-white rounded-lg border ${
                            checked ? "border-orange-400" : "border-gray-100"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              setSelectedInv((p) => {
                                const n = { ...p };
                                if (checked) delete n[inv.invoice_number];
                                else n[inv.invoice_number] = Number(inv.amount);
                                return n;
                              })
                            }
                            className="w-4 h-4 accent-orange-500 cursor-pointer"
                          />
                          <div>
                            <div className="text-[13px] font-semibold font-mono">
                              {inv.invoice_number}
                            </div>
                            <div className="text-[11px] text-gray-400">
                              Vence {inv.due}
                              {inv.status === "vencida" && (
                                <span className="text-red-500 font-semibold">
                                  {" "}
                                  · {inv.days_overdue}d
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right text-[13px] font-bold tabular-nums">
                            {fmtMoney(inv.amount)}
                          </div>
                          <div>
                            {checked ? (
                              <input
                                type="number"
                                value={selectedInv[inv.invoice_number]}
                                step="0.01"
                                min="0"
                                max={inv.amount}
                                onChange={(e) =>
                                  setSelectedInv((p) => ({
                                    ...p,
                                    [inv.invoice_number]: Math.max(
                                      0,
                                      Math.min(
                                        Number(e.target.value) || 0,
                                        Number(inv.amount)
                                      )
                                    ),
                                  }))
                                }
                                className={`${inputClass} text-right py-1.5`}
                              />
                            ) : (
                              <span className="text-gray-400 text-[11px]">
                                —
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-2.5 p-2.5 bg-white rounded-lg border border-gray-100 flex justify-between text-xs">
                    <div className="text-gray-400">
                      Aplicado:{" "}
                      <span className="font-bold text-gray-900 tabular-nums">
                        {fmtMoney(totalApplied)}
                      </span>
                    </div>
                    {amountNum > 0 && totalApplied < amountNum && (
                      <div className="text-gray-400">
                        Sin asignar:{" "}
                        <span className="font-bold tabular-nums">
                          {fmtMoney(amountNum - totalApplied)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

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
                  <span className="text-gray-400">Banco</span>
                  <span className="font-semibold">{bank || "—"}</span>
                </div>
                <div className="flex justify-between border-b border-dashed border-gray-100 pb-1">
                  <span className="text-gray-400">Comprobante</span>
                  <span className="font-semibold">{receipt?.name || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Aplicado a</span>
                  <span className="font-semibold">
                    {Object.keys(selectedInv).length} factura(s)
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
