import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import CustomCombobox from "../customCombobox/CustomCombobox";
import { capitalizeFirstLetter } from "../../helpers/CapitalizeFirstLetter";
import { getCategories } from "../slices/categoriesSlice";

const CategoryPicker = ({ selectedCatId, setSelectedCatId }) => {
  const [options, setOptions] = useState([]);
  const { categories } = useSelector((state) => state.categories);
  const dispatch = useDispatch();

  // Cargar todos los clientes al montar
  useEffect(() => {
    dispatch(getCategories());
  }, []);

  // Cargar detalles del cliente seleccionado (por id)
  useEffect(() => {
    if (selectedCatId) {
      dispatch(getCategories({ parent_id: [67, 68] }));
    }
  }, [selectedCatId]);

  // Formatear las opciones del combo
  useEffect(() => {
    if (categories?.length) {
      const formattedCategories = categories
        .filter((category) => typeof category.name === "string")
        .map((category) => {
          const formattedName = capitalizeFirstLetter(category.name);
          return {
            label: formattedName,
            value: category.id, // <-- ahora usamos client.id como value
          };
        });

      setOptions(formattedCategories);

      // Si no hay cliente seleccionado, usa el primero como predeterminado
      if (!selectedCatId && formattedCategories[0]) {
        setSelectedCatId(formattedCategories[0].value);
      }
    }
  }, [categories]);

  return (
    <div className="section-container">
      <div className="w-full flex">
        <h2 className="font-bold text-[14px]">Categoría</h2>
      </div>
      <div className="w-full relative">
        <CustomCombobox
          options={options}
          selected={selectedCatId}
          setSelected={setSelectedCatId}
        />
      </div>
    </div>
  );
};

export default CategoryPicker;
