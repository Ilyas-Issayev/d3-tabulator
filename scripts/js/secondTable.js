//secondTable.js
import { calculateVariancePercentage, progressBarFormatter, formatNumber, buttonHeaderRenderer, customBottomCalc, customNumberSorter, findObjectsByProperty } from './helpers/tableHelpers.js';

/**
 * Функция `getSecondTable` принимает массив данных, группирует их на основе определенных критериев,
 * вычисляет суммы продаж для разных периодов времени, форматирует результат и возвращает его.
 * @param allData - Параметр `allData` представляет собой массив объектов, содержащих данные для таблицы.
 * Каждый объект представляет строку в таблице и содержит различные свойства, такие как
 * `TrnProductClassDescription`, `ArSupplierName`, `SalesAmountCDN`, `TrnYear`, `TrnMonth`.
 * @returns результат в виде массива объектов, представляющих данные второй таблицы.
 */
export function getSecondTable(allData) {

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const lastYear = currentYear - 1;

    const groupedData = {};

    allData.forEach(item => {

        const TrnProductClassDescription = item.TrnProductClassDescription;
        const supplierName = item.ArSupplierName;

        const salesAmount = item.SalesAmountCDN;
        const year = item.TrnYear;
        const month = item.TrnMonth;

        const branch = item.TrnBranch;
        const series = item.Series;
        const stockcode = item.StockCode;

        const branchName = item.TrnBranchName;
        const salesPersonName = item.TrnSalespersonName;
        const customerName = item.ArCustomerName;


        if (!((year === currentYear && month <= currentMonth) || ((year - 1) === lastYear && month <= currentMonth) || ((year + 1) === currentYear && month <= currentMonth))) {
            return;
        }

        if (!groupedData.hasOwnProperty(TrnProductClassDescription)) {
            groupedData[TrnProductClassDescription] = {
                CurrentYearMonthCalculated: {
                    SalesAmountSDN: 0
                },
                LastYearMonthCalculated: {
                    SalesAmountSDN: 0
                },
                YearToDateCurrentYear: {
                    SalesAmountSDN: 0
                },
                YearToDateLastYear: {
                    SalesAmountSDN: 0
                },
                _children: {}
            };
        }

        const ClassDescrGroup = groupedData[TrnProductClassDescription];

        if (year === currentYear && month === currentMonth) {
            ClassDescrGroup.CurrentYearMonthCalculated.SalesAmountSDN += salesAmount;
        }

        if (year === lastYear && month === currentMonth) {
            ClassDescrGroup.LastYearMonthCalculated.SalesAmountSDN += salesAmount;
        }

        if (year === currentYear && month <= currentMonth) {
            ClassDescrGroup.YearToDateCurrentYear.SalesAmountSDN += salesAmount;
        }

        if (year === lastYear && month <= currentMonth) {
            ClassDescrGroup.YearToDateLastYear.SalesAmountSDN += salesAmount;
        }

        if (!ClassDescrGroup._children.hasOwnProperty(supplierName)) {
            ClassDescrGroup._children[supplierName] = {
                CurrentYearMonthCalculated: {
                    SalesAmountSDN: 0
                },
                LastYearMonthCalculated: {
                    SalesAmountSDN: 0
                },
                YearToDateCurrentYear: {
                    SalesAmountSDN: 0
                },
                YearToDateLastYear: {
                    SalesAmountSDN: 0
                },
                TrnBranch: branch,
                Series: series,
                StockCode: stockcode,
                TrnBranchName: branchName,
                ArCustomerName: customerName,
                TrnSalespersonName: salesPersonName,
                ArSupplierName: supplierName,
            };
        }

        const supplierGroup = ClassDescrGroup._children[supplierName];


        if (year === currentYear && month === currentMonth) {
            supplierGroup.CurrentYearMonthCalculated.SalesAmountSDN += salesAmount;
        }

        if (year === lastYear && month === currentMonth) {
            supplierGroup.LastYearMonthCalculated.SalesAmountSDN += salesAmount;
        }

        if (year === currentYear && month <= currentMonth) {
            supplierGroup.YearToDateCurrentYear.SalesAmountSDN += salesAmount;
        }

        if (year === lastYear && month <= currentMonth) {
            supplierGroup.YearToDateLastYear.SalesAmountSDN += salesAmount;
        }
    });

    const formattedResult = Object.entries(groupedData).map(([TrnProductClassDescription, ClassDescrGroup]) => {
        const salesAmount = ClassDescrGroup.CurrentYearMonthCalculated.SalesAmountSDN;
        const lastYearSalesAmount = ClassDescrGroup.LastYearMonthCalculated.SalesAmountSDN;
        const yearToDateCurrentYearSalesAmount = ClassDescrGroup.YearToDateCurrentYear.SalesAmountSDN;
        const yearToDateLastYearSalesAmount = ClassDescrGroup.YearToDateLastYear.SalesAmountSDN;

        const supplierGroups = Object.entries(ClassDescrGroup._children).map(([supplierName, supplierGroup]) => {
            const salesAmount = supplierGroup.CurrentYearMonthCalculated.SalesAmountSDN;
            const lastYearSalesAmount = supplierGroup.LastYearMonthCalculated.SalesAmountSDN;
            const yearToDateCurrentYearSalesAmount = supplierGroup.YearToDateCurrentYear.SalesAmountSDN;
            const yearToDateLastYearSalesAmount = supplierGroup.YearToDateLastYear.SalesAmountSDN;

            return {
                TrnBranchName: supplierGroup.TrnBranchName,
                ArCustomerName: supplierGroup.ArCustomerName,
                TrnSalespersonName: supplierGroup.TrnSalespersonName,
                TrnBranch: supplierGroup.TrnBranch,
                Series: supplierGroup.Series,
                StockCode: supplierGroup.StockCode,
                ArSupplierName: supplierGroup.ArSupplierName,
                TrnProductClassDescription: supplierName,
                CurrentYearMonthCalculated: salesAmount,
                LastYearMonthCalculated: lastYearSalesAmount,
                YearToDateCurrentYear: yearToDateCurrentYearSalesAmount,
                YearToDateLastYear: yearToDateLastYearSalesAmount,
                SalesAmountSDN: salesAmount
            };
        });

        return {
            TrnProductClassDescription: TrnProductClassDescription,
            CurrentYearMonthCalculated: salesAmount,
            LastYearMonthCalculated: lastYearSalesAmount,
            YearToDateCurrentYear: yearToDateCurrentYearSalesAmount,
            YearToDateLastYear: yearToDateLastYearSalesAmount,
            SalesAmountSDN: salesAmount,
            _children: supplierGroups
        };
    }).filter(ClassDescrGroup => ClassDescrGroup.TrnProductClassDescription !== undefined && ClassDescrGroup.TrnProductClassDescription !== "LastYearMonthCalculated");

    const result = formattedResult.map(customer => {
        const customerCurrentYearMonthCalculated = Math.round(customer.CurrentYearMonthCalculated);
        const customerLastYearMonthCalculated = Math.round(customer.LastYearMonthCalculated);
        const customerVarianceFormatted = calculateVariancePercentage(customerLastYearMonthCalculated, customerCurrentYearMonthCalculated);
        const customerYearToDateCurrentYear = Math.round(customer.YearToDateCurrentYear);
        const customerYearToDateLastYear = Math.round(customer.YearToDateLastYear);
        const customerYearToDateVariance = calculateVariancePercentage(customerYearToDateLastYear, customerYearToDateCurrentYear);

        const resultChild = customer._children.map(client => {
            const clientCurrentYearMonthCalculated = Math.round(client.CurrentYearMonthCalculated);
            const clientLastYearMonthCalculated = Math.round(client.LastYearMonthCalculated);
            const clientYearToDateCurrentYear = Math.round(client.YearToDateCurrentYear);
            const clientYearToDateLastYear = Math.round(client.YearToDateLastYear);
            const clientVariance = calculateVariancePercentage(clientLastYearMonthCalculated, clientCurrentYearMonthCalculated);
            const clientYearToDateVariance = calculateVariancePercentage(clientYearToDateLastYear, clientYearToDateCurrentYear);
            return {
                ...client,
                CurrentYearMonthCalculated: formatNumber(clientCurrentYearMonthCalculated),
                LastYearMonthCalculated: formatNumber(clientLastYearMonthCalculated),
                YearToDateCurrentYear: formatNumber(clientYearToDateCurrentYear),
                YearToDateLastYear: formatNumber(clientYearToDateLastYear),
                Variance: clientVariance,
                YearToDateVariance: clientYearToDateVariance
            }
        });

        return {
            ...customer,
            CurrentYearMonthCalculated: formatNumber(customerCurrentYearMonthCalculated),
            LastYearMonthCalculated: formatNumber(customerLastYearMonthCalculated),
            YearToDateCurrentYear: formatNumber(customerYearToDateCurrentYear),
            YearToDateLastYear: formatNumber(customerYearToDateLastYear),
            Variance: customerVarianceFormatted,
            YearToDateVariance: customerYearToDateVariance,
            _children: resultChild
        }

    });

    var table = new Tabulator("#example-table2", {
        height: "300",
        layout: "fitDataFill",
        data: result,
        dataTree: true,
        sortable: true,
        dataTreeStartExpanded: false,
        rowHeight: 30,
        rowFormatter: function (row) {

            var tableWidth = table.element.clientWidth;
            var totalColumnWidth = table.columnManager.columns.reduce(function (sum, column) {
                return sum + column.getWidth();
            }, 0);

            var availableWidth = tableWidth - totalColumnWidth;

            var firstColumn = table.columnManager.columns[0];

            var originalFirstColumnWidth = firstColumn.getWidth();

            var newFirstColumnWidth = originalFirstColumnWidth + availableWidth;

            var cells = row.getCells();
            var firstCell = cells[0];
            firstCell.getElement().style.minWidth = newFirstColumnWidth - 25 + 'px';


            return row;
        },
        columns: [
            {
                titleFormatter: buttonHeaderRenderer, titleFormatterParams: {
                    branchName: "TrnProductClassDescription",
                }, field: "TrnProductClassDescription", bottomCalc: customBottomCalc, bottomCalcParams: { label: 1 }
            },
            { title: "LY M.", field: "LastYearMonthCalculated", sorter: customNumberSorter, bottomCalc: customBottomCalc },
            { title: "CY M.", field: "CurrentYearMonthCalculated", responsive: 2, bottomCalc: customBottomCalc }, //hide this column first
            { title: "Variance", field: "Variance", formatter: progressBarFormatter, formatterParams: { max: 100 }, bottomCalc: customBottomCalc },
            { title: "YTD LY", field: "YearToDateLastYear", hozAlign: "center", bottomCalc: customBottomCalc },
            { title: "YTD CY", field: "YearToDateCurrentYear", hozAlign: "center", bottomCalc: customBottomCalc },
            { title: "Var YTD", field: "YearToDateVariance", formatter: progressBarFormatter, formatterParams: { max: 100 }, bottomCalc: customBottomCalc },
        ],
        initialSort: [
            { column: "LastYearMonthCalculated", dir: "desc" }
        ]
    });

    table.on("rowClick", function (e, row) {
        var rowData = row.getData();

        if (rowData.hasOwnProperty('_children')) {
            let filterByClickFirstTable = findObjectsByProperty(groupedFirstTableResult, 'TrnProductClassDescription', rowData.TrnProductClassDescription);
            let filterByClickSecondTable = findObjectsByProperty(groupedSecondTableResult, 'TrnProductClassDescription', rowData.TrnProductClassDescription);

            let resultFirstTable = getFirstTable(filterByClickFirstTable);
            let resultSecondTable = getSecondTable(filterByClickSecondTable);
            updateChart(filterByClickFirstTable);
        } else {
            let filterByClickFirstTable = findObjectsByProperty(groupedFirstTableResult, 'ArSupplierName', rowData.ArSupplierName);
            let filterByClickSecondTable = findObjectsByProperty(groupedSecondTableResult, 'ArSupplierName', rowData.ArSupplierName);

            let resultFirstTable = getFirstTable(filterByClickFirstTable);
            let resultSecondTable = getSecondTable(filterByClickSecondTable);
            updateChart(filterByClickFirstTable);
        }

    });

    return result;

}