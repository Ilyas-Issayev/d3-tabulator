// dataProcessor.js
import { determineCategory } from './helpers/determineCategory.js';

/**
 * Функция `groupDataByFirstTable` принимает массив данных и группирует их на основе значений
 * определенных свойств, возвращая массив объектов сгруппированных данных.
 * @param data - Параметр `data` представляет собой массив объектов. Каждый объект представляет строку данных из
 * таблицы. Свойства каждого объекта имеют следующий формат:
 * @returns массив объектов.
 */
export function groupDataByFirstTable(data) {
    // Здесь код для группировки данных по первой таблице.
    const groupedData = data.reduce((result, obj) => {
        const {
            TrnBranchName,
            SaleAmountCDN,
            ArCustomerName,
            SupplierName,
            TrnSalespersonName,
            InvoiceDateChar,
            TrnProductClassDescription,
            TrnBranch,
            Series,
            StockCode,
        } = obj;

        const invoiceDate = new Date(InvoiceDateChar);
        const TrnYear = invoiceDate.getFullYear();
        const TrnMonth = invoiceDate.getMonth() + 1;

        let trimmedTrnBranchName;
        let trimmedTrnSalespersonName;
        let trimmedCustomerName;
        let trimmedProductClassDescription;
        let trimmedTrnBranch;
        let trimmedSeries;
        let trimmedStockCode;
        let trimmedSupplierName;

        if (TrnBranchName) {
            trimmedTrnBranchName = TrnBranchName.replace(/\\/g, '').replace(/"/g, '');
        }
        if (TrnSalespersonName) {
            trimmedTrnSalespersonName = TrnSalespersonName.replace(/\\/g, '').replace(/"/g, '');
        }
        if (ArCustomerName) {
            trimmedCustomerName = ArCustomerName.replace(/\\/g, '').replace(/"/g, '');
        }
        if (TrnProductClassDescription) {
            trimmedProductClassDescription = TrnProductClassDescription.replace(/\\/g, '').replace(/"/g, '');
        }
        if (TrnBranch) {
            trimmedTrnBranch = TrnBranch.replace(/\\/g, '').replace(/"/g, '');
        }
        if (Series) {
            trimmedSeries = Series.replace(/\\/g, '').replace(/"/g, '');
        }
        if (StockCode) {
            trimmedStockCode = StockCode.replace(/\\/g, '').replace(/"/g, '');
        }
        if (SupplierName) {
            trimmedSupplierName = SupplierName.replace(/\\/g, '').replace(/"/g, '');
        }

        const Categories = determineCategory(TrnSalespersonName, TrnBranchName);

        const key = `${TrnBranchName}-${Categories}-${ArCustomerName}-${TrnSalespersonName}-${TrnYear}-${TrnMonth}-${InvoiceDateChar}`;

        if (!result[key]) {
            result[key] = {
                TrnBranchName: trimmedTrnBranchName,
                SalesAmountCDN: parseFloat(SaleAmountCDN),
                Categories,
                ArSupplierName: trimmedSupplierName,
                ArCustomerName: trimmedCustomerName,
                TrnSalespersonName: trimmedTrnSalespersonName,
                TrnYear,
                TrnMonth,
                InvoiceDateChar,
                TrnProductClassDescription: trimmedProductClassDescription,
                TrnBranch: trimmedTrnBranch,
                Series: trimmedSeries,
                StockCode: trimmedStockCode,
            };
        } else {
            result[key].SalesAmountCDN += parseFloat(SaleAmountCDN);
        }

        return result;
    }, {});

    const outputArr = Object.values(groupedData);

    return outputArr;
}

/**
 * Функция `groupDataBySecondTable` принимает массив данных и группирует их на основе значений
 * определенных свойств, возвращая массив объектов сгруппированных данных.
 * @param data - Параметр `data` представляет собой массив объектов. Каждый объект представляет строку данных из
 * таблицы. Объекты имеют следующий формат свойств:
 * @returns массив объектов. Каждый объект представляет группу данных, которая была сгруппирована по
 * второй таблице. Свойства каждого объекта включают:
 */
export function groupDataBySecondTable(data) {
    // Здесь код для группировки данных по второй таблице.
    const groupedData = data.reduce((result, obj) => {
        const {
            TrnProductClassDescription,
            TrnSalespersonName,
            ArCustomerName,
            SupplierName,
            SaleAmountCDN,
            InvoiceDateChar,
            TrnBranchName,
            TrnBranch,
            Series,
            StockCode,
        } = obj;

        const invoiceDate = new Date(InvoiceDateChar);
        const TrnYear = invoiceDate.getFullYear();
        const TrnMonth = invoiceDate.getMonth() + 1;

        let trimmedTrnBranchName;
        let trimmedTrnSalespersonName;
        let trimmedCustomerName;
        let trimmedProductClassDescription;
        let trimmedTrnBranch;
        let trimmedSeries;
        let trimmedStockCode;
        let trimmedSupplierName;

        if (TrnBranchName) {
            trimmedTrnBranchName = TrnBranchName.replace(/\\/g, '').replace(/"/g, '');
        }
        if (TrnSalespersonName) {
            trimmedTrnSalespersonName = TrnSalespersonName.replace(/\\/g, '').replace(/"/g, '');
        }
        if (ArCustomerName) {
            trimmedCustomerName = ArCustomerName.replace(/\\/g, '').replace(/"/g, '');
        }
        if (TrnProductClassDescription) {
            trimmedProductClassDescription = TrnProductClassDescription.replace(/\\/g, '').replace(/"/g, '');
        }
        if (TrnBranch) {
            trimmedTrnBranch = TrnBranch.replace(/\\/g, '').replace(/"/g, '');
        }
        if (Series) {
            trimmedSeries = Series.replace(/\\/g, '').replace(/"/g, '');
        }
        if (StockCode) {
            trimmedStockCode = StockCode.replace(/\\/g, '').replace(/"/g, '');
        }
        if (SupplierName) {
            trimmedSupplierName = SupplierName.replace(/\\/g, '').replace(/"/g, '');
        }

        const key = `${TrnProductClassDescription}-${SupplierName}-${TrnYear}-${TrnMonth}`;

        if (!result[key]) {
            result[key] = {
                TrnProductClassDescription: trimmedProductClassDescription,
                ArSupplierName: trimmedSupplierName,
                SalesAmountCDN: parseFloat(SaleAmountCDN),
                TrnYear,
                TrnMonth,
                ArCustomerName: trimmedCustomerName,
                TrnSalespersonName: trimmedTrnSalespersonName,
                TrnBranchName: trimmedTrnBranchName,
                TrnBranch: trimmedTrnBranch,
                Series: trimmedSeries,
                StockCode: trimmedStockCode,
            };
        } else {
            result[key].SalesAmountCDN += parseFloat(SaleAmountCDN);
        }

        return result;
    }, {});

    const outputArr = Object.values(groupedData);

    return outputArr;
}

/**
 * Функция `groupDataByThirdTable` принимает массив данных и группирует их на основе значений
 * определенных свойств, возвращая сгруппированные данные в виде массива объектов.
 * @param data - Параметр `data` представляет собой массив объектов. Каждый объект представляет строку данных и
 * содержит следующие свойства:
 * @returns Функция `groupDataByThirdTable` возвращает массив объектов.
 */
export function groupDataByThirdTable(data) {
    // Здесь код для группировки данных по третьей таблице.
    console.log(data);

    const groupedData = data.reduce((result, obj) => {
        const {
            TrnBranch,
            TrnBranchName,
            SaleAmountCDN,
            CostAmtCDN,
            InvoiceDateChar,
        } = obj;

        let dateArray = InvoiceDateChar.split('-');
        let year = parseInt(dateArray[0]);
        let month = parseInt(dateArray[1]) - 1;
        let day = parseInt(dateArray[2]);

        const invoiceDate = new Date(year, month, day);
        const TrnYear = invoiceDate.getFullYear();
        const TrnMonth = invoiceDate.getMonth() + 1;

        const key = `${TrnBranch}-${TrnBranchName}-${TrnYear}-${TrnMonth}`;

        if (!result[key]) {
            result[key] = {
                TrnBranch,
                TrnBranchName,
                SalesAmt: parseFloat(SaleAmountCDN),
                CostAmt: parseFloat(CostAmtCDN),
                CountAll: 1,
                Margin: parseFloat(SaleAmountCDN) - parseFloat(CostAmtCDN),
                MarginPct: ((parseFloat(SaleAmountCDN) - parseFloat(CostAmtCDN)) / parseFloat(SaleAmountCDN)) * 100,
                TrnYear,
                TrnMonth,
            };
        } else {
            result[key].SalesAmt += parseFloat(SaleAmountCDN);
            result[key].CostAmt += parseFloat(CostAmtCDN);
            result[key].CountAll++;
            result[key].Margin += parseFloat(SaleAmountCDN) - parseFloat(CostAmtCDN);
            result[key].MarginPct = (result[key].Margin / result[key].SalesAmt) * 100;
        }

        return result;
    }, {});

    const outputArr = Object.values(groupedData);

    console.log(outputArr);
    return outputArr;
}

/**
 * Функция `getUniqueValuesForFilter` принимает массив объектов и имя свойства, и возвращает
 * массив уникальных значений этого свойства из объектов, представленных в виде объектов с
 * свойствами `id` и `text`.
 * @param data - Параметр `data` представляет собой массив объектов. Каждый объект представляет собой элемент данных
 * и содержит свойства со значениями.
 * @param propertyName - Параметр `propertyName` является именем свойства в массиве `data`, из которого нужно извлечь уникальные значения.
 * @returns массив объектов, где каждый объект имеет два свойства: "id" и "text". Свойство "id" устанавливается в уникальное значение
 * из массива данных на основе указанного имени свойства, а свойство "text" также устанавливается в то же уникальное значение.
 */
export function getUniqueValuesForFilter(data, propertyName) {
    const uniqueValues = [...new Set(data.map(item => item[propertyName]))];
    return uniqueValues.map(value => {
        return { id: value, text: value };
    });
}
