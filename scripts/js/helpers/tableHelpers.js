//tableHelpers.js
// Описание: Этот файл содержит различные вспомогательные функции для работы с таблицами.

import { getFirstTableDashboard } from "../dashboard.js";
import { getFirstTable } from '../firstTable.js';
import { getSecondTable } from '../secondTable.js';
import { getThirdTable } from '../thirdTable.js';
import { groupedFirstTableResult, groupedSecondTableResult, globalDataResult } from '../../../main.js';
import { groupDataByThirdTable } from '../dataProcessor.js';
let criteria = [];

/**
 * Вычисляет процентное изменение между двумя значениями.
 *
 * @param {number} lastYearValue - Значение за прошлый год.
 * @param {number} currentValue - Текущее значение.
 * @returns {string} Строка, представляющая процентное изменение.
 */
export function calculateVariancePercentage(lastYearValue, currentValue) {
    if (lastYearValue === 0 && currentValue > 0) {
        return "+100%";
    } else if (lastYearValue === 0 && currentValue < 0) {
        return "-100%";
    } else if (lastYearValue === 0 && currentValue === 0) {
        return "0%";
    } else {
        const variance = currentValue - lastYearValue;
        const percentage = (variance / lastYearValue) * 100;
        //console.log(percentage.toFixed(2));
        if(percentage.toFixed(2) > 100) {
            return "100%";
        } else if (percentage.toFixed(2) < -100){
            return "-100%";
        } else {
            return percentage.toFixed(2) + "%";
        }
    }
}

/**
 * Форматирует число для отображения в укороченном виде с меткой (K - тысячи, m - миллионы).
 *
 * @param {number} number - Число для форматирования.
 * @returns {string} Отформатированная строка с меткой.
 */
export function formatNumber(number) {
    let a = `${(number / 1000).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 })} K`;
    return a;
}

/**
 * Возвращает HTML-код для отображения прогресс-бара в ячейке таблицы.
 *
 * @param {Tabulator.CellComponent} cell - Компонент ячейки таблицы.
 * @param {object} formatterParams - Параметры форматирования.
 * @param {function} onRendered - Функция обратного вызова для рендеринга.
 * @returns {string} HTML-код для прогресс-бара.
 */
export function progressBarFormatter(cell, formatterParams, onRendered) {
    let value = cell.getValue();
    let max = formatterParams.max || 100;

    let percentage = (parseFloat(value) / max) * 100;
    percentage = Math.min(Math.max(percentage, 0), 100);

    //let progressBar = '<div class="progress-bar"><div class="progress-bar-inner" style="width:' + percentage + '%"></div></div>';
    let valueText = '<div class="progress-value">' + value + '</div>';

    let style = '';

    if (Number(value.split('.')[0]) > 0) {
        style = 'position: absolute; top: 7px; right: 55px; width: 15px; height: 15px; fill: green;';
    } else {
        style = 'position: absolute; top: 7px; right: 55px; width: 15px; height: 15px; fill: red; transform: rotate(180deg);';
    }

    let arrow = `<svg style="${style}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M3 19h18a1.002 1.002 0 0 0 .823-1.569l-9-13c-.373-.539-1.271-.539-1.645 0l-9 13A.999.999 0 0 0 3 19z"></path></g></svg>`;

    let output = arrow + valueText;

    return output;
}

/**
 * Возвращает HTML-код для заголовка таблицы с кнопкой "Назад".
 *
 * @param {Tabulator.CellComponent} cell - Компонент ячейки таблицы.
 * @param {object} formatterParams - Параметры форматирования.
 * @param {function} onRendered - Функция обратного вызова для рендеринга.
 * @returns {string} HTML-код для заголовка таблицы с кнопкой "Назад".
 */
export function buttonHeaderRenderer(cell, formatterParams, onRendered) {
    const branchName = formatterParams.branchName;
    return `<div style="display: flex; padding-left: 18px"><button class='btn' onclick="testFunc('${branchName}')" style="background-color: transparent; border: 0; margin-right: 8px; position: absolute; top: -9px; left: -15px;"><img src="./img/back.svg" style="filter: invert(1);"></button> ${branchName}</div>`;
}

function testFunc(branch) {
    if (branch == 'TrnBranchName') {
        filterFirstTable('', '')
    } else if (branch == 'TrnProductClassDescription') {
        filterFirstTable('', '')
    }
}

window.testFunc = testFunc;


/**
 * Возвращает текст для пользовательского итогового значения внизу столбца таблицы.
 *
 * @param {array} values - Массив значений столбца.
 * @param {array} data - Массив объектов данных таблицы.
 * @param {object} calcParams - Параметры для вычисления.
 * @returns {string} Текст итогового значения.
 */
export function customBottomCalc(values, data, calcParams) {
    let calc = 0;
    let number;

    if (calcParams.label == '1') {
        return 'Total';
    }

    if (values.length === 0) {
        return calc;
    }

    values.forEach(function (value) {
        if (value.indexOf('%') == '-1') {
            number = parseFloat(value.replace(/\s/g, '').replace(',', '.')) * 1000;
        } else {
            number = parseFloat(value);
        }

        calc = Number(calc) + Number(number);
    });

    if (values[0].indexOf('%') == '-1') {
        return (calc / 1000) + 'K';
    } else {
        return Math.round(calc) + '%';
    }
}

