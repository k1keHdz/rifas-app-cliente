// src/context/RifasContext.js

import { createContext, useState, useEffect, useContext } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const RifasContext = createContext();

export const useRifas = () => {
  return useContext(RifasContext);
};

export const RifasProvider = ({ children }) => {
  const [rifas, setRifas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [rifaSeleccionada, setRifaSeleccionada] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false); // NUEVO: Estado para controlar la visibilidad

  useEffect(() => {
    const q = query(collection(db, "rifas"), orderBy("fechaCreacion", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setRifas(data);
      setCargando(false);
    });
    return () => unsubscribe();
  }, []);

  const seleccionarRifaParaEditar = (rifa) => {
    setRifaSeleccionada(rifa);
    setIsFormVisible(true); // NUEVO: Al editar, también mostramos el form
  };

  const iniciarCreacionRifa = () => {
    setRifaSeleccionada(null); // Nos aseguramos que no hay ninguna seleccionada
    setIsFormVisible(true); // NUEVO: Mostramos el form para crear
  };

  const ocultarFormulario = () => {
    setRifaSeleccionada(null);
    setIsFormVisible(false); // NUEVO: Función para ocultar el form
  };
  
  const value = {
    rifas,
    cargando,
    rifaSeleccionada,
    seleccionarRifaParaEditar,
    // La función deseleccionarRifa ya no la necesitamos, ocultarFormulario hace su trabajo
    
    // Funciones nuevas que estarán disponibles en el "tablero"
    isFormVisible,
    iniciarCreacionRifa,
    ocultarFormulario,
  };

  return <RifasContext.Provider value={value}>{children}</RifasContext.Provider>;
};