import React from 'react'

const CustomSpinner = () => {
  return (
    <button className="w-full gap-2 flex-center ">
      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
    </button>
  );
}

export default CustomSpinner
