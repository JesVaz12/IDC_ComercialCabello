/**
 * Decide si una funcionalidad debe estar activa para un usuario.
 * - Para 'mostrar-reloj', la activa SÓLO si el rol es 'Operario'.
 * - Para otras funcionalidades, la decisión es aleatoria y se guarda.
 * @param {string} flagName - El nombre de la bandera (ej. 'mostrar-reloj').
 * @param {string} userRole - El rol del usuario (ej. 'Operario', 'Administrador').
 * @returns {boolean} - Devuelve true si la bandera está activa, false si no.
 */
export const isFeatureEnabled = (flagName, userRole) => {
    // Para la bandera del reloj, la decisión no debe guardarse,
    // siempre debe depender del rol del usuario actual.
    if (flagName === 'mostrar-reloj') {
        return userRole === 'Operario';
    }

    // --- Para todas las demás banderas, se mantiene la lógica original ---

    const savedDecision = localStorage.getItem(flagName);

    // Si ya hay una decisión guardada, la respetamos.
    if (savedDecision !== null) {
        return savedDecision === 'true';
    }

    const newDecision = Math.random() < 0.5;
    localStorage.setItem(flagName, newDecision);

    return newDecision;
};