import React, { useState, useEffect } from "react";

const Pill = ({ status, setBgColor, prefix }) => {
  const [bg, setBg] = useState();

  useEffect(() => {
    setBgColor(setBg, status);
  }, [status]);

  return (
    <div className={`rounded-full ${bg} px-2`}>
      <span></span>
      <span className="responsive-text texy-[#000000]">
        {prefix && prefix} {status}
      </span>
    </div>
  );
};

export default Pill;
