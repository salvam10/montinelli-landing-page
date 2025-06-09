import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getSellers } from "../slices/usersSlice";
import CustomCombobox from "../customCombobox/CustomCombobox";
import { capitalizeFirstLetter } from "../../helpers/CapitalizeFirstLetter";

const SellerPicker = ({
  client,
  selectedSeller,
  setSelectedSeller,
  customButton,
}) => {
  const [options, setOptions] = useState([]);
  const [selectedSellerId, setSelectedSellerId] = useState(null);
  const { sellers } = useSelector((state) => state.users);
  const dispatch = useDispatch();

  // Sync selectedSellerId con el selectedSeller recibido
  useEffect(() => {
    if (selectedSeller?.id) {
      setSelectedSellerId(selectedSeller.id);
    } else {
      setSelectedSellerId(null); // importante para resetear visualmente el combobox
    }
  }, [selectedSeller?.id]);

  // 🧠 Cuando el usuario elige un vendedor nuevo en el combobox
  useEffect(() => {
    const newSeller = sellers.find((s) => s.id === selectedSellerId);
    if (newSeller && newSeller.id !== selectedSeller?.id) {
      setSelectedSeller(newSeller);
    }
  }, [selectedSellerId]);

  // 🧠 Al montar, cargar los vendedores
  useEffect(() => {
    dispatch(getSellers());
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Formatear los vendedores para el combo
  useEffect(() => {
    if (sellers?.length) {
      const formattedSellers = sellers
        .filter((seller) => typeof seller?.firstname === "string")
        .map((seller) => ({
          label: `${capitalizeFirstLetter(seller.firstname)} ${
            seller.lastname?.toLowerCase() || ""
          }`,
          value: seller.id,
        }));
      setOptions(formattedSellers);
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

        {selectedSeller && Object.keys(selectedSeller).length > 0 && (
          <div className="w-full mt-4">
            <div className="w-full flex flex-col">
              <span className="responsive-text font-bold">Nombre:</span>
              <span className="responsive-text">
                {selectedSeller.firstname
                  ? `${selectedSeller.firstname} ${selectedSeller.lastname}`
                  : "No disponible"}
              </span>
            </div>
            <div className="w-full flex flex-col">
              <span className="responsive-text font-bold">Cédula:</span>
              <span className="responsive-text">
                {capitalizeFirstLetter(selectedSeller.id || "No disponible")}
              </span>
            </div>
            <div className="w-full flex flex-col">
              <span className="responsive-text font-bold">Teléfono:</span>
              <span className="responsive-text">
                {capitalizeFirstLetter(selectedSeller.phone || "No disponible")}
              </span>
            </div>
            {customButton && <div className="mt-4">{customButton}</div>}
          </div>
        )}
      </div>
    )
  );
};

export default SellerPicker;
