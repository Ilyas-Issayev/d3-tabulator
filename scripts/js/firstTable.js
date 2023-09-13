// firstTable.js
import { calculateVariancePercentage, progressBarFormatter, formatNumber, buttonHeaderRenderer, customBottomCalc, customNumberSorter, findObjectsByProperty, updateChart } from './helpers/tableHelpers.js';
import { groupedFirstTableResult, groupedSecondTableResult } from '../../main.js';
import { getSecondTable } from './secondTable.js';

/**
 * Функция `getFirstTable` принимает массив данных, группирует их на основе определенных критериев,
 * вычисляет суммы продаж для разных периодов времени, форматирует результат и возвращает его.
 * @param allData - Параметр `allData` представляет собой массив объектов, содержащих данные для таблицы.
 * Каждый объект представляет строку в таблице и содержит различные свойства, такие как
 * `TrnProductClassDescription`, `ArSupplierName`, `SalesAmountCDN`, `TrnYear`, `TrnMonth`.
 * @returns результат в виде массива объектов, представляющих данные первой таблицы.
 */
export function getFirstTable(allData) {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const lastYear = currentYear - 1;

    const groupedData = {};

    allData.forEach(item => {
        const branchName = item.TrnBranchName;
        const classDescription = item.Categories;
        const salespersonName = item.TrnSalespersonName;
        const salesAmount = item.SalesAmountCDN;
        const customerName = item.ArCustomerName;
        const year = item.TrnYear;
        const month = item.TrnMonth;

        const productClassDescription = item.TrnProductClassDescription;
        const branch = item.TrnBranch;
        const series = item.Series;
        const stockcode = item.StockCode;
        const supplierName = item.ArSupplierName;

        if (!groupedData.hasOwnProperty(branchName)) {
            groupedData[branchName] = {};
        }
        const branchGroup = groupedData[branchName];

        if (!branchGroup.hasOwnProperty(classDescription)) {
            branchGroup[classDescription] = {};
        }
        const classGroup = branchGroup[classDescription];

        if (!classGroup.hasOwnProperty(salespersonName)) {
            classGroup[salespersonName] = {
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
                }
            };
        }
        const salespersonGroup = classGroup[salespersonName];

        if (!salespersonGroup.hasOwnProperty(customerName)) {
            salespersonGroup[customerName] = {
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
                }
            };
        }
        const customerGroup = salespersonGroup[customerName];

        // Filter for the current year and month
        if (year === currentYear && month === currentMonth) {
            customerGroup.CurrentYearMonthCalculated.SalesAmountSDN += salesAmount;
        }

        // Filter for the last year and month
        if (year === lastYear && month === currentMonth) {
            customerGroup.LastYearMonthCalculated.SalesAmountSDN += salesAmount;
        }

        // Filter for the year-to-date current year
        if (year === currentYear && month <= currentMonth) {
            customerGroup.YearToDateCurrentYear.SalesAmountSDN += salesAmount;
        }

        // Filter for the year-to-date last year
        if (year === lastYear && month <= currentMonth) {
            customerGroup.YearToDateLastYear.SalesAmountSDN += salesAmount;
        }

        customerGroup.TrnProductClassDescription = productClassDescription;
        customerGroup.TrnBranch = branch;
        customerGroup.Series = series;
        customerGroup.StockCode = stockcode;
        customerGroup.ArSupplierName = supplierName;
        customerGroup.ArCustomerName = customerName;

    });

    //console.log(groupedData);

    const result = Object.entries(groupedData).map(([branchName, branchGroup]) => {
        const classGroups = Object.entries(branchGroup).map(([classDescription, classGroup]) => {
            const salespersonGroups = Object.entries(classGroup).map(([salespersonName, salespersonGroup]) => {
                const customers = Object.entries(salespersonGroup).map(([customerName, customerGroup]) => {
                    const currentYearMonthSales = customerGroup.CurrentYearMonthCalculated?.SalesAmountSDN || 0;
                    const lastYearMonthSales = customerGroup.LastYearMonthCalculated?.SalesAmountSDN || 0;
                    const yearToDateCurrentYearSales = customerGroup.YearToDateCurrentYear?.SalesAmountSDN || 0;
                    const yearToDateLastYearSales = customerGroup.YearToDateLastYear?.SalesAmountSDN || 0;
                    return {
                        TrnBranchName: customerName !== "CurrentYearMonthCalculated" ? customerName : undefined,
                        CurrentYearMonthCalculated: currentYearMonthSales,
                        LastYearMonthCalculated: lastYearMonthSales,
                        YearToDateCurrentYear: yearToDateCurrentYearSales,
                        YearToDateLastYear: yearToDateLastYearSales,
                        TrnProductClassDescription: customerGroup.TrnProductClassDescription,
                        TrnBranch: customerGroup.TrnBranch,
                        Series: customerGroup.Series,
                        StockCode: customerGroup.StockCode,
                        ArSupplierName: customerGroup.ArSupplierName,
                        ArCustomerName: customerGroup.ArCustomerName
                    };
                }).filter(customer => customer.TrnBranchName !== undefined && customer.TrnBranchName !== "LastYearMonthCalculated");

                const salesAmount = customers.reduce((total, customer) => total + customer.CurrentYearMonthCalculated, 0);
                const lastYearSalesAmount = customers.reduce((total, customer) => total + customer.LastYearMonthCalculated, 0);
                const yearToDateCurrentYearSalesAmount = customers.reduce((total, customer) => total + customer.YearToDateCurrentYear, 0);
                const yearToDateLastYearSalesAmount = customers.reduce((total, customer) => total + customer.YearToDateLastYear, 0);

                return {
                    TrnBranchName: salespersonName !== "CurrentYearMonthCalculated" ? salespersonName : undefined,
                    CurrentYearMonthCalculated: salesAmount,
                    LastYearMonthCalculated: lastYearSalesAmount,
                    YearToDateCurrentYear: yearToDateCurrentYearSalesAmount,
                    YearToDateLastYear: yearToDateLastYearSalesAmount,
                    SalesAmountSDN: salesAmount,
                    CurrentYearMonth: `${currentMonth.toString().padStart(2, "0")}.${currentYear}`,
                    _children: customers
                };
            }).filter(salesperson => salesperson.TrnBranchName !== undefined && salesperson.TrnBranchName !== "LastYearMonthCalculated");

            const categorySalesAmount = salespersonGroups.reduce((total, salespersonGroup) => total + salespersonGroup.SalesAmountSDN, 0);
            const categoryLastYearSalesAmount = salespersonGroups.reduce((total, salespersonGroup) => total + salespersonGroup.LastYearMonthCalculated, 0);
            const categoryYearToDateCurrentYearSalesAmount = salespersonGroups.reduce((total, salespersonGroup) => total + salespersonGroup.YearToDateCurrentYear, 0);
            const categoryYearToDateLastYearSalesAmount = salespersonGroups.reduce((total, salespersonGroup) => total + salespersonGroup.YearToDateLastYear, 0);

            return {
                TrnBranchName: classDescription !== "CurrentYearMonthCalculated" ? classDescription : undefined,
                CurrentYearMonthCalculated: categorySalesAmount,
                LastYearMonthCalculated: categoryLastYearSalesAmount,
                YearToDateCurrentYear: categoryYearToDateCurrentYearSalesAmount,
                YearToDateLastYear: categoryYearToDateLastYearSalesAmount,
                SalesAmountSDN: categorySalesAmount,
                CurrentYearMonth: `${currentMonth.toString().padStart(2, "0")}.${currentYear}`,
                _children: salespersonGroups
            };
        }).filter(classGroup => classGroup.TrnBranchName !== undefined && classGroup.TrnBranchName !== "LastYearMonthCalculated");

        const branchSalesAmount = classGroups.reduce((total, classGroup) => total + classGroup.SalesAmountSDN, 0);
        const branchLastYearSalesAmount = classGroups.reduce((total, classGroup) => total + classGroup.LastYearMonthCalculated, 0);
        const branchYearToDateCurrentYearSalesAmount = classGroups.reduce((total, classGroup) => total + classGroup.YearToDateCurrentYear, 0);
        const branchYearToDateLastYearSalesAmount = classGroups.reduce((total, classGroup) => total + classGroup.YearToDateLastYear, 0);

        return {
            TrnBranchName: branchName !== "CurrentYearMonthCalculated" ? branchName : undefined,
            CurrentYearMonthCalculated: branchSalesAmount,
            LastYearMonthCalculated: branchLastYearSalesAmount,
            YearToDateCurrentYear: branchYearToDateCurrentYearSalesAmount,
            YearToDateLastYear: branchYearToDateLastYearSalesAmount,
            SalesAmountSDN: branchSalesAmount,
            CurrentYearMonth: `${currentMonth.toString().padStart(2, "0")}.${currentYear}`,
            _children: classGroups
        };
    }).filter(branch => branch.TrnBranchName !== undefined && branch.TrnBranchName !== "LastYearMonthCalculated");
    // Round and format the values

    //console.log(result);

    const formattedResult = result.map(branch => {
        const branchSalesAmount = Math.round(branch.CurrentYearMonthCalculated);
        const branchLastYearSalesAmount = Math.round(branch.LastYearMonthCalculated);
        const branchYearToDateCurrentYearSalesAmount = Math.round(branch.YearToDateCurrentYear);
        const branchYearToDateLastYearSalesAmount = Math.round(branch.YearToDateLastYear);
        const variance = calculateVariancePercentage(branchLastYearSalesAmount, branchSalesAmount);
        const yearToDateVariance = calculateVariancePercentage(branchYearToDateLastYearSalesAmount, branchYearToDateCurrentYearSalesAmount);

        const formattedClassGroups = branch._children.map(classGroup => {
            const salesAmount = Math.round(classGroup.CurrentYearMonthCalculated);
            const lastYearSalesAmount = Math.round(classGroup.LastYearMonthCalculated);
            const yearToDateCurrentYearSalesAmount = Math.round(classGroup.YearToDateCurrentYear);
            const yearToDateLastYearSalesAmount = Math.round(classGroup.YearToDateLastYear);
            const categoryVariance = calculateVariancePercentage(lastYearSalesAmount, salesAmount);
            const categoryYearToDateVariance = calculateVariancePercentage(yearToDateLastYearSalesAmount, yearToDateCurrentYearSalesAmount);

            const formattedSalespersonGroups = classGroup._children.map(salespersonGroup => {
                const currentYearMonthSales = Math.round(salespersonGroup.CurrentYearMonthCalculated);
                const lastYearMonthSales = Math.round(salespersonGroup.LastYearMonthCalculated);
                const yearToDateCurrentYearSales = Math.round(salespersonGroup.YearToDateCurrentYear);
                const yearToDateLastYearSales = Math.round(salespersonGroup.YearToDateLastYear);
                const salesVariance = calculateVariancePercentage(lastYearMonthSales, currentYearMonthSales);
                const yearToDateSalesVariance = calculateVariancePercentage(yearToDateLastYearSales, yearToDateCurrentYearSales);

                const formattedCustomers = salespersonGroup._children.map(customer => {
                    const currentYearMonthSales = Math.round(customer.CurrentYearMonthCalculated);
                    const lastYearMonthSales = Math.round(customer.LastYearMonthCalculated);
                    const yearToDateCurrentYearSales = Math.round(customer.YearToDateCurrentYear);
                    const yearToDateLastYearSales = Math.round(customer.YearToDateLastYear);
                    const customerVariance = calculateVariancePercentage(lastYearMonthSales, currentYearMonthSales);
                    const customerYearToDateVariance = calculateVariancePercentage(yearToDateLastYearSales, yearToDateCurrentYearSales);
                    return {
                        ...customer,
                        CurrentYearMonthCalculated: formatNumber(currentYearMonthSales),
                        LastYearMonthCalculated: formatNumber(lastYearMonthSales),
                        YearToDateCurrentYear: formatNumber(yearToDateCurrentYearSales),
                        YearToDateLastYear: formatNumber(yearToDateLastYearSales),
                        Variance: customerVariance,
                        YearToDateVariance: customerYearToDateVariance,
                        level: '4'
                    };
                });

                return {
                    ...salespersonGroup,
                    CurrentYearMonthCalculated: formatNumber(currentYearMonthSales),
                    LastYearMonthCalculated: formatNumber(lastYearMonthSales),
                    YearToDateCurrentYear: formatNumber(yearToDateCurrentYearSales),
                    YearToDateLastYear: formatNumber(yearToDateLastYearSales),
                    Variance: salesVariance,
                    YearToDateVariance: yearToDateSalesVariance,
                    level: '3',
                    _children: formattedCustomers
                };
            });

            return {
                ...classGroup,
                CurrentYearMonthCalculated: formatNumber(salesAmount),
                LastYearMonthCalculated: formatNumber(lastYearSalesAmount),
                YearToDateCurrentYear: formatNumber(yearToDateCurrentYearSalesAmount),
                YearToDateLastYear: formatNumber(yearToDateLastYearSalesAmount),
                Variance: categoryVariance,
                YearToDateVariance: categoryYearToDateVariance,
                level: '2',
                _children: formattedSalespersonGroups
            };
        });

        return {
            ...branch,
            CurrentYearMonthCalculated: formatNumber(branchSalesAmount),
            LastYearMonthCalculated: formatNumber(branchLastYearSalesAmount),
            YearToDateCurrentYear: formatNumber(branchYearToDateCurrentYearSalesAmount),
            YearToDateLastYear: formatNumber(branchYearToDateLastYearSalesAmount),
            Variance: variance,
            YearToDateVariance: yearToDateVariance,
            level: '1',
            _children: formattedClassGroups
        };
    });

    // console.log(result);
    // console.log(formattedResult);

    const filteredResult = formattedResult.map(branch => {
        const filteredClassGroups = branch._children.filter(classGroup => {
            const filteredSalesPersonGroup = classGroup._children.filter(salespersonGroup => {
                const filteredCustomers = salespersonGroup._children.filter(customerGroup => {
                    return (
                        customerGroup.CurrentYearMonthCalculated !== "0 K" ||
                        customerGroup.LastYearMonthCalculated !== "0 K" ||
                        customerGroup.Variance !== "0%" ||
                        customerGroup.YearToDateCurrentYear !== "0 K" ||
                        customerGroup.YearToDateLastYear !== "0 K" ||
                        customerGroup.YearToDateVariance !== "0%"
                    );
                });
                salespersonGroup._children = filteredCustomers;
                return filteredCustomers.length > 0;
            });
            classGroup._children = filteredSalesPersonGroup;
            return filteredSalesPersonGroup.length > 0;
        });

        return {
            ...branch,
            _children: filteredClassGroups
        };
    }).filter(branch => branch._children.length > 0);

    //console.log(filteredResult[0]);

    var table = new Tabulator("#example-table", {
        height: "300",
        layout: "fitDataFill",
        data: filteredResult,
        dataTree: true,
        dataTreeStartExpanded: false,
        reactiveData: true,
        sortable: true,
        virtualDomBuffer: 100,
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
                    branchName: "TrnBranchName",
                }, field: "TrnBranchName", responsive: 2, bottomCalc: customBottomCalc, bottomCalcParams: { label: 1 }, headerSort: false
            }, //never hide this column
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
        //console.log(rowData)
        if (rowData.level == '1') {
            let filterByClickFirstTable = findObjectsByProperty(groupedFirstTableResult, 'TrnBranchName', rowData.TrnBranchName);
            updateChart(filterByClickFirstTable);
        }
    });

    return filteredResult;

}