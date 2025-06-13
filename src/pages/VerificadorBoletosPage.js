// src/pages/VerificadorBoletosPage.js

import React, { useState, useEffect } from 'react';
// ==================================================================
// INICIO DE CORRECCIÓN: Añadimos 'orderBy' a la importación
// ==================================================================
import { collection, collectionGroup, query, where, getDocs, onSnapshot, orderBy } from 'firebase/firestore';
// ==================================================================
// FIN DE CORRECCIÓN
// ==================================================================
import { db } from '../firebase/firebaseConfig';
import { RIFAS_ESTADOS } from '../constants/rifas';
import { Link } from 'react-router-dom';
import ContadorRegresivo from '../components/ContadorRegresivo';

// --- ÍCONOS ---
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const ChevronDownIcon = ({ isOpen }) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6"/></svg>);
const TicketIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 9a3 3 0 0 1 0 6v1a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-1a3 3 0 0 1 0-6V8a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>;

// --- SUB-COMPONENTE PARA MOSTRAR RESULTADOS ---
const TarjetaResultado = ({ resultado }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Caso 1: Boleto Disponible
  if (resultado.estado === 'disponible') {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 text-center border-t-8 border-green-500">
        <TicketIcon className="w-10 h-10 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-800">{resultado.nombreRifa}</h3>
        <p className="text-sm text-gray-500 mb-4">Boleto Número:</p>
        <p className="text-5xl font-mono font-bold text-green-600 tracking-wider mb-4">{String(resultado.numeroBuscado).padStart(5, '0')}</p>
        <p className="font-semibold text-lg text-green-700 mb-4">¡Este boleto está disponible!</p>
        <Link to={`/rifas/${resultado.rifaId}`} className="inline-block bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors">
          ¡Lo quiero!
        </Link>
      </div>
    )
  }

  // Caso 2: Búsqueda por Teléfono (Múltiples compras)
  if (resultado.type === 'telefono') {
    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-md">
        <button 
          className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-50 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex-1 pr-4">
            <p className="font-bold text-gray-800">{resultado.nombreRifa}</p>
            <p className="text-sm text-gray-500">{resultado.cantidad} boleto(s)</p>
          </div>
          <div className="flex items-center gap-4">
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${resultado.estado === 'comprado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {resultado.estado === 'comprado' ? 'Pagado' : 'Apartado'}
            </span>
            <ChevronDownIcon isOpen={isOpen} />
          </div>
        </button>

        {isOpen && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <p className="font-semibold text-gray-700 mb-2">Números:</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {resultado.numeros.map(n => <span key={n} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-mono text-sm">{String(n).padStart(5, '0')}</span>)}
            </div>
            {resultado.estado === 'apartado' && resultado.fechaExpiracion && (
              <div className="flex justify-center mt-3">
                  <ContadorRegresivo fechaExpiracion={resultado.fechaExpiracion} />
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // Caso 3: Búsqueda por Boleto Específico (Pagado o Apartado)
  const esPagado = resultado.estado === 'comprado';
  const nombreParcial = `${resultado.comprador.nombre.split(' ')[0]} ****`;

  return (
    <div className={`rounded-xl shadow-lg p-6 text-center border-t-8 ${esPagado ? 'border-green-500' : 'border-yellow-500'}`} style={{background: 'linear-gradient(to bottom, #ffffff, #f9fafb)'}}>
        <h3 className="text-xl font-bold text-gray-800">{resultado.nombreRifa}</h3>
        <p className="text-sm text-gray-500 mb-4">Boleto Número:</p>
        <p className="text-5xl font-mono font-bold text-blue-600 tracking-wider mb-4">{String(resultado.numeroBuscado).padStart(5, '0')}</p>
        
        <div className="text-left space-y-2 border-t pt-4">
            <p><strong>Comprador:</strong> {nombreParcial}</p>
            <p className="flex items-center"><strong>Estado:</strong> 
                <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${esPagado ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {esPagado ? 'Pagado' : 'Apartado'}
                </span>
            </p>
            {!esPagado && resultado.fechaExpiracion && (
                <div className="flex pt-2">
                    <ContadorRegresivo fechaExpiracion={resultado.fechaExpiracion} />
                </div>
            )}
        </div>
        <p className="text-xs text-gray-400 mt-4 italic">
            * Por motivos de privacidad, solo se muestra el primer nombre del comprador.
        </p>
    </div>
  );
};


function VerificadorBoletosPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('telefono');
  const [selectedRifaId, setSelectedRifaId] = useState('');
  
  const [rifasActivas, setRifasActivas] = useState([]);
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState('');
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);
  const [openAccordionId, setOpenAccordionId] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "rifas"), where("estado", "==", RIFAS_ESTADOS.ACTIVA), orderBy("fechaCreacion", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRifasActivas(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setBuscando(true);
    setError('');
    setResultados([]);
    setBusquedaRealizada(false);

    try {
      let data = [];
      if (searchType === 'telefono') {
        const q = query(collectionGroup(db, 'ventas'), where('comprador.telefono', '==', searchTerm));
        const querySnapshot = await getDocs(q);
        data = querySnapshot.docs.map(doc => ({ id: doc.id, type: 'telefono', ...doc.data() }));
      } else {
        if (!selectedRifaId) {
          setError("Por favor, selecciona una rifa para buscar por boleto.");
          setBuscando(false);
          return;
        }
        const numeroBoleto = parseInt(searchTerm, 10);
        if(isNaN(numeroBoleto)) {
            setError("Por favor, introduce un número de boleto válido.");
            setBuscando(false);
            return;
        }
        const q = query(
          collection(db, 'rifas', selectedRifaId, 'ventas'),
          where('numeros', 'array-contains', numeroBoleto)
        );
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          const rifaSeleccionada = rifasActivas.find(r => r.id === selectedRifaId);
          data = [{ id: 'disponible', estado: 'disponible', numeroBuscado: numeroBoleto, rifaId: selectedRifaId, nombreRifa: rifaSeleccionada.nombre }];
        } else {
          data = querySnapshot.docs.map(doc => ({ 
              id: doc.id, 
              type: 'boleto',
              ...doc.data(),
              numeroBuscado: numeroBoleto
            }));
        }
      }
      setResultados(data);
    } catch (err) {
      console.error("Error al buscar boletos:", err);
      setError("Ocurrió un error durante la búsqueda. Inténtalo de nuevo.");
    } finally {
      setBuscando(false);
      setBusquedaRealizada(true);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">Verificador de Boletos</h1>
          <p className="mt-2 text-lg text-gray-500">Consulta el estado de tu participación.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <form onSubmit={handleSearch}>
            <div className="mb-4">
              <select 
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="telefono">Buscar por mi Teléfono</option>
                <option value="boleto">Buscar por No. de Boleto</option>
              </select>
            </div>
            
            <div className="space-y-4">
              {searchType === 'boleto' && (
                <select 
                  value={selectedRifaId}
                  onChange={(e) => setSelectedRifaId(e.target.value)}
                  required
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">-- Selecciona la Rifa --</option>
                  {rifasActivas.map(rifa => (
                    <option key={rifa.id} value={rifa.id}>{rifa.nombre}</option>
                  ))}
                </select>
              )}
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchType === 'telefono' ? 'Tu número de teléfono...' : 'El número de tu boleto...'}
                required
                className="w-full text-lg border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button 
              type="submit"
              disabled={buscando}
              className="mt-6 w-full flex items-center justify-center bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 disabled:bg-gray-400"
            >
              <SearchIcon />
              {buscando ? 'Buscando...' : 'Verificar'}
            </button>
          </form>
          {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
        </div>

        {busquedaRealizada && (
          <div className="mt-10 animate-fade-in space-y-4">
            <h2 className="text-2xl font-bold text-center">Resultados</h2>
            
            {resultados.length > 0 ? (
                resultados.map(res => <TarjetaResultado key={res.id} resultado={res} />)
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center text-gray-500">
                <TicketIcon className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                <p className="font-bold">No se Encontraron Resultados</p>
                <p className="text-sm mt-2">Asegúrate de que el número y la rifa (si aplica) sean correctos.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default VerificadorBoletosPage;