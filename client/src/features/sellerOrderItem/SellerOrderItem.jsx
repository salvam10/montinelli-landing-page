import React, { useState, useEffect, useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import { changePillBgColor } from "../../helpers/changePillColor";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

const SellerOrderItem = ({ order }) => {
  const [managerPillBg, setManagerPillBg] = useState();
  const [shippingPillBg, setShippingPillbg] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    changePillBgColor(setManagerPillBg, order.manager_approval_status);
    changePillBgColor(setShippingPillbg, order.shipping_status);
  }, [order]);

  return (
    <li key={order.id} className="mb-2">
      <div className="flex-between border-y p-4 rounded cursor-pointer hover:bg-[#EBEBEB]">
        <div className="flex flex-col gap-4 ">
          <div className="order-metadata">
            <h2 className="responsive-text font-bold">{order.client_name}</h2>
            <p className="responsive-text">
              Fecha:{" "}
              {format(
                order.created_at,
                "dd 'de' MMMM 'de' yyyy, 'a las' HH:mm",
                {
                  locale: es,
                }
              )}
            </p>
            <p className="responsive-text">Monto Total: ${order.total}</p>
          </div>
          <div className="badges flex gap-2">
            <span className={`badge ${managerPillBg}`}>
              pedido {order.manager_approval_status}
            </span>
            {order.manager_approval_status.toLowerCase() === "aprobado" && (
              <span className={`badge ${shippingPillBg}`}>
                {order.shipping_status.toLowerCase() !== "despachado" &&
                  "despacho"}{" "}
                {order.shipping_status}
              </span>
            )}
            <span></span>
          </div>
        </div>
        <div className="">
          <span
            className="text-[10px] cursor-pointer"
            onClick={() => {
              navigate(`/orders/${order.id}`);
            }}
          >
            <MoreHorizIcon style={{ color: "#000000" }} />
          </span>
        </div>
        {/* Aquí puedes agregar más detalles de la orden */}
      </div>
    </li>
  );
};

export default SellerOrderItem;
