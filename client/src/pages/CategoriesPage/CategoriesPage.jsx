import React from "react";
import { categories } from "../../dummy";
import { useNavigate } from "react-router-dom";
import CategoriesList from "../../features/categoriesList/CategoriesList";

const CategoriesPage = () => {
  const navigate = useNavigate();

  return (
   <CategoriesList />
  );
};

export default CategoriesPage;
