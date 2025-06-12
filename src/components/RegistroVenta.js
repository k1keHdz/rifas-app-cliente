// src/components/RegistroVenta.js

import { useState } from "react";
import { addDoc, collection, doc, updateDoc, Timestamp, increment, writeBatch } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import useAlerta from "../hooks/useAlerta";
import Alerta from "./Alerta";

function RegistroVenta({ rifa }) {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState(""); // 1. AÑADIMOS ESTADO PARA EL CORREO
  const [numerosInput, setNumerosInput] = useState("");
  const { mensaje, tipo, mostrarAlerta, cerrarAlerta } = useAlerta();

  if (!rifa) {
    return <p className="text-center text-gray-500 mt-4">Cargando información de la rifa...</p>;
  }

  if (rifa.estado !== "activa") {
    return (
      <div className="bg-yellow-100 text-yellow-800 p-4 rounded mt-6 text-center">
        ⚠️ Solo puedes registrar ventas cuando la rifa esté <strong>activa</strong>.
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
      // 3. AÑADIMOS EL CORREO AL DOCUMENTO QUE SE GUARDA
      batch.set(ventaRef, {
        nombre,
        telefono,
        correo: correo || "", // Guardamos el correo, o un string vacío si no se llenó
        numeros: numerosArray,
        cantidad: numerosArray.length,
        fecha: Timestamp.now(),
      });
      
      await batch.commit();

      mostrarAlerta("Venta manual registrada con éxito.", "exito");
      setNombre("");
      setTelefono("");
      setCorreo(""); // Limpiamos también el campo de correo
      setNumerosInput("");

    } catch (error) {
      console.error("Error al registrar venta manual:", error);
      mostrarAlerta("Error al registrar la venta. ¿Iniciaste sesión?", "error");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6 border">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Registrar Venta Manual</h2>
      
      <div className="mb-4">
        {mensaje && <Alerta mensaje={mensaje} tipo={tipo} onClose={cerrarAlerta} />}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre del Comprador</label>
            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Juan Pérez" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
            <input type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="Ej: 5512345678" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required />
          </div>
        </div>
        
        {/* 2. AÑADIMOS EL CAMPO DE CORREO (opcional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Correo Electrónico (Opcional)</label>
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="Ej: juan@correo.com"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Números de Boleto</label>
          <input type="text" value={numerosInput} onChange={(e) => setNumerosInput(e.target.value)} placeholder="Escribe los números separados por coma. Ej: 5, 23, 112" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required />
        </div>
        <div className="text-right">
          <button type="submit" className="w-full sm:w-auto bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors font-semibold shadow">
            Registrar Venta
          </button>
        </div>
      </form>
    </div>
  );
}

export default RegistroVenta;