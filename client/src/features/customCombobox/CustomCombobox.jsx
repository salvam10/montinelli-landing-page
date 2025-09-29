import {
  Combobox,
  ComboboxInput,
  ComboboxOptions,
  ComboboxOption,
  ComboboxButton,
} from "@headlessui/react";
import { useState, useMemo, useRef } from "react";

// ✅ MUI Icons Outlined
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

const CustomCombobox = ({
  options = [],
  selected,
  setSelected,
  label,
  onQueryChange,
  onCreate,
}) => {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  const normOptions = useMemo(
    () =>
      options.map((o) => ({
        value: String(o.value),
        label: o.label ?? "",
      })),
    [options]
  );
  const selectedValue = selected == null ? "" : String(selected);

  const filtered = useMemo(() => {
    if (!query) return normOptions;
    const q = query.toLowerCase();
    return normOptions.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [normOptions, query]);

  const selectedOption = normOptions.find(
    (opt) => opt.value === selectedValue
  ) || {
    value: "",
    label: "",
  };

  const norm = (s) =>
    String(s || "")
      .trim()
      .toLowerCase();
  const hasExactMatch = filtered.some((o) => norm(o.label) === norm(query));
  const canShowCreate =
    Boolean(onCreate) && Boolean(norm(query)) && !hasExactMatch;

  const handleCreate = () => {
    if (!onCreate || !query.trim()) return;
    inputRef.current?.blur();
    onCreate(query.trim());
  };

  return (
    <div className="w-full flex flex-col gap-2">
      {label && <label className="xs:text-[10px]">{label}</label>}

      <div className="relative">
        <Combobox
          value={selectedValue}
          onChange={(val) => setSelected(val ?? "")}
        >
          <div className="relative">
            <ComboboxInput
              ref={inputRef}
              className="w-full py-[5px] px-[15px] bg-white border border-[#EBEBEB] rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm xs:text-[12px]"
              displayValue={() => selectedOption.label}
              onChange={(e) => {
                const v = e.target.value;
                setQuery(v);
                onQueryChange?.(v);
              }}
              placeholder="Selecciona o escribe..."
            />
            <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ExpandMoreOutlinedIcon className="h-5 w-5 text-gray-400" />
            </ComboboxButton>
          </div>

          <ComboboxOptions className="absolute left-0 right-0 mt-1 z-50 max-h-60 w-full overflow-auto rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
            {filtered.map((option) => (
              <ComboboxOption
                key={option.value}
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
                        <CheckCircleOutlineIcon className="h-5 w-5" />
                      </span>
                    )}
                  </>
                )}
              </ComboboxOption>
            ))}

            {canShowCreate && (
              <li className="border-t">
                <button
                  type="button"
                  onClick={handleCreate}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-emerald-700 hover:bg-gray-50"
                >
                  <AddCircleOutlineIcon className="h-5 w-5" />
                  Agregar “{query.trim()}” como cliente potencial
                </button>
              </li>
            )}
          </ComboboxOptions>
        </Combobox>
      </div>
    </div>
  );
};

export default CustomCombobox;