/**
 * Компаратор для сортировки числовых значений в таблице.
 *
 * @param {string|number} a - Значение A для сравнения.
 * @param {string|number} b - Значение B для сравнения.
 * @param {Tabulator.RowComponent} aRow - Компонент строки A.
 * @param {Tabulator.RowComponent} bRow - Компонент строки B.
 * @param {Tabulator.ColumnComponent} column - Компонент столбца.
 * @param {string} dir - Направление сортировки (asc или desc).
 * @param {object} sorterParams - Параметры для сортировки.
 * @returns {number} Результат сравнения для сортировки.
 */
export function customNumberSorter(a, b, aRow, bRow, column, dir, sorterParams) {

    let convertToNumber = function (value) {
        let number = removeDecimalsAndChars(value);
        if (value.indexOf("K") !== -1) {
            number *= 1000;
        }
        return number;
    };

    let numA = convertToNumber(a);
    let numB = convertToNumber(b);

    return numA - numB;
}

/**
 * Удаляет буквы и пробелы из строки и заменяет запятые на точки в числовых значениях.
 *
 * @param {string} str - Исходная строка.
 * @returns {string} Преобразованная строка.
 */
function removeDecimalsAndChars(str) {
    str = str.replace(/[a-zA-Z]/g, "").replace(/\s/g, "");

    if (str.length <= 4) {
        let result = str.replace(',', '.');
        return result;
    } else if (str.indexOf(',') === 1 || str.indexOf(',') === 2) {
        let result = str.replace(',', '');
        return result;
    } else {
        let result = str.replace(/\s/g, "").replace(',', '.');
        return result;
    }
}

/**
 * Форматирует числовое значение для отображения сокращенной формы.
 *
 * @param {number} value - Числовое значение для форматирования.
 * @returns {string} Отформатированное значение.
 */
export function formatValue(value) {
    const million = 1000000;
    const thousands = 1000;
    if (value >= million) {
        const shortenedValue = (value / million).toFixed(1);
        return `${shortenedValue} m`;
    } else if (value >= thousands) {
        const shortenedValue = (value / thousands).toFixed(1);
        return `${shortenedValue} k`;
    } else {
        return value.toFixed(2);
    }
}

/**
 * Находит объекты в массиве, у которых свойство key имеет значение value.
 *
 * @param {array} arr - Массив объектов.
 * @param {string} key - Свойство объекта для сравнения.
 * @param {any} value - Значение свойства для поиска.
 * @returns {array} Массив объектов, удовлетворяющих условию.
 */
export function findObjectsByProperty(arr, key, value) {
    return arr.filter(obj => obj[key] === value);
}

/**
 * Обновляет диаграмму на основе новых данных.
 *
 * @param {array} allData - Общий массив данных.
 */
export function updateChart(allData) {

    d3.select("#dashboard").selectAll("svg").remove();
    d3.select("#dashboard").selectAll(".tooltip").remove();

    getFirstTableDashboard(allData);
}

/**
 * Фильтрует таблицу и обновляет результаты на основе выбранных параметров.
 *
 * @param {HTMLSelectElement} selectElement - Выбранный элемент выпадающего списка.
 * @param {string} field - Поле для фильтрации.
 */
