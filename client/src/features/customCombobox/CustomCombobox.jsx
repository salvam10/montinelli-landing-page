import {
  Combobox,
  ComboboxInput,
  ComboboxOptions,
  ComboboxOption,
  ComboboxButton,
} from "@headlessui/react";
import { useState, useEffect } from "react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";

const CustomCombobox = ({ options, selected, setSelected, label }) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false); // Estado para controlar la apertura del combobox

  useEffect(() => {
    console.log("Open state changed:", open);
  }, [open]);

  // Filtra las opciones basadas en la búsqueda
  const filteredOptions =
    query === ""
      ? options
      : options.filter((opt) =>
          opt.label.toLowerCase().includes(query.toLowerCase())
        );

  // Asegurarse de que selectedOption nunca sea null ni undefined
  const selectedOption = options.find((opt) => opt.value === selected) || {
    value: "",
    label: "",
  };

  // Si selectedOption es vacío (en caso de borrado), asignar un valor por defecto.
  const currentSelected = selectedOption.value || ""; // Si no hay valor, usa "".

  return (
    <div className="w-full flex flex-col gap-2">
      <label className="xs:text-[10px]">{label}</label>
      <Combobox
        value={currentSelected}
        onChange={(val) => {
          setSelected(val); // Actualiza el valor seleccionado
          setOpen(false); // Cierra las opciones después de la selección
        }}
      >
        <div className="relative">
          <ComboboxInput
            className="w-full py-[5px] px-[15px] bg-white border border-[#EBEBEB] rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm xs:text-[12px]"
            displayValue={() => selectedOption.label}
            onChange={(e) => {
              setQuery(e.target.value); // Actualiza la búsqueda
              setOpen(true); // Abre las opciones al escribir
            }}
            onClick={() => setOpen(true)} // Abre al hacer clic
            onFocus={() => setOpen(true)} // Abre al hacer foco
            placeholder="Selecciona o escribe..."
          />
          <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
          </ComboboxButton>
        </div>
        {open && (
          <ComboboxOptions
            className="absolute z-10 mt-16 max-h-60 w-full overflow-auto rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
            open={open} // Controla la apertura de las opciones
          >
            {filteredOptions.map((option) => (
              <ComboboxOption
                key={option.value} // Usa option.value para la clave única
                value={option.value}
                className={({ active }) =>
                  `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                    active ? "bg-blue-100 text-blue-900" : "text-gray-900"
                  }`
                }
              >
                {({ selected }) => (
                  <>
                    <span
                      className={`block truncate ${
                        selected ? "font-medium" : "font-normal"
                      }`}
                    >
                      {option.label}
                    </span>
                    {selected && (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                        <CheckIcon className="h-5 w-5" />
                      </span>
                    )}
                  </>
                )}
              </ComboboxOption>
            ))}
          </ComboboxOptions>
        )}
      </Combobox>
    </div>
  );
};

export default CustomCombobox;
