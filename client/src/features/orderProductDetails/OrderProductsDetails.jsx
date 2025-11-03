import React from "react";
import EditableProductRow from "../editableProductRow/EditableProductRow";
import OrderDispatchDetails from "../orderDispatchDetails/OrderDispatchDetails";
import { Plus } from "lucide-react";
import ProductPicker from "../productPicker/ProductPicker";

const OrderProductsDetails = ({ orderProducts = [], order, setOpenAddProd }) => {
  return (
    <div className="bg-white rounded-2xl border p-5 space-y-5">
      {/* Encabezado con botón de añadir */}
      <div className="flex justify-between items-center">
        <h3 className="text-base font-semibold text-gray-900">Productos</h3>

        <button
          type="button"
          onClick={() => {
            setOpenAddProd(true);
          }}
          className="flex items-center gap-2 bg-[#2457F5] hover:bg-[#1e4bd8] text-white font-medium rounded-full px-5 py-2 transition"
        >
          <Plus size={18} />
          Añadir producto
        </button>
      </div>

      {/* Cabecera de columnas */}
      <div className="grid grid-cols-12 items-center border-b pb-2 text-sm text-gray-500 font-medium">
        <div className="col-span-4">Producto</div>
        <div className="col-span-2 text-center">Cantidad</div>
        <div className="col-span-2 text-center">Precio unitario</div>
        <div className="col-span-2 text-center">Descuento (%)</div>
        <div className="col-span-2 text-right">Total</div>
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