function filterFirstTable(selectElement, field) {
    var selectedOption = selectElement.value;

    console.log(selectedOption);
    console.log(field);

    let resultFirstTable;
    let resultSecondTable;
    let resultThirdTable;

    document.querySelectorAll('select').forEach(element => {
        if (element.value !== '') {
            if (element.value === 'all') {
                criteria = criteria.filter(item => item.key !== field);
                console.log(criteria);
            } else {
                let index = criteria.findIndex(item => item.key === field);
                if (index !== -1) {
                    criteria[index].value = element.value;
                } else {
                    let exists = criteria.some(item => item.value === element.value);
                    if (!exists) {
                        criteria.push({ "key": field, "value": element.value });
                    }
                }
            }
        } else {
            console.log('empty');
        }
    });


    if (criteria.length == 0 && $('#reportrange span').html() == 'ALL') {
        getFirstTable(groupedFirstTableResult);
        getSecondTable(groupedSecondTableResult);
        getThirdTable([{}]);
        updateChart(groupedFirstTableResult);
    } else if ($('#reportrange span').html() !== 'ALL') {
        console.log('range picker not empty');
        let rangePickerDate = $('#reportrange span').html();
        let [startDateString, endDateString] = rangePickerDate.split(" - ");
        let startDateObj = new Date(startDateString);
        let endDateObj = new Date(endDateString);

        let startYear = startDateObj.getFullYear();
        let startMonth = startDateObj.getMonth() + 1;
        let endYear = endDateObj.getFullYear();
        let endMonth = endDateObj.getMonth() + 1;

        let arrayByDateRangeFirstTable = rangeFiltering(startYear, startMonth, endYear, endMonth, groupedFirstTableResult);
        let arrayByDateRangeSecondTable = rangeFiltering(startYear, startMonth, endYear, endMonth, groupedSecondTableResult);

        if (criteria.length !== 0) {
            console.log('range picker not empty and filters has data');
            let targetElementFirstTable = findObjectsByPropertyArray(arrayByDateRangeFirstTable, criteria);
            let targetElementSecondTable = findObjectsByPropertyArray(arrayByDateRangeSecondTable, criteria);
            let targetElementThirdTable = findObjectsByPropertyArray(globalDataResult, criteria);

            let grouping = groupDataByThirdTable(targetElementThirdTable);

            resultFirstTable = getFirstTable(targetElementFirstTable);
            resultSecondTable = getSecondTable(targetElementSecondTable);
            resultThirdTable = getThirdTable(grouping);
            updateChart(targetElementFirstTable);
        } else {
            console.log('range picker not empty and filters empty');
            let targetElementThirdTable = findObjectsByPropertyArray(globalDataResult, criteria);

            let grouping = groupDataByThirdTable(targetElementThirdTable);

            resultFirstTable = getFirstTable(arrayByDateRangeFirstTable);
            resultSecondTable = getSecondTable(arrayByDateRangeSecondTable);
            resultThirdTable = getThirdTable(grouping);
            updateChart(arrayByDateRangeFirstTable);
        }
    } else {
        console.log('range picker with filters empty');
        const targetElementFirstTable = findObjectsByPropertyArray(groupedFirstTableResult, criteria);
        const targetElementSecondTable = findObjectsByPropertyArray(groupedSecondTableResult, criteria);
        const targetElementThirdTable = findObjectsByPropertyArray(globalDataResult, criteria);

        let grouping = groupDataByThirdTable(targetElementThirdTable);

        resultFirstTable = getFirstTable(targetElementFirstTable);
        resultSecondTable = getSecondTable(targetElementSecondTable);
        resultThirdTable = getThirdTable(grouping);
        updateChart(targetElementFirstTable);
    }
}

window.filterFirstTable = filterFirstTable;

/**
 * Находит объекты в массиве, у которых свойства соответствуют заданным критериям.
 *
 * @param {array} arr - Массив объектов для поиска.
 * @param {array} criteria - Массив объектов-критериев.
 * @returns {array} Массив объектов, удовлетворяющих критериям.
 */
function findObjectsByPropertyArray(arr, criteria) {
    return arr.filter(obj => {
        return criteria.every(criterion => obj[criterion.key] === criterion.value);
    });
}


/**
 * Пользовательский обработчик разбора JSON для удаления кавычек из значений.
 *
 * @param {string} key - Ключ свойства объекта.
 * @param {any} value - Значение свойства объекта.
 * @returns {any} Обработанное значение свойства объекта.
 */
export function parseReviver(key, value) {
    if (typeof value === 'string') {
        return value.replace(/"/g, '');
    }
    return value;
}

/**
 * The `rangeFiltering` function filters an array of objects based on a range of start and end years
 * and months.
 * @param startYearFormatted - The start year in the desired format (e.g. "2022").
 * @param startMonthFormatted - The startMonthFormatted parameter is the formatted value of the start
 * month. It represents the month from which the filtering should start.
 * @param endYearFormatted - The end year in the desired range of filtering, formatted as a string.
 * @param endMonthFormatted - The `endMonthFormatted` parameter is the formatted value of the end month
 * for filtering. It is used to filter the data based on the transaction year and month.
 * @param array - The `array` parameter is an array of objects. Each object in the array represents a
 * data entry and has properties such as `TrnYear` and `TrnMonth`.
 * @returns the filteredDataSecondTable, which is an array containing the objects from the input array
 * that meet the specified filtering criteria.
 */
export function rangeFiltering(startYearFormatted, startMonthFormatted, endYearFormatted, endMonthFormatted, array) {
    let filteredDataSecondTable = array.filter(obj => {
        const trnYear = obj.TrnYear;
        const trnMonth = obj.TrnMonth;

        return ((trnYear > startYearFormatted || (trnYear == startYearFormatted && trnMonth >= startMonthFormatted)) && (trnYear < endYearFormatted || (trnYear == endYearFormatted && trnMonth <= endMonthFormatted)));
    });

    return filteredDataSecondTable;
}


/**
 * The function `removeFilters` removes filters from tables and charts, resets select elements, and
 * reassigns filter functionality to select elements.
 */
function removeFilters() {
    getFirstTable(groupedFirstTableResult);
    getSecondTable(groupedSecondTableResult);
    getThirdTable([{}]);
    updateChart(groupedFirstTableResult);

    document.querySelectorAll('select').forEach(element => {
        element.onchange = null;

        $(element).val('').trigger('change.select2');

        setTimeout(function () {
            element.onchange = function () {
                filterFirstTable(element, element.getAttribute('filterField'));
            };
        }, 100);
    })

    $('#reportrange span').html('ALL');
}

window.removeFilters = removeFilters;