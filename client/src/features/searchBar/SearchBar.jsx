import { useState } from "react";

const SearchBar = ({ placeholder = "Buscar producto...", onChange }) => {
  const [q, setQ] = useState("");
  const handleChange = (e) => {
    const v = e.target.value;
    setQ(v);
    onChange?.(v);
  };
  return (
    <div className="w-full">
      <input
        value={q}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full border rounded px-3 py-2"
        type="text"
      />
    </div>
  );
};

export default SearchBar;
    