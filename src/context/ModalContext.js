import React, { createContext, useState, useContext, useMemo } from 'react';

// 1. Creamos el Contexto
const ModalContext = createContext();

// 2. Creamos un "hook" personalizado para usar el contexto fácilmente
export function useModal() {
    return useContext(ModalContext);
}

// 3. Creamos el Proveedor que contendrá la lógica
export function ModalProvider({ children }) {
    const [isDeveloperModalOpen, setIsDeveloperModalOpen] = useState(false);

    const openDeveloperModal = () => {
        setIsDeveloperModalOpen(true);
    };

    const closeDeveloperModal = () => {
        setIsDeveloperModalOpen(false);
    };

    // Usamos useMemo para asegurar que el valor del contexto no se recree innecesariamente
    const value = useMemo(() => ({
        isDeveloperModalOpen,
        openDeveloperModal,
        closeDeveloperModal,
    }), [isDeveloperModalOpen]);

    return (
        <ModalContext.Provider value={value}>
            {children}
        </ModalContext.Provider>
    );
}
