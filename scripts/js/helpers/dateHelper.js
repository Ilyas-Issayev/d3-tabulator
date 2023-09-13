// dateHelpers.js
// Описание: Этот файл содержит функции, связанные с обработкой дат.

// Импортируем функцию setDatePicker из модуля ui.js
import { groupedFirstTableResult, groupedSecondTableResult } from '../../../main.js';
import { getFirstTable } from '../firstTable.js';
import { getSecondTable } from '../secondTable.js';
import { getThirdTable } from '../thirdTable.js';

export function initializeDateRangePicker() {
    $('#reportrange').daterangepicker({
        ranges: {
            'Today': [moment(), moment()],
            'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
            'Last 7 Days': [moment().subtract(6, 'days'), moment()],
            'Last 30 Days': [moment().subtract(29, 'days'), moment()],
            'This Month': [moment().startOf('month'), moment().endOf('month')],
            'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        },
        "alwaysShowCalendars": true,
        "startDate": "06/06/2023",
        "endDate": "06/12/2023"
    }, function (start, end, label) {
        updateDateRange(start, end);
        onDateChange(start, end);

        console.log(start.format('YYYY-M-D').split('-')[0] + ' ' + start.format('YYYY-M-D').split('-')[1] + ' || ' + end.format('YYYY-M-D').split('-')[0] + ' ' + end.format('YYYY-M-D').split('-')[1]);
    });
}

export function updateDateRange(start, end) {
    $('#reportrange span').html(start.format('MMMM DD, YYYY') + ' - ' + end.format('MMMM DD, YYYY'));
}

function onDateChange(start, end) {
    // Фильтруем данные первой таблицы по выбранному диапазону дат
    let startYearFormatted = start.format('YYYY-M-D').split('-')[0];
    let startMonthFormatted = start.format('YYYY-M-D').split('-')[1];
    let endYearFormatted = end.format('YYYY-M-D').split('-')[0];
    let endMonthFormatted = end.format('YYYY-M-D').split('-')[1];

    let filteredDataFirstTable = groupedFirstTableResult.filter(obj => {
        const trnYear = obj.TrnYear;
        const trnMonth = obj.TrnMonth;

        return ((trnYear > startYearFormatted || (trnYear == startYearFormatted && trnMonth >= startMonthFormatted)) && (trnYear < endYearFormatted || (trnYear == endYearFormatted && trnMonth <= endMonthFormatted)));
    });

    getFirstTable(filteredDataFirstTable);

    // Фильтруем данные второй таблицы по выбранному диапазону дат
    let filteredDataSecondTable = groupedSecondTableResult.filter(obj => {
        const trnYear = obj.TrnYear;
        const trnMonth = obj.TrnMonth;

        return ((trnYear > startYearFormatted || (trnYear == startYearFormatted && trnMonth >= startMonthFormatted)) && (trnYear < endYearFormatted || (trnYear == endYearFormatted && trnMonth <= endMonthFormatted)));
    });

    getSecondTable(filteredDataSecondTable);
}
