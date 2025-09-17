import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  getSingleClient,
  updateClient,
} from "../../features/slices/clientsSlice";
import { getUserById } from "../../features/slices/usersSlice";
import ClientBasicInfo from "../../features/clientBasicInfo/ClientBasicInfo";
import ClientOrders from "../../features/clientOrders/ClientOrders";
import SellerPicker from "../../features/sellerPicker/SellerPicker";
import EditClientModal from "../../features/modals/EditClientModal";
import CustomFormButton from "../../features/customFormButton/CustomFormButton";
import { getPaymentTerms } from "../../features/slices/paymentTermsSlice";

const ClientDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { client } = useSelector((state) => state.clients);
  const { single_user } = useSelector((state) => state.users);

  const [selectedSeller, setSelectedSeller] = useState({});
  const [showModal, setShowModal] = useState(false);

  // Cargar cliente al montar o cambiar ID
  useEffect(() => {
    if (id) {
      dispatch(getSingleClient({ id }));
      dispatch(getPaymentTerms());
    }
  }, [id, dispatch]);

  // Cuando el cliente se actualiza, buscar su vendedor
  useEffect(() => {
    if (client?.user_id) {
      dispatch(getUserById({ id: client.user_id }));
    } else {
      setSelectedSeller({});
    }
  }, [client?.user_id, dispatch]);

  // Solo actualizar selectedSeller si el single_user corresponde al cliente actual
  useEffect(() => {
    if (
      single_user &&
      client?.user_id &&
      parseInt(single_user.id) === parseInt(client.user_id)
    ) {
      setSelectedSeller(single_user);
    }
  }, [single_user, client?.user_id]);

  const handleUpdateClient = () => {
    dispatch(updateClient({ id: client.id, user_id: selectedSeller.id }));
  };

  return (
    <div className="w-full flex items-center flex-col p-5 pb-52 bg-transparent gap-5 overflow-x-hidden">
      <div className="xs:w-full md:w-[80%] flex-end">
      </div>
      <div className="xs:w-full md:w-[80%] flex flex-col md:flex-row gap-5">
        <div className="w-full md:w-[70%] flex flex-col gap-5">
          <ClientOrders client={client} productCatId={34} />
          <ClientOrders client={client} productCatId={35} />
        </div>

        <div className="w-full md:w-[30%] flex flex-col gap-5">
          <ClientBasicInfo client={client} setShowModal={setShowModal} />
          
          <SellerPicker
            selectedSeller={selectedSeller}
            setSelectedSeller={setSelectedSeller}
            client={client}
            customButton={
              <CustomFormButton
                text="Guardar"
                handleClickFunction={handleUpdateClient}
              />
            }
          />
        </div>
      </div>

      {showModal && (
        <EditClientModal client={client} setShowModal={setShowModal} />
      )}
    </div>
  );
};

export default ClientDetailPage;
