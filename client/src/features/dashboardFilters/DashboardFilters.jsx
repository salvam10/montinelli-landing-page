import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import CustomSelect from "../customSelect/CustomSelect";
import { getCategories } from "../slices/categoriesSlice";
import { getMarketProducts } from "../slices/marketProductsSlice";
import CustomCombobox from "../customCombobox/CustomCombobox";
import { getBrands } from "../slices/brandsSlice";

const DashboardFilters = ({
  category,
  setCategory,
  marketProduct,
  setMarketProduct,
  brand,
  setBrand,
}) => {
  const { categories } = useSelector((state) => state.categories);
  const { marketProducts } = useSelector((state) => state.marketProducts);
  const { brands } = useSelector((state) => state.brands);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getCategories({ level: "subcategory" }));
    dispatch(getMarketProducts({ all: true }));
    dispatch(getBrands());
  }, []);


  // Transformar categorías en options para el select
  const catOptions = categories?.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const marketProdsOptions = marketProducts?.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const brandsOptions = brands?.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  return (
    <div className="w-full flex gap-2 py-6">
      <div className="w-[80]">
        <CustomCombobox
          selected={category}
          setSelected={setCategory}
          options={catOptions}
          label="Categoría"
        />
      </div>
      <div className="w-[80]">
        <CustomCombobox
          selected={brand}
          setSelected={setBrand}
          options={brandsOptions}
          label="Marca"
        />
      </div>
      <div className="w-96">
        <CustomCombobox
          selected={marketProduct}
          setSelected={setMarketProduct}
          options={marketProdsOptions}
          label="Producto"
        />
      </div>
    </div>
  );
};

export default DashboardFilters;
