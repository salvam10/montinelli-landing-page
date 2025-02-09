import React from "react";
import NavBar from "../../features/navBar/NavBar";
import Category from "../../features/category/Category";
import OrderForm from "../../features/orderForm/OrderForm";
import CategoriesList from "../../features/categoriesList/CategoriesList";
import FileUploader from "../../features/fileUploader/FileUploader";

const HomePage = () => {
  return (
    <div className="page-container h-screen">
      <div className="w-full">
        <CategoriesList />
      </div>
    </div>
  );
};

export default HomePage;
