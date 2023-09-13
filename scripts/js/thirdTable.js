//thirdTable.js
import { formatNumber, customNumberSorter } from './helpers/tableHelpers.js';

/**
 * Функция `getThirdTable` принимает массив данных, фильтрует и форматирует данные на основе предыдущего месяца и года,
 * затем создает таблицу Tabulator с отформатированными данными.
 * @param allData - Массив объектов, содержащих данные для каждой строки в таблице. Каждый объект должен
 * содержать следующие свойства:
 * @returns переменная "result", которая представляет собой массив объектов.
 */
export function getThirdTable(allData) {
    console.log(allData);

    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    let previousMonth = currentMonth - 1;
    let previousYear = currentYear;

    if (previousMonth === 0) {
        previousMonth = 12;
        previousYear--;
    }

    const groupedData = allData.filter(item => item.TrnMonth === previousMonth && item.TrnYear === previousYear);

    console.log(groupedData);

    const result = groupedData.map(allData => {
        const allDataSalesAmt = Math.round(allData.SalesAmt);
        const allDataCostAmt = Math.round(allData.CostAmt);
        const allDataMargin = Math.round(allData.Margin);
        const allDataVariance = Math.round(allData.MarginPct) + '%';

        return {
            ...allData,
            SalesAmtFormatted: formatNumber(allDataSalesAmt),
            CostAmtFormatted: formatNumber(allDataCostAmt),
            MarginFormatted: formatNumber(allDataMargin),
            Variance: allDataVariance
        }

    });

    var table = new Tabulator("#example-table3", {
        height: "auto",
        placeholder: "No Data Available",
        layout: "fitDataFill",
        data: result,
        sortable: true,
        rowHeight: 30,
        columns: [
            { title: "Branch", field: "TrnBranch", responsive: 2 }, //never hide this column
            { title: "Branch Info", field: "TrnBranchName" },
            { title: "Sales Amt", field: "SalesAmtFormatted", responsive: 2, sorter: customNumberSorter }, //hide this column first
            { title: "Cost Amt", field: "CostAmtFormatted", responsive: 2 },
            { title: "Margin", field: "MarginFormatted", hozAlign: "center" },
            { title: "Margin Pct", field: "Variance", hozAlign: "center" },
            { title: "NumInvoices", field: "CountAll", hozAlign: "center" },
        ],
        initialSort: [
            { column: "SalesAmtFormatted", dir: "desc" }
        ]
    });

    setTimeout(function () {
        var tableWidth = table.element.clientWidth;
        var totalColumnWidth = table.columnManager.columns.reduce(function (sum, column) {
            return sum + column.getWidth();
        }, 0);

        var availableWidth = tableWidth - totalColumnWidth;

        var firstColumn = table.columnManager.columns[1];
        var originalFirstColumnWidth = firstColumn.getWidth();

        var newFirstColumnWidth = originalFirstColumnWidth + availableWidth - 30;

        firstColumn.setMinWidth(newFirstColumnWidth);
    }, 100);

    table.on("rowClick", function (e, row) {
        var rowData = row.getData();

    });

    return result;
}