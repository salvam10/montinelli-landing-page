import {
  Combobox,
  ComboboxInput,
  ComboboxOptions,
  ComboboxOption,
  ComboboxButton,
} from "@headlessui/react";
import { useState } from "react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";

const CustomCombobox = ({ options, selected, setSelected, label }) => {
  const [query, setQuery] = useState("");

  // Normaliza tipos (evita desajuste "123" vs 123)
  const normOptions = options.map((o) => ({
    value: String(o.value),
    label: o.label,
  }));
  const selectedValue = selected == null ? "" : String(selected);

  const filtered =
    query === ""
      ? normOptions
      : normOptions.filter((opt) =>
          opt.label.toLowerCase().includes(query.toLowerCase())
        );

  const selectedOption = normOptions.find(
    (opt) => opt.value === selectedValue
  ) || { value: "", label: "" };

  return (
    <div className="w-full flex flex-col gap-2">
      <label className="xs:text-[10px]">{label}</label>

      <div className="relative">
        <Combobox
          value={selectedValue} // ✅ nunca undefined
          onChange={(val) => setSelected(val ?? "")} // ✅ no setees undefined
        >
          <div className="relative">
            <ComboboxInput
              className="w-full py-[5px] px-[15px] bg-white border border-[#EBEBEB] rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm xs:text-[12px]"
              displayValue={() => selectedOption.label}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Selecciona o escribe..."
            />
            <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
            </ComboboxButton>
          </div>

          <ComboboxOptions className="absolute left-0 right-0 mt-1 z-50 max-h-60 w-full overflow-auto rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
            {filtered.map((option) => (
              <ComboboxOption
                key={option.value}
                value={option.value} // ✅ mismo tipo que `value` del Combobox
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
        </Combobox>
      </div>
    </div>
  );
};


export default CustomCombobox;
