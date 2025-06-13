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
  const [isFormVisible, setIsFormVisible] = useState(false);

  // ==================================================================
  // INICIO DE CAMBIOS: Nuevo estado para manejar mensajes de feedback
  // ==================================================================
  const [feedback, setFeedback] = useState({ msg: '', type: '' });

  const showFeedback = (msg, type = 'info') => {
    setFeedback({ msg, type });
    setTimeout(() => {
      setFeedback({ msg: '', type: '' });
    }, 4000);
  };
  // ==================================================================
  // FIN DE CAMBIOS
  // ==================================================================


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
    setIsFormVisible(true);
  };

  const iniciarCreacionRifa = () => {
    setRifaSeleccionada(null);
    setIsFormVisible(true);
  };

  const ocultarFormulario = () => {
    setRifaSeleccionada(null);
    setIsFormVisible(false);
  };
  
  const value = {
    rifas,
    cargando,
    rifaSeleccionada,
    seleccionarRifaParaEditar,
    isFormVisible,
    iniciarCreacionRifa,
    ocultarFormulario,
    // ==================================================================
    // INICIO DE CAMBIOS: Exportamos la función de feedback
    // ==================================================================
    feedback,
    showFeedback,
    // ==================================================================
    // FIN DE CAMBIOS
    // ==================================================================
  };

  return <RifasContext.Provider value={value}>{children}</RifasContext.Provider>;
};