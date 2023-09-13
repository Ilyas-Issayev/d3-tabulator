// ui.js

// Импортируем функцию setDatePicker из модуля ui.js
//import { setDatePicker } from '../ui.js';

/**
 * Функция подготавливает данные для выпадающего списка Select2 с пагинацией.
 * @param items - Массив элементов, который будет использоваться для фильтрации и пагинации.
 * @param params - Параметр `params` представляет собой объект, который содержит различные свойства, используемые для
 * пагинации и фильтрации. Обычно он включает следующие свойства:
 * @returns объект с двумя свойствами: "results" и "pagination". Свойство "results" содержит
 * подмассив элементов "items" на основе текущей страницы и размера страницы, указанных в объекте "params".
 * Свойство "pagination" представляет собой объект с свойством "more", которое указывает, есть ли еще результаты
 * за пределами текущей страницы.
 */
function prepareDataForSelect2WithPagination(items, params) {
    const results = params.term && params.term !== ''
        ? items.filter(e => e.text.toUpperCase().includes(params.term.toUpperCase()))
        : items;

    const data = {
        results: results.slice((params.page - 1) * pageSize, params.page * pageSize),
        pagination: {
            more: params.page * pageSize < results.length
        }
    };

    return data;
}

/**
 * Функция `initializeSelect2` инициализирует выпадающий список Select2 с пользовательскими данными и пагинацией.
 * @param items - Массив объектов, представляющих варианты для выпадающего списка Select2. Каждый объект
 * должен иметь два свойства: "id" и "text". Свойство "id" представляет уникальный идентификатор для
 * варианта, а свойство "text" представляет текст для отображения варианта.
 * @param elementId - Параметр `elementId` представляет собой идентификатор HTML-элемента, в котором вы хотите
 * инициализировать плагин Select2. Этот элемент должен быть элементом `<select>`.
 * @returns Функция не содержит оператора return, поэтому она не возвращает никакого значения.
 */
export function initializeSelect2(items, elementId) {

    let pageSize = 50

    items.unshift({ id: 'all', text: 'ALL' });

    jQuery.fn.select2.amd.require(["select2/data/array", "select2/utils"],

        function (ArrayData, Utils) {
            function CustomData($element, options) {
                CustomData.__super__.constructor.call(this, $element, options);
            }
            Utils.Extend(CustomData, ArrayData);

            CustomData.prototype.query = function (params, callback) {

                let results = [];
                if (params.term && params.term !== '') {
                    results = _.filter(items, function (e) {
                        return e.text.toUpperCase().indexOf(params.term.toUpperCase()) >= 0;
                    });
                } else {
                    results = items;
                }

                if (!("page" in params)) {
                    params.page = 1;
                }
                var data = {};
                data.results = results.slice((params.page - 1) * pageSize, params.page * pageSize);
                data.pagination = {};
                data.pagination.more = params.page * pageSize < results.length;
                callback(data);
            };

            $('#' + elementId).select2({
                ajax: {},
                dataAdapter: CustomData
            });
        })
}

/**
 * Функция "showProgressBar" отображает полосу прогресса, устанавливая её ширину на 100% и делая её видимой.
 */
export function showProgressBar() {
    const progressBar = document.getElementById('progress');
    const progressBarDiv = document.getElementById('progress-bar');
    progressBar.style.width = '100%';
    progressBarDiv.style.display = 'block';
}

/**
 * Функция скрывает полосу прогресса и оверлей на веб-странице.
 */
export function hideProgressBar() {
    const progressBarDiv = document.getElementById('progress-bar');
    document.querySelector('.overlay').style.display = 'none';
    progressBarDiv.style.display = 'none';
}
