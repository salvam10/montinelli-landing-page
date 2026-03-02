import React from "react";
import { fmtMoney } from "../utils";

const SummaryCards = ({ summary }) => {
  const cards = [
    {
      key: "deuda_bruta",
      title: "Deuda Bruta",
      value: fmtMoney(summary.deudaBruta),
    },
    {
      key: "credito_total",
      title: "Crédito a Favor",
      value: fmtMoney(summary.creditoTotal),
    },
    {
      key: "deuda_neta",
      title: "Deuda Neta",
      value: fmtMoney(summary.deudaNeta),
    },
    {
      key: "facturas_pagadas",
      title: "Facturas Pagadas",
      value: Number(summary.facturasPagadas || 0).toLocaleString("es-VE"),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
      {cards.map((card) => (
        <div key={card.key} className="bg-white border rounded-md p-4">
          <p className="text-sm text-slate-500">{card.title}</p>
          <p className="text-2xl font-semibold text-slate-800 mt-2">{card.value}</p>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
