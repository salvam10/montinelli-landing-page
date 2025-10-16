import React, { useState, useEffect, useMemo, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  getClients,
  getSingleClient,
  createClient,
} from "../slices/clientsSlice";
import CustomCombobox from "../customCombobox/CustomCombobox";
import { capitalizeFirstLetter } from "../../helpers/CapitalizeFirstLetter";
import axios from "axios";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";


const ClientPicker = ({
  selectedClientId,
  setSelectedClientId,
  showInfo = true,
  includeProspects = true,
  canCreateProspect = false,
  autoSelectFirst = true,
  onProspectCreated,
}) => {
  const dispatch = useDispatch();
  const { clients, client } = useSelector((s) => s.clients);

  const [options, setOptions] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("");

  // El hijo nos provee una función que: blur del input + foco a un sentinela
  const comboboxCloseRef = useRef(null);

  const labelById = useMemo(() => {
    const map = new Map();
    options.forEach((o) => map.set(String(o.value), o.label));
    return map;
  }, [options]);

  useEffect(() => {
    dispatch(getClients());
  }, [dispatch]);

  useEffect(() => {
    if (selectedClientId != null && selectedClientId !== "") {
      dispatch(getSingleClient({ id: selectedClientId }));
      const lbl = labelById.get(String(selectedClientId));
      if (lbl) setSelectedLabel(lbl);
    } else {
      setSelectedLabel("");
    }
  }, [selectedClientId, dispatch, labelById]);

  useEffect(() => {
    if (!Array.isArray(clients)) return;

    const visible = clients.filter((c) =>
      includeProspects ? true : !c.is_prospect
    );

    const formatted = visible
      .filter((c) => typeof c.name === "string")
      .map((c) => ({
        value: String(c.id),
        label:
          includeProspects && c.is_prospect
            ? `🟡 ${capitalizeFirstLetter(c.name)}`
            : capitalizeFirstLetter(c.name),
        isProspect: !!c.is_prospect,
      }));

    setOptions(formatted);

    if (autoSelectFirst && !selectedClientId && formatted[0]) {
      setSelectedClientId(Number(formatted[0].value));
      setSelectedLabel(formatted[0].label);
    }
  }, [
    clients,
    includeProspects,
    autoSelectFirst,
    selectedClientId,
    setSelectedClientId,
  ]);

  const handleCreateProspect = async (name) => {
    if (!name) return;
    const cleaned = String(name).trim();
    if (!cleaned) return;

    try {
      const created = await dispatch(
        createClient({ name: cleaned, is_prospect: true })
      ).unwrap();

      setSelectedClientId(Number(created.id));
      setSelectedLabel(`🟡 ${capitalizeFirstLetter(created.name)}`);

      setQuery("");

      // Cerrar definitivamente y mover el foco fuera del input
      comboboxCloseRef.current?.();

      onProspectCreated?.(created);
      dispatch(getClients());
    } catch (err) {
      return;
    }
  };

  const clearSelection = () => {
    setSelectedClientId(null);
    setSelectedLabel("");
  };

  return (
    <div className="section-container">
      <div className="w-full flex items-center justify-between">
        <h2 className="font-bold text-[14px]">Cliente</h2>
        {selectedClientId && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs">
              {selectedLabel || "Seleccionado"}
              <button
                type="button"
                onClick={clearSelection}
                className="ml-1 hover:text-gray-900"
                title="Limpiar"
              >
                <CloseOutlinedIcon fontSize="small" />
              </button>
            </span>
          </div>
        )}
      </div>

      <div className="w-full relative">
        <CustomCombobox
          options={options}
          selected={selectedClientId}
          setSelected={(val) => {
            const idNum = Number(val) || null;
            setSelectedClientId(idNum);
            const lbl = labelById.get(String(val)) || "";
            setSelectedLabel(lbl);
            // Cerrar y desplazar foco para que no se reabra
            comboboxCloseRef.current?.();
          }}
          selectedLabel={selectedLabel}
          onQueryChange={(text) => setQuery(text)}
          onCreate={canCreateProspect ? handleCreateProspect : undefined}
          onProvideClose={(fn) => {
            comboboxCloseRef.current = fn;
          }}
        />
      </div>

      {showInfo && (
        <div className="w-full mt-2">
          <div className="w-full flex flex-col">
            <span className="responsive-text font-bold">Nombre:</span>
            <span className="responsive-text">
              {capitalizeFirstLetter(client?.name || "No disponible")}
            </span>
          </div>
          <div className="w-full flex flex-col">
            <span className="responsive-text font-bold">Rif:</span>
            <a
              className="text-[#0079bf] hover:text-[#ff9f1a] client-detail-label cursor-pointer"
              href={client?.rif_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {client?.rif || "No disponible"}
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientPicker;