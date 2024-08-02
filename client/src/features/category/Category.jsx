import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
/* components */
import Product from "../product/Product";
/* slices */
import { getAllProducts, getProductsByCategory } from "../slices/productsSlice";
/* react bootstrap */
import { Spinner } from "react-bootstrap";
/* react router */
import { useParams, useLocation } from "react-router-dom";

const Category = () => {
  /* ESTADOS REDUX */
  const { products } = useSelector((state) => state.products);
  const dispatch = useDispatch();

  /* REACT ROUTER PARAMS */
  const { name } = useParams();
  const location = useLocation();
  const { categoryId } = location.state || {};

  useEffect(() => {
    if (name === "todas") {
      dispatch(getAllProducts());
    } else {
      dispatch(getProductsByCategory({ categoryId }));
    }
  }, []);

  return products ? (
    <div className="page-container md:justify-center">
      <div className="md:w-[80%] flex flex-wrap justify-around gap-5">
        {products?.map((product) => (
          <Product key={product.id} product={product} />
        ))}
      </div>
    </div>
  ) : (
    <Spinner animation="border" size="sm" />
  );
};

export default Category;
