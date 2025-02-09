import React, { useState } from "react";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const FileUploader = ({selectedFile, setSelectedFile}) => {
  

const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
};

    
return (
  <div className="flex gap-2 items-center">
    <input
      type="file"
      id="file-upload"
      className="hidden"
      onChange={handleFileChange}
    />
    <label
      htmlFor="file-upload"
      className="flex gap-2 items-center darker-gray-bg text-white px-4 py-2 rounded cursor-pointer hover:bg-[#ff9f1a] transition text-[12px] flex-shrink-0"
    >
      <CloudUploadIcon style={{ fontSize: "20px" }} />
      Subir Rif
    </label>
    {selectedFile && (
      <span className="text-gray-600 text-[12px] italic">
        Archivo seleccionado: {selectedFile.name}
      </span>
    )}
  </div>
);
};

export default FileUploader;

