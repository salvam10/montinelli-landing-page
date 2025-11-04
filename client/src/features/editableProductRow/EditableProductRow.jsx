import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  updateOrderItem,
  deleteOrderItem,
} from "../../features/slices/orderItemsSlice";
import { Pencil, Trash2 } from "lucide-react";
import { getOrderById, getProductsByOrderId } from "../slices/ordersSlice";
import { getOrderBalance } from "../slices/ordersSlice";

const EditableProductRow = ({ product, orderId }) => {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [temp, setTemp] = useState({
    quantity: product.quantity,
    price: product.order_price,
    discount_pct: product.discount_pct ?? 0,
  });

 useEffect(() => {
   setTemp({
     quantity: product.quantity,
     price: product.order_price,
     discount_pct: product.discount_pct ?? 0,
   });
 }, [product]);

  const handleChange = (field, value) => {
    setTemp((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    await dispatch(
      updateOrderItem({
        order_id: orderId,
        product_id: product.product_id ?? product.id,
        ...temp,
      })
    );
    await dispatch(getOrderById({ orderId }));
    await dispatch(getOrderBalance({ orderId: orderId }));
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm("¿Eliminar este producto de la orden?")) {
      await dispatch(
        deleteOrderItem({
          order_id: orderId,
          product_id: product.product_id ?? product.id,
        })
      );
      await dispatch(getOrderById({ orderId }));
      await dispatch(getProductsByOrderId({ orderId }));
    }
  };

  const total = (
    Number(temp.price || 0) *
    Number(temp.quantity || 0) *
    (1 - Number(temp.discount_pct || 0) / 100)
  ).toFixed(2);

  return (
    <div className="grid grid-cols-12 items-center py-3 gap-2 border-b last:border-0 sm:gap-4 sm:py-3 text-sm">
      {/* Producto */}
      <div className="col-span-12 sm:col-span-4 flex items-center gap-3">
        <img
          src={product.media_url}
          alt={product.name}
          className="w-12 h-12 rounded-md object-cover flex-shrink-0"
        />
        <div className="min-w-0">
          <p className="font-medium text-gray-900 truncate">{product.name}</p>
          <p className="text-xs text-gray-500 truncate">
            {product.description}
          </p>
        </div>
      </div>

      {/* Inputs agrupados en mobile */}
      <div className="col-span-12 sm:col-span-8 grid grid-cols-2 sm:grid-cols-8 gap-2 items-center">
        {/* Cantidad */}
        <div className="col-span-1 sm:col-span-2 flex flex-col sm:flex-row sm:items-center sm:gap-2">
          <label className="block sm:hidden text-xs text-gray-500">Cant.</label>
          <InputCell
            value={temp.quantity}
            onChange={(val) => handleChange("quantity", Math.max(0, val))}
            disabled={!isEditing}
            type="integer"
            suffix={product.unit || "und"}
          />
        </div>

        {/* Precio */}
        <div className="col-span-1 sm:col-span-2 flex flex-col sm:flex-row sm:items-center sm:gap-2">
          <label className="block sm:hidden text-xs text-gray-500">
            Precio
          </label>
          <InputCell
            value={temp.price}
            onChange={(val) => handleChange("price", val)}
            disabled={!isEditing}
            type="decimal"
            suffix="USD"
          />
        </div>

        {/* Descuento */}
        <div className="col-span-1 sm:col-span-2 flex flex-col sm:flex-row sm:items-center sm:gap-2">
          <label className="block sm:hidden text-xs text-gray-500">Desc.</label>
          <InputCell
            value={temp.discount_pct}
            onChange={(val) => handleChange("discount_pct", val)}
            disabled={!isEditing}
            type="decimal"
            suffix="%"
          />
        </div>

        {/* Total + acciones */}
        <div className="col-span-2 sm:col-span-2 flex justify-between sm:justify-end items-center gap-2">
          <span className="font-semibold text-gray-900">${total}</span>

          <div className="flex gap-1">
            {isEditing ? (
              <button
                onClick={handleSave}
                className="p-2 rounded-full bg-blue-50 hover:bg-blue-100 transition"
                title="Guardar"
              >
                <Pencil size={15} className="text-blue-600 rotate-45" />
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 rounded-full hover:bg-gray-100 transition"
                title="Editar"
              >
                <Pencil size={15} className="text-gray-600" />
              </button>
            )}
            <button
              onClick={handleDelete}
              className="p-2 rounded-full hover:bg-red-100 transition"
              title="Eliminar"
            >
              <Trash2 size={15} className="text-red-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const InputCell = ({
  value,
  onChange,
  disabled = false,
  suffix,
  type = "decimal",
}) => {
  const handleChange = (e) => {
    const raw = e.target.value;
    const parsed =
      type === "integer" ? parseInt(raw, 10) || 0 : parseFloat(raw) || 0;
    onChange(parsed);
  };

  return (
    <div
      className={`flex items-center border rounded-xl px-3 py-1.5 transition w-full ${
        disabled ? "bg-gray-50 cursor-not-allowed" : "bg-white"
      }`}
    >
      <input
        type="number"
        step={type === "integer" ? "1" : "0.01"}
        min="0"
        inputMode={type === "integer" ? "numeric" : "decimal"}
        value={value}
        disabled={disabled}
        onChange={handleChange}
        className={`w-full outline-none text-gray-900 text-sm ${
          disabled ? "text-gray-500" : ""
        }`}
      />
      {suffix && <span className="text-gray-400 text-xs ml-2">{suffix}</span>}
    </div>
  );
};

export default EditableProductRow;
