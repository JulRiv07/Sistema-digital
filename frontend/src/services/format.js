export function fmtNumber(value, decimals = 0) {
    const n = Number(value ?? 0);
    if (Number.isNaN(n)) return "0";
    return n.toLocaleString("es-CO", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}

export function fmtCurrency(value, decimals = 0) {
    const n = Number(value ?? 0);
    if (Number.isNaN(n)) return "$ 0";
    return `$ ${fmtNumber(n, decimals)}`;
}