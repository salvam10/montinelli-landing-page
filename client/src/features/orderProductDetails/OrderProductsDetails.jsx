import React, { useEffect } from "react";
import EditableProductRow from "../editableProductRow/EditableProductRow";
import OrderDispatchDetails from "../orderDispatchDetails/OrderDispatchDetails";
import { Plus } from "lucide-react";

const OrderProductsDetails = ({
  orderProducts = [],
  order,
  setOpenAddProd,
}) => {
  useEffect(() => {
    console.log("orderProducts", orderProducts);
  }, [orderProducts]);

  return (
    <div className="bg-white rounded-2xl border p-5 space-y-5">
      {/* Encabezado con botón de añadir */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <h3 className="text-base font-semibold text-gray-900">Productos</h3>

        <button
          type="button"
          onClick={() => setOpenAddProd(true)}
          className="flex items-center gap-2 bg-[#2457F5] hover:bg-[#1e4bd8] text-white font-medium rounded-full px-4 py-2 transition text-sm"
        >
          <Plus size={18} />
          Añadir producto
        </button>
      </div>

      {/* Cabecera solo visible en pantallas grandes */}
      <div className="hidden sm:grid sm:grid-cols-[5fr_1.3fr_1.7fr_1.3fr_1.4fr] items-center border-b pb-2 text-xs sm:text-sm text-gray-500 font-medium">
        <div>Producto</div>
        <div className="text-center">Cant.</div>
        <div className="text-center">P. Unit.</div>
        <div className="text-center">Desc. (%)</div>
        <div className="text-right">Total</div>
      </div>

      {/* Filas de productos */}
      <div className="divide-y">
        {orderProducts.map((product) => (
          <EditableProductRow
            key={product.product_id ?? product.id}
            product={product}
            orderId={order.id}
          />
        ))}
      </div>

      {/* Despacho desacoplado */}
      <OrderDispatchDetails order={order} />
    </div>
  );
};

export default OrderProductsDetails;
