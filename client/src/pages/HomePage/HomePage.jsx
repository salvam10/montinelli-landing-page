import React from "react";
import NavBar from "../../features/navBar/NavBar";
import CategoriesList from "../../features/categoriesList/CategoriesList";

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
