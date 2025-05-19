import React, { useState, useEffect, useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
/* components */
import RadioInputSection from "../../features/radioInputSection/RadioInputSection";
import ClientInfoSection from "../../features/clientInfoSection/ClientInfoSection";
import { paymentOptions, clientOptions } from "../../dummy";
import CustomButton from "../../features/customButton/customButton";
import ProductsSummary from "../../features/productsSummary/ProductsSummary";
import OrderSummary from "../../features/orderSummary/OrderSummary";
import { useNavigate } from "react-router-dom";
import {
  createOrder,
  createSplitOrders,
} from "../../features/slices/ordersSlice";
import ExistingClientModal from "../../features/modals/ExistingClientModal";
import CreateClientModal from "../../features/modals/CreateClientModal";
import { AuthContext } from "../../App";

const CheckoutPage = () => {
  const { user } = useContext(AuthContext);
  const { cartSubtotal, shippingCost, productsInCart } = useSelector(
    (state) => state.cart
  );
  const { client } = useSelector((state) => state.clients);
  const [paymentMethod, setPaymentMethod] = useState();
  const [createClient, setCreateClient] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  /* window size */
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    // Retornar una función de limpieza para eliminar el event listener cuando el componente se desmonte
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  /*  useEffect(() => {
    setOpenModal(true);
  }, [createClient]);
 */

  const handleOnClick = async () => {
    console.log("client", client);

    if (Object.keys(client).length > 0) {
      try {
        await dispatch(
          createSplitOrders({
            user_id: user.id,
            payment_status_id: 1,
            shipping_cost: shippingCost,
            shipping_status: "pendiente",
            payment_method: "credito",
            client_id: client.id,
            productsInCart: productsInCart, // debe incluir category_id
          })
        ).unwrap();

        navigate("/order-confirmation");
      } catch (err) {
        console.error("Error creando órdenes divididas:", err);
        // Podrías mostrar un toast o mensaje al usuario aquí
      }
    } else {
        alert("Debes seleccionar un cliente")
    }
  };

  return (
    <div
      className={`page-container w-screen h-[100%] ${
        windowWidth < 640 && "flex-col"
      }`}
    >
      <div className={`xs:w-full md:w-[80%] flex flex-col pt-10 gap-5 `}>
        <ProductsSummary title="Productos en la orden" />
        {Object.keys(client).length > 0 ? (
          <ClientInfoSection client={client} />
        ) : (
          <RadioInputSection
            openModal={openModal}
            setOpenModal={setOpenModal}
            setCheckedOption={setCreateClient}
            checkedOption={createClient}
            options={clientOptions}
            title="Clientes"
          />
        )}
        {/*  <RadioInputSection
          setCheckedOption={setPaymentMethod}
          checkedOption={paymentMethod}
          options={paymentOptions}
          title="Método de Pago"
        /> */}
      </div>
      <div className="xs:w-full md:w-[30%] md:h-[50%] py-10">
        <OrderSummary
          windowWidth={windowWidth}
          buttonTitle="Realizar Pedido"
          handleOnClick={handleOnClick}
        />
      </div>
      <div className="xs:w-full xs:fixed xs:bottom-2 md:hidden md:w-auto">
        <CustomButton title="Realizar Pedido" handleOnClick={handleOnClick} />
      </div>
      {createClient === "crear" && openModal && (
        <CreateClientModal setOpenModal={setOpenModal} />
      )}
      {createClient === "usar existente" && openModal && (
        <ExistingClientModal setOpenModal={setOpenModal} />
      )}
    </div>
  );
};

export default CheckoutPage;

/*   */
