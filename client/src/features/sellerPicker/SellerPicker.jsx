import React, { useState, useEffect } from "react";

import { useSelector, useDispatch } from "react-redux";
import { getSellers, getUserById } from "../slices/usersSlice";
import CustomCombobox from "../customCombobox/CustomCombobox";
import { capitalizeFirstLetter } from "../../helpers/CapitalizeFirstLetter";

const SellerPicker = ({ selectedSeller, setSelectedSeller }) => {
  const [options, setOptions] = useState([]);
  const [selectedSellerId, setSelectedSellerId] = useState("");
  const { sellers, single_user } = useSelector((state) => state.users);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getUserById({ id: selectedSellerId }));
  }, [selectedSellerId]);

  useEffect(() => {
    setSelectedSeller(single_user);
  }, [single_user]);

  useEffect(() => {
    dispatch(getSellers());
    // Al montar: deshabilita el scroll de la página de fondo del modal
    document.body.style.overflow = "hidden";
    // Al desmontar: restaura el scroll
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    if (sellers?.length) {
      const formattedSellers = sellers
        .filter((seller) => typeof seller?.firstname === "string")
        .map((seller) => {
          const name = `${seller?.firstname} ${seller?.lastname}`.toLowerCase();
          const formattedFirstname =
            name.charAt(0).toUpperCase() + name.slice(1);
          return {
            label: formattedFirstname,
            value: seller?.id,
          };
        });

      setOptions(formattedSellers);
      if (!selectedSellerId && formattedSellers[0]) {
        setSelectedSellerId(formattedSellers[0].value); // solo si no está ya seteado
      }
    }
  }, [sellers]);

  return (
    sellers.length > 0 && (
      <div className="section-container">
        <div className="w-full flex">
          <h2 className="font-bold text-[14px]">Vendedor</h2>
        </div>
        <div className="w-full relative">
          <CustomCombobox
            options={options}
            selected={selectedSellerId}
            setSelected={setSelectedSellerId}
          />
        </div>
        <div className="w-full">
          <div className="w-full flex flex-col">
            <span className="responsive-text font-bold">Nombre:</span>
            <span className="responsive-text">
              {capitalizeFirstLetter(
                `${single_user?.firstname} ${single_user?.lastname}` ||
                  "No disponible"
              )}
            </span>
          </div>
          <div className="w-full flex flex-col">
            <span className="responsive-text font-bold">Cédula:</span>
            <span className="responsive-text">
              {capitalizeFirstLetter(single_user?.id || "No disponible")}
            </span>
          </div>
          <div className="w-full flex flex-col">
            <span className="responsive-text font-bold">Teléfono:</span>
            <span className="responsive-text">
              {capitalizeFirstLetter(single_user?.phone || "No disponible")}
            </span>
          </div>
        </div>
      </div>
    )
  );
};

export default SellerPicker;
