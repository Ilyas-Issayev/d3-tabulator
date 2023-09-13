//main.js
import { showProgressBar, hideProgressBar } from './scripts/js/ui.js';
import { fetchAndParseCSV, removeDuplicates } from './scripts/js/csvParser.js';
import { groupDataByFirstTable, groupDataBySecondTable, groupDataByThirdTable, getUniqueValuesForFilter } from './scripts/js/dataProcessor.js';
import { initializeSelect2 } from './scripts/js/ui.js';
import { initializeDateRangePicker, updateDateRange } from './scripts/js/helpers/dateHelper.js';
import { getFirstTable } from './scripts/js/firstTable.js';
import { getSecondTable } from './scripts/js/secondTable.js';
import { getFirstTableDashboard } from './scripts/js/dashboard.js';
import { parseReviver } from './scripts/js/helpers/tableHelpers.js';

const csvURL = '/mainData.csv';

const progressBar = document.getElementById('progress');

showProgressBar();

let startDate = moment().subtract(29, 'days');
let endDate = moment();

console.log('14.08 15:00');

export let groupedFirstTableResult;
export let groupedSecondTableResult;
export let globalDataResult;
let groupedThirdTableResult;
let firstTableResult;
let secondTableResult;
let firstTableResultDashBoard;

initializeDateRangePicker();
$('#reportrange span').html('ALL');

//updateDateRange(startDate, endDate);

fetchAndParseCSV(csvURL, progressBar)
    .then(parsedData => {

        console.log(parsedData);

        globalDataResult = removeDuplicates(parsedData);

        globalDataResult = JSON.parse(JSON.stringify(parsedData), parseReviver);

        groupedFirstTableResult = groupDataByFirstTable(globalDataResult);
        groupedSecondTableResult = groupDataBySecondTable(globalDataResult);
        groupedThirdTableResult = groupDataByThirdTable(globalDataResult);

        // Получаем уникальные значения для фильтров
        let uniqueTrnBranchName = getUniqueValuesForFilter(groupedFirstTableResult, 'TrnBranchName');
        let uniqueTrnProductClassDescription = getUniqueValuesForFilter(groupedFirstTableResult, 'TrnProductClassDescription');
        let uniqueArSupplierName = getUniqueValuesForFilter(groupedFirstTableResult, 'ArSupplierName');
        let uniqueSeries = getUniqueValuesForFilter(groupedFirstTableResult, 'Series');
        let uniqueStockCode = getUniqueValuesForFilter(groupedFirstTableResult, 'StockCode');
        let uniqueArCustomerName = getUniqueValuesForFilter(groupedFirstTableResult, 'ArCustomerName');

        // Инициализируем Select2 с пагинацией для всех фильтров
        initializeSelect2(uniqueTrnBranchName, 'BranchSalesRep');
        initializeSelect2(uniqueTrnProductClassDescription, 'productClass');
        initializeSelect2(uniqueArSupplierName, 'Supplier');
        initializeSelect2(uniqueSeries, 'productCollection');
        initializeSelect2(uniqueStockCode, 'StockCode');
        initializeSelect2(uniqueArCustomerName, 'Customer');

        firstTableResult = getFirstTable(groupedFirstTableResult);
        secondTableResult = getSecondTable(groupedSecondTableResult);

        firstTableResultDashBoard = getFirstTableDashboard(groupedFirstTableResult);

        hideProgressBar();
    })
    .catch(error => {
        console.error(error);
    });


