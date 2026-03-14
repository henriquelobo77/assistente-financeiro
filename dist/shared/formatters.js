export function formatBRL(valueInCents) {
    const reais = valueInCents / 100;
    return reais.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
export function parseBRL(input) {
    const cleaned = input.replace(/[R$\s.]/g, '').replace(',', '.');
    const value = parseFloat(cleaned);
    if (isNaN(value) || value <= 0)
        return null;
    return Math.round(value * 100);
}
export function formatDate(isoDate) {
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
}
export function parseDate(input) {
    const match = input.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match)
        return null;
    const [, day, month, year] = match;
    const date = new Date(`${year}-${month}-${day}T00:00:00`);
    if (isNaN(date.getTime()))
        return null;
    if (date.getDate() !== Number(day))
        return null;
    return `${year}-${month}-${day}`;
}
export function formatCpfCnpj(value) {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 11) {
        return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    if (digits.length === 14) {
        return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return value;
}
export function cleanCpfCnpj(value) {
    return value.replace(/\D/g, '');
}
export function isValidCpfCnpj(value) {
    const digits = cleanCpfCnpj(value);
    return digits.length === 11 || digits.length === 14;
}
//# sourceMappingURL=formatters.js.map