import { createContext, useState, useEffect, useContext, useMemo, useCallback } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

const RifasContext = createContext();

export const useRifas = () => {
    return useContext(RifasContext);
};

export const RifasProvider = ({ children }) => {
    const [rifas, setRifas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [rifaSeleccionada, setRifaSeleccionada] = useState(null);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [feedback, setFeedback] = useState({ msg: '', type: '' });

    const showFeedback = useCallback((msg, type = 'info') => {
        setFeedback({ msg, type });
        setTimeout(() => {
            setFeedback({ msg: '', type: '' });
        }, 4000);
    }, []);

    useEffect(() => {
        const q = query(collection(db, "rifas"), orderBy("fechaCreacion", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setRifas(data);
            setCargando(false);
        }, (error) => {
            console.error("Error al cargar las rifas:", error);
            setCargando(false);
        });
        return () => unsubscribe();
    }, []);

    const seleccionarRifaParaEditar = useCallback((rifa) => {
        setRifaSeleccionada(rifa);
        setIsFormVisible(true);
    }, []);

    const iniciarCreacionRifa = useCallback(() => {
        setRifaSeleccionada(null);
        setIsFormVisible(true);
    }, []);

    const ocultarFormulario = useCallback(() => {
        setRifaSeleccionada(null);
        setIsFormVisible(false);
    }, []);
    
    const value = useMemo(() => ({
        rifas,
        cargando,
        rifaSeleccionada,
        seleccionarRifaParaEditar,
        isFormVisible,
        iniciarCreacionRifa,
        ocultarFormulario,
        feedback,
        showFeedback,
    }), [rifas, cargando, rifaSeleccionada, isFormVisible, feedback, seleccionarRifaParaEditar, iniciarCreacionRifa, ocultarFormulario, showFeedback]);

    return <RifasContext.Provider value={value}>{children}</RifasContext.Provider>;
};