import React from 'react';

/**
 * Componente reutilizable para renderizar un campo de edición para una plantilla de mensaje.
 * @param {object} props
 * @param {string} props.id - El identificador único para la plantilla (ej. "plantillaApartadoCliente").
 * @param {string} props.label - El título legible para el campo (ej. "Mensaje de Apartado (Cliente)").
 * @param {string} props.description - Una breve explicación del propósito del mensaje.
 * @param {string} props.value - El valor actual de la plantilla.
 * @param {function} props.onChange - La función para manejar cambios en el textarea.
 * @param {string[]} props.variables - Un array de strings con las variables disponibles para esta plantilla.
 */
const TemplateField = ({ id, label, description, value, onChange, variables }) => (
    <div>
        <label htmlFor={id} className="block text-md font-bold mb-2 text-text-primary">{label}</label>
        <p className="text-xs text-text-subtle mb-2">{description}</p>
        <textarea
            id={id}
            name={id}
            value={value || ''}
            onChange={onChange}
            className="input-field w-full min-h-[150px] font-mono text-sm"
        />
        <div className="mt-2 text-xs text-text-subtle bg-background-dark p-2 rounded-md">
            <p className="font-bold mb-1">Variables disponibles:</p>
            <p className="flex flex-wrap gap-x-2">
                {variables.map(v => <code key={v}>{`{${v}}`}</code>)}
            </p>
        </div>
    </div>
);

/**
 * Formulario principal para editar todas las plantillas de mensajes de WhatsApp.
 * @param {object} props
 * @param {object} props.mensajesConfig - El estado actual de las plantillas de mensajes.
 * @param {function} props.setMensajesConfig - La función para actualizar el estado de las plantillas.
 * @param {object} props.plantillasDisponibles - Un objeto que define la estructura de cada plantilla (label, description, variables).
 */
function MensajesForm({ mensajesConfig, setMensajesConfig, plantillasDisponibles }) {
    
    const handleMensajesInputChange = (e) => {
        const { name, value } = e.target;
        setMensajesConfig(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {Object.keys(plantillasDisponibles).map(key => (
                <TemplateField
                    key={key}
                    id={key}
                    label={plantillasDisponibles[key].label}
                    description={plantillasDisponibles[key].description}
                    value={mensajesConfig[key]}
                    onChange={handleMensajesInputChange}
                    variables={plantillasDisponibles[key].variables}
                />
            ))}
        </div>
    );
}

export default MensajesForm;
