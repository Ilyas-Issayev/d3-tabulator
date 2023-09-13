// determineCategory.js

/**
 * Определяет категорию на основе имени продавца и названия филиала.
 *
 * @param {string} salespersonName - Имя продавца.
 * @param {string} TrnBranchName - Название филиала (не используется в этой функции, может быть опущено).
 * @returns {string} Категория продавца.
 */
export function determineCategory(salespersonName, TrnBranchName) {
    // Если имя продавца существует
    if (salespersonName) {
        // Убираем слеши и кавычки из имени продавца
        let trimmedData = salespersonName.replace(/\\/g, '').replace(/"/g, '');

        // Проверяем имя продавца на соответствие определенным значениям
        if (
            trimmedData === "AMANDA LABATTE-DAWE" ||
            trimmedData === "SHAMANNA KELAMANGALAM"
        ) {
            return "Architectural";
        } else if (
            trimmedData === "GRACE FARROW" ||
            trimmedData === "LUC TREMBLAY" ||
            trimmedData === "MIKE SIMONIN" ||
            trimmedData === "SAM VECIA" ||
            trimmedData === "SARA RAJIC"
        ) {
            return "Distribution";
        } else if (trimmedData === "HOUSE ACCOUNT") {
            return "HOUSE ACCOUNT (HOU)";
        } else if (trimmedData === "TILEMASTER HOUSE ACCOUNT") {
            return "TILEMASTER HOUSE ACCOUNT (HSE)";
        } else if (
            trimmedData === "500 ACCOUNTS" ||
            trimmedData === "HOUSE" ||
            trimmedData === "MIKE RIEL" ||
            trimmedData === "STEVAN UZELAC" ||
            trimmedData === "TERRY AHERN" ||
            trimmedData === "TILEASTER HOUSE ACCT" ||
            trimmedData === "TILEMASTER HOUSE ACCT" ||
            trimmedData === "JOHN DAVISON"
        ) {
            return "Other";
        }
    }

    // Если имя продавца не определено или не соответствует известным категориям, возвращаем "Unknown"
    return "Unknown";
}