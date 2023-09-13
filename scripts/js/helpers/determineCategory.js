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
        return trimmedData;

    }

    // Если имя продавца не определено или не соответствует известным категориям, возвращаем "Unknown"
    return "Unknown";
}