// src/components/RegistroVenta.js

import { useState } from "react";
import { addDoc, collection, doc, updateDoc, Timestamp, increment, writeBatch } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import useAlerta from "../hooks/useAlerta";
import Alerta from "./Alerta";

function RegistroVenta({ rifa }) {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [numerosInput, setNumerosInput] = useState("");
  const { mensaje, tipo, mostrarAlerta, cerrarAlerta } = useAlerta();

  if (!rifa) {
    return <p className="text-center text-text-subtle mt-4">Cargando información de la rifa...</p>;
  }

  if (rifa.estado !== "activa") {
    return (
      // REPARACIÓN: Se usa el componente Alerta con el tipo 'warning'.
      <div className="mt-6">
          <Alerta 
            tipo="warning" 
            mensaje="Solo puedes registrar ventas cuando la rifa esté activa." 
          />
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const numerosArray = numerosInput
      .split(',')
      .map(n => parseInt(n.trim(), 10))
      .filter(n => !isNaN(n) && n >= 0 && n < rifa.boletos);

    if (!nombre || !telefono) {
      mostrarAlerta("El nombre y el teléfono son obligatorios.", "error");
      return;
    }

    if (numerosArray.length === 0) {
      mostrarAlerta("Debes ingresar al menos un número de boleto válido y separado por coma.", "error");
      return;
    }

    try {
      const batch = writeBatch(db);
      const rifaRef = doc(db, "rifas", rifa.id);
      batch.update(rifaRef, {
        boletosVendidos: increment(numerosArray.length),
      });

      const ventaRef = doc(collection(db, "rifas", rifa.id, "ventas"));
      batch.set(ventaRef, {
        nombre,
        telefono,
        correo: correo || "",
        numeros: numerosArray,
        cantidad: numerosArray.length,
        fecha: Timestamp.now(),
      });
      
      await batch.commit();

      mostrarAlerta("Venta manual registrada con éxito.", "exito");
      setNombre("");
      setTelefono("");
      setCorreo("");
      setNumerosInput("");

    } catch (error) {
      console.error("Error al registrar venta manual:", error);
      mostrarAlerta("Error al registrar la venta. ¿Iniciaste sesión?", "error");
    }
  };

  return (
    // REPARACIÓN: Se usan clases del tema para el contenedor.
    <div className="bg-background-light p-6 rounded-lg shadow-md mt-6 border border-border-color">
      {/* REPARACIÓN: Se elimina el color fijo del título. */}
      <h2 className="text-xl font-bold mb-4">Registrar Venta Manual</h2>
      
      <div className="mb-4">
        {mensaje && <Alerta mensaje={mensaje} tipo={tipo} onClose={cerrarAlerta} />}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            {/* REPARACIÓN: Se eliminan clases de color y se usa .input-field. */}
            <label className="block text-sm font-medium text-text-subtle">Nombre del Comprador</label>
            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Juan Pérez" className="input-field mt-1" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-subtle">Teléfono</label>
            <input type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="Ej: 5512345678" className="input-field mt-1" required />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-text-subtle">Correo Electrónico (Opcional)</label>
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="Ej: juan@correo.com"
            className="input-field mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-subtle">Números de Boleto</label>
          <input type="text" value={numerosInput} onChange={(e) => setNumerosInput(e.target.value)} placeholder="Escribe los números separados por coma. Ej: 5, 23, 112" className="input-field mt-1" required />
        </div>
        <div className="text-right">
          {/* REPARACIÓN: Se usan las clases de botón del tema. */}
          <button type="submit" className="w-full sm:w-auto btn bg-success text-white hover:bg-green-700">
            Registrar Venta
          </button>
        </div>
      </form>
    </div>
  );
}

export default RegistroVenta;
