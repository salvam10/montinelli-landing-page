import React, {useEffect} from "react";
import { useDispatch } from 'react-redux';
import { resetCart } from "../../features/slices/cartSlice";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const SuccesfullPage = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(resetCart())
  },[])
  


  return (
    <div className="page-container">
      <div className="section-container h-[80%]">
        <div className="flex-center flex-col">
          <h3 className="font-bold xs:text-[30px] md:text-[50px]">
            Pedido Realizado
          </h3>
          <CheckCircleIcon style={{ fontSize: "50px", color: "green" }} />
        </div>
      </div>
    </div>
  );
};

export default SuccesfullPage;
