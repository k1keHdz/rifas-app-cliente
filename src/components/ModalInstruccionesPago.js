// src/components/ModalInstruccionesPago.js

function ModalInstruccionesPago({ onClose, infoRifa, infoVenta }) {
  const totalAPagar = infoRifa.precio * infoVenta.cantidad;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-black text-2xl">&times;</button>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-green-600 mb-2">¡Apartado con Éxito!</h2>
          <p className="text-gray-700 mb-4">Solo falta un paso. Realiza el pago para asegurar tus boletos.</p>
          
          <div className="text-left bg-gray-50 p-4 rounded-lg border">
            <h3 className="font-bold text-lg mb-3">Instrucciones de Pago</h3>
            <p className="mb-2"><strong>Rifa:</strong> {infoRifa.nombre}</p>
            <p className="mb-2"><strong>Boletos Apartados:</strong> {infoVenta.numeros.map(n => n.toString().padStart(3, '0')).join(', ')}</p>
            <p className="mb-4"><strong>Total a Pagar:</strong> <span className="font-bold text-xl">${totalAPagar}</span></p>
            
            <p className="font-semibold">Datos para la transferencia:</p>
            <ul className="list-disc list-inside text-gray-800 mt-1">
              <li><strong>Banco:</strong> Tu Banco XYZ</li>
              <li><strong>Titular:</strong> Tu Nombre Completo</li>
              <li><strong>Número de Cuenta:</strong> 1234567890</li>
              <li><strong>CLABE:</strong> 098765432109876543</li>
              <li><strong>Concepto/Referencia:</strong> {infoVenta.id.slice(0, 8).toUpperCase()}</li>
            </ul>
            <p className="text-xs mt-3 text-gray-500">Una vez realizado el pago, envia tu comprobante a nuestro WhatsApp para confirmar la compra.</p>
          </div>

          <button
            onClick={onClose}
            className="mt-6 w-full px-6 py-2 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalInstruccionesPago;