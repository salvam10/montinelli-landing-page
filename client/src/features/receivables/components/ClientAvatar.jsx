import React from "react";
import { initialsOf, colorFromName } from "../receivablesHelpers";

/** Avatar con iniciales y color estable por nombre */
const ClientAvatar = ({ name, size = 36 }) => {
  const initials = initialsOf(name);
  const bg = colorFromName(name);
  const fontSize = Math.round(size * 0.36);

  return (
    <div
      className="flex items-center justify-center rounded-full text-white font-bold uppercase shrink-0"
      style={{
        backgroundColor: bg,
        width: size,
        height: size,
        fontSize,
      }}
    >
      {initials}
    </div>
  );
};

export default ClientAvatar;
