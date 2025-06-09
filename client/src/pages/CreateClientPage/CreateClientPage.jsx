import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import NewClientForm from "../../features/newClientForm/NewClientForm";
import PersonIcon from "@mui/icons-material/Person";
import ArrowForwardIosOutlinedIcon from "@mui/icons-material/ArrowForwardIosOutlined";
import CustomFormButton from "../../features/customFormButton/CustomFormButton";
import { createClient } from "../../features/slices/clientsSlice";
import GenericDatePicker from "../../features/genericDatePicker/GenericDatePicker";
import SellerPicker from "../../features/sellerPicker/SellerPicker";

const CreateClientPage = () => {
  const formRef = useRef();
  const { isLoading } = useSelector((state) => state.clients);
  const [createdAtDate, setCreatedAtDate] = useState(new Date());
  const [selectedSeller, setSelectedSeller] = useState({});
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleCreateClient = async (clientData) => {
    await dispatch(
      createClient({
        ...clientData,
        created_at: createdAtDate,
        user_id: selectedSeller.id,
      })
    );
  };

  return (
    <div className="w-full flex items-center flex-col p-5 bg-transparent gap-5 overflow-auto pb-32">
      <div className="xs:w-full md:w-[80%] flex-between ">
        <div className="flex gap-1 items-bottom">
          <span
            className="cursor-pointer"
            onClick={() => navigate("/admin/clients")}
          >
            <PersonIcon style={{ fontSize: "large" }} />
          </span>
          <span>
            <ArrowForwardIosOutlinedIcon style={{ fontSize: "medium" }} />
          </span>
          <span className="font-bold text-[18px]">Nuevo Cliente</span>
        </div>
        <CustomFormButton
          text="Guardar"
          width="w-[100px]"
          isLoading={isLoading}
          handleClickFunction={() => formRef.current?.submit()}
        />
      </div>

      <div className="xs:w-full md:w-[80%] flex xs:flex-col md:flex-row gap-5 ">
        <div className="w-full md:w-[70%] flex flex-col gap-5 section-container">
          <NewClientForm
            ref={formRef}
            handleCreateClient={handleCreateClient}
          />
        </div>
        <div className="w-full md:w-[30%] flex flex-col gap-5">
          <div className="section-container">
            <GenericDatePicker
              label="Fecha de creación"
              value={createdAtDate}
              onChange={setCreatedAtDate}
            />
          </div>
          <SellerPicker
            selectedSeller={selectedSeller}
            setSelectedSeller={setSelectedSeller}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateClientPage;
