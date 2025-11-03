import React from "react";

const EditOrderItem = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-semibold">Editar cantidad •</h2>
              <p className="text-sm text-gray-500">#1167</p>
            </div>
            <span className="text-sm bg-gray-100 text-gray-500 px-3 py-1 rounded-full">
              Línea 1
            </span>
          </div>

          {/* Product Info */}
          <div className="flex items-center gap-3 mt-4">
            <img
              src="/passata.png"
              alt="Passata Montinelli"
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div>
              <h3 className="font-medium">Passata de Tomate Montinelli</h3>
              <p className="text-sm text-gray-500">
                Caja de 12 und • 680 gr c/u
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Quantity and Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Cantidad
              </label>
              <div className="flex items-center border rounded-xl px-3 py-2">
                <input
                  type="number"
                  defaultValue="12"
                  className="w-full outline-none text-gray-800"
                />
                <span className="text-gray-400 text-sm ml-2">und</span>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Unidad</label>
              <input
                type="text"
                defaultValue="Unidad"
                className="w-full border rounded-xl px-3 py-2 outline-none"
              />
            </div>
          </div>

          {/* Price and Discount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Precio unitario
              </label>
              <div className="flex items-center border rounded-xl px-3 py-2">
                <input
                  type="text"
                  defaultValue="$37.16"
                  className="w-full outline-none text-gray-800"
                />
                <span className="text-gray-400 text-sm ml-2">USD</span>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Descuento
              </label>
              <div className="flex items-center border rounded-xl px-3 py-2">
                <input
                  type="text"
                  defaultValue="$0.00"
                  className="w-full outline-none text-gray-800"
                />
                <span className="text-gray-400 text-sm ml-2">desc.</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Notas de línea (opcional)
            </label>
            <textarea
              placeholder="Agregar comentario..."
              className="w-full border rounded-xl px-3 py-2 outline-none resize-none text-gray-700"
              rows="2"
            ></textarea>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 space-y-1">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>$445.92</span>
            </div>
            <div className="flex justify-between">
              <span>Descuento</span>
              <span>$0.00</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total por línea</span>
              <span>$445.92</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Se actualiza al guardar
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t px-5 py-4 bg-white">
          <button className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100">
            Cancelar
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditOrderItem;
