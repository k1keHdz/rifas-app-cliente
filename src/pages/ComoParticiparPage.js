// src/pages/ComoParticiparPage.js

import React from 'react';
import { Link } from 'react-router-dom';

const ElegirIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>;
const SeleccionarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8"><path d="M3 3h18v18H3z"/><path d="M9 9h6v6H9z"/><path d="M9 1v2"/><path d="M15 1v2"/><path d="M9 21v-2"/><path d="M15 21v-2"/><path d="M1 9h2"/><path d="M1 15h2"/><path d="M21 9h-2"/><path d="M21 15h-2"/></svg>;
const PagarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M12.5 8 8 9.5"/><path d="m3 11 5 1.5"/><path d="M12.5 16 8 14.5"/></svg>;
const EsperarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2.5-2.5-2.5S6 10.62 6 12a2.5 2.5 0 0 0 2.5 2.5z"/><path d="M20 12h-6"/><path d="M14.5 4.5 17 2"/><path d="m14 17 3 3"/><path d="M2 12h1.5"/><path d="m5 4.5 1 1"/><path d="m5 17 1-1"/></svg>;

const Paso = ({ icono, titulo, children }) => (
    <div className="flex">
        <div className="flex-shrink-0">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-600 text-white">
                {icono}
            </div>
        </div>
        <div className="ml-4">
            <h3 className="text-lg leading-6 font-bold text-gray-900">{titulo}</h3>
            <p className="mt-2 text-base text-gray-600">{children}</p>
        </div>
    </div>
);


function ComoParticiparPage() {
    return (
        <div className="bg-gray-50 py-12 sm:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">Participar es muy fácil</h2>
                    <p className="mt-2 text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
                        Aprende a Ganar con Nuestro Video Tutorial
                    </p>
                    <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
                        Hemos preparado un video corto para que veas lo simple que es participar.
                    </p>
                </div>

                <div className="mt-12 max-w-4xl mx-auto">
                    <div className="relative rounded-xl shadow-2xl overflow-hidden" style={{ paddingTop: '56.25%' /* Proporción 16:9 */ }}>
                        <iframe 
                            className="absolute top-0 left-0 w-full h-full"
                            src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                            title="YouTube video player" 
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen>
                        </iframe>
                    </div>
                </div>

                <div className="mt-20 text-center">
                    <h3 className="text-2xl font-bold text-gray-900">O Sigue los Pasos Escritos</h3>
                </div>

                <div className="mt-12">
                    <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-12">
                        <Paso icono={<ElegirIcon/>} titulo="Paso 1: Elige tu Sorteo">
                            Navega por nuestra <Link to="/" className="text-blue-600 font-semibold hover:underline">página de inicio</Link> y selecciona el premio por el que quieres competir. ¡Tenemos opciones para todos los gustos!
                        </Paso>

                        <Paso icono={<SeleccionarIcon/>} titulo="Paso 2: Selecciona tus Boletos">
                            Una vez dentro del sorteo, verás el tablero de boletos. Elige tus números de la suerte haciendo clic sobre ellos. Puedes seleccionar tantos como quieras. ¡No olvides usar nuestra "Máquina de la Suerte" si te sientes indeciso!
                        </Paso>

                        <Paso icono={<PagarIcon/>} titulo="Paso 3: Aparta y Paga">
                            Cuando tengas tus boletos, haz clic en "Apartar por WhatsApp". Serás redirigido para enviarnos un mensaje con los detalles de tu compra. Te enviaremos las instrucciones de pago. Tienes 12 horas para completar el pago antes de que tus boletos se liberen.
                        </Paso>

                        <Paso icono={<EsperarIcon/>} titulo="Paso 4: ¡Verifica y Espera!">
                            Una vez confirmado tu pago, tu boleto cambiará a estado "Pagado". Puedes verificarlo en cualquier momento en nuestra página de <Link to="/verificador" className="text-blue-600 font-semibold hover:underline">Verificador de Boletos</Link>. Ahora solo queda esperar la fecha del sorteo. ¡Anunciamos a los ganadores en nuestras redes sociales!
                        </Paso>
                    </div>
                </div>

                <div className="text-center mt-16">
                    <Link to="/" className="inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-blue-700 transition-colors shadow-lg">
                        Ver Sorteos Disponibles Ahora
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default ComoParticiparPage;