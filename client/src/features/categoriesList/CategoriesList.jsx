import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getCategories } from "../slices/categoriesSlice";

const CategoriesList = () => {
  const { categories } = useSelector((state) => state.categories);
  const navigate = useNavigate();
  const dispatch = useDispatch();

 useEffect(() => {
   dispatch(getCategories({ names: ["Montinelli", "Peros"] }));
 }, [dispatch]);


  const handleClick = (category) => {
    navigate(`/categorias/${category.name.toLowerCase()}`, {
      state: { categoryId: category.id } //pasar parametros extra
    });
  };

  const handleClickAll = () => {
    navigate(`/categorias/todas`);
  }
  return (
    <div className="w-full bg-white">
      {categories?.map((cat, index) => (
        <li
          className="flex-center custom-li"
          key={index}
          onClick={(e) => {
            handleClick(cat);
          }}
        >
          {cat.name}
        </li>
      ))}
      {/*  ESPERAR A QUE SE ITERE SOBRE TODA LA LISTA DE CATEGORIAS PARA LUEGO
      ANEXAR LA OPCIÓN "TODAS" */}
      {categories && categories.length > 0 && (
        <li className="flex-center custom-li" onClick={handleClickAll}>
          Todas
        </li>
      )}
    </div>
  );
};

export default CategoriesList;
