import { fetchAndParseCSV, removeDuplicates } from '../../../scripts/js/csvParser.js';
import { showProgressBar, hideProgressBar, initializeSelect2 } from '../../../scripts/js/ui.js';
import { getUniqueValuesForFilter } from '../../../scripts/js/dataProcessor.js';

let jsonData;
let salesData;
let globalDataResult;
let groupedData;
let coordinates;
let markerCluster;
let finalData;
let notes;

console.log('235')

// Инициализация карты
const map = L.map('map').setView([44.00587258461839, -79.41410348456446], 10);
L.tileLayer('https://tile.jawg.io/2c7866ba-a6e7-4b5b-a9f8-1848e3e43e7a/{z}/{x}/{y}{r}.png?access-token=mGBBbxIqFpeymODW0wTKIyolUm6CM5yJntMUJtkHaqywY1dcR44qETlbJpZE4pmz', {}).addTo(map);

function customClusterIcon(cluster) {
    const clusterSize = cluster.getChildCount();

    return L.divIcon({
        html: `<div>${clusterSize}</div>`,
        className: 'custom-cluster-icon',
        iconSize: [40, 40],
    });
}

function drawPinsAndClusters(data) {
    if (markerCluster) {
        markerCluster.clearLayers();
    }

    const markers = [];

    data.forEach(d => {
        const customIcon = L.icon({
            iconUrl: 'logoSvg.svg',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32],
        });

        let popupContent = `
            <strong id="popUpStoreName" storeName="${d.ArCustomerName}" note="${d.note}">${d.ArCustomerName.toUpperCase()}</strong><br>
            <strong>Last fiscal year:</strong> $${Math.floor(d.LFY_SUMMARY).toLocaleString('en-US')}<br>
            <strong>Last month:</strong> $${Math.floor(d.LM_SUMMARY).toLocaleString('en-US')}<br>
            <strong>Last 12 months:</strong> $${Math.floor(d.LY_SUMMARY).toLocaleString('en-US')}<br>
            <strong>This fiscal year:</strong> $${Math.floor(d.TFY_SUMMARY).toLocaleString('en-US')}<br>
            
            <button id="expandButton" class="expand">Expand</button>`;

        const marker = L.marker([d.latitude, d.longitude], { icon: customIcon })
            .bindPopup(popupContent);

        markers.push(marker);
    });

    markerCluster = L.markerClusterGroup({
        iconCreateFunction: customClusterIcon,
    });

    markerCluster.addLayers(markers);
    map.addLayer(markerCluster);

    map.on('popupopen', function (e) {
        const popup = e.popup;

        let storeName = popup._contentNode.querySelector('#popUpStoreName').getAttribute('storeName');
        let notesData = popup._contentNode.querySelector('#popUpStoreName').getAttribute('note');

        console.log(notesData.split(','));

        const expandButton = popup._contentNode.querySelector('#expandButton');
        
        const noteArea = document.querySelector('#notesPopUp');
        const closePopUp = document.querySelector('#closeNotePopUp');
        const cancelPopUp = document.querySelector('#cancelNoteBtn');

        closePopUp.addEventListener('click', function(){
            noteArea.style.display = 'none';
        });

        cancelPopUp.addEventListener('click', function(){
            noteArea.style.display = 'none';
        });

        expandButton.addEventListener('click', function () {
            noteArea.style.display = 'block';
        });

        const saveNoteButton = document.querySelector('#addNoteBtn');
        const noteText = document.querySelector('#noteArea');

        saveNoteButton.addEventListener('click', function () {
            const note = noteText.value;
            console.log(note + ' ' + storeName);
            saveNotes(storeName, note);
            //alert('Note saved: ' + note);
        });
    });
}





function saveNotes(storeName, noteValue) {
    let formData = new FormData();
    formData.append('storeName', storeName);
    formData.append('note', noteValue);

    fetch('/analytics/newAnalytic/map/scripts/php/saveNote.php', {
        method: 'POST',
        body: formData
    })
        .then(response => response.text())
        .then(data => {
            console.log(data);
        })
        .catch(error => {
            console.error('Ошибка:', error);
        });
}


function filterBySummarySales(selectedCheckboxes) {
    if (selectedCheckboxes.length === 0) {
        return finalData;
    }

    return finalData.filter(obj => {
        let numericValue = parseInt(obj.LY_SUMMARY);
        return selectedCheckboxes.some(range => {
            if (range == 'Over 100k') {
                return numericValue > 100000;
            } else if (range == 'Less than 25k') {
                return numericValue < 25000;
            } else {
                let [minStr, maxStr] = range.split('-');
                let min = parseInt(minStr) * 1000;
                let max = parseInt(maxStr) * 1000;

                return numericValue >= min && numericValue <= max;
            }
        });
    });
}

function filterBySalesPerson(selectedValues, filteredBySummarySales) {
    if (selectedValues.length === 0) {
        return filteredBySummarySales;
    }

    return filteredBySummarySales.filter(item => selectedValues.includes(item.ArSalesperson));
}

function filterByCustomerName(selectedCustomerNames, filteredBySalesPerson) {
    if (selectedCustomerNames.length === 0) {
        return filteredBySalesPerson;
    }

    return filteredBySalesPerson.filter(item => selectedCustomerNames.includes(item.ArCustomerName));
}

function filterData() {
    const selectedValues = Array.from(document.querySelectorAll('.salesPersonFilter option:checked')).map(option => option.value);
    const selectedCheckboxes = Array.from(document.querySelectorAll('.checkbox:checked')).map(checkbox => checkbox.value);
    const selectedCustomerNames = Array.from(document.querySelectorAll('.customerNameFilter option:checked')).map(option => option.value);

    let filteredBySummarySales = filterBySummarySales(selectedCheckboxes);
    let filteredBySalesPerson = filterBySalesPerson(selectedValues, filteredBySummarySales);
    let filteredByCustomerName = filterByCustomerName(selectedCustomerNames, filteredBySalesPerson);

    // Очистка кластеров и маркеров с карты
    map.eachLayer(layer => {
        if (layer instanceof L.MarkerCluster || layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    if (markerCluster) {
        markerCluster.clearLayers(); // Очистка старых кластеров перед отрисовкой новых
    }

    // Отрисовка кластеров и маркеров с новыми данными
    drawPinsAndClusters(filteredByCustomerName);
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

const progressBar = document.getElementById('progress');
const csvURL = '/analytics/newAnalytic/mainData.csv';

showProgressBar();

function getCoordinates() {
    return fetch('../scripts/php/gettingCoordinates.php')
        .then(function (response) {
            if (!response.ok) {
                console.error('Network response error:', response);
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(function (data) {
            jsonData = JSON.parse(data);
            let coordinates = jsonData.filter(val => val.latitude !== '' && val.longtitude !== '');
            return coordinates;
        })
        .catch(error => {
            console.error('Fetch error:', error);
            throw error;
        });
}

function getNotes() {
    return fetch('./scripts/php/getNotes.php')
        .then(function (response) {
            if (!response.ok) {
                console.error('Network response error:', response);
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(function (data) {
            jsonData = JSON.parse(data);
            return jsonData;
        })
        .catch(error => {
            console.error('Fetch error:', error);
            throw error;
        });
}

const csvDataPromise = fetchAndParseCSV(csvURL, progressBar)
    .then(parsedData => {

        //console.log(parsedData);

        globalDataResult = removeDuplicates(parsedData);
        globalDataResult = JSON.parse(JSON.stringify(parsedData), parseReviver);

        groupedData = [];

        globalDataResult.forEach((row) => {
            const arSalesperson = row['ArSalesperson'];

            if (arSalesperson === 'HSE') {
                return;
            }

            const arCustomerName = row['ArCustomerName'];
            const existingEntry = groupedData.find(entry => entry.ArCustomerName === arCustomerName);

            if (!existingEntry) {
                const newEntry = {
                    ArCustomerName: arCustomerName,
                    ArSalesperson: arSalesperson,
                    LFY_SUMMARY: 0,
                    TFY_SUMMARY: 0,
                    LY_SUMMARY: 0,
                    LM_SUMMARY: 0,
                };
                groupedData.push(newEntry);
            }

            const entry = groupedData.find(entry => entry.ArCustomerName === arCustomerName);

            const invoiceDate = new Date(row['InvoiceDateChar']);
            const currentDate = new Date();

            //LFY_SUMMARY
            if (
                (invoiceDate.getFullYear() === 2022 && invoiceDate.getMonth() > 6) ||
                (invoiceDate.getFullYear() === 2023 && invoiceDate.getMonth() < 7)
            ) {
                entry.LFY_SUMMARY += parseFloat(row['SaleAmountCDN']);
            }

            //TFY_SUMMARY
            if (
                (invoiceDate.getFullYear() === 2023 && invoiceDate.getMonth() > 6) ||
                (invoiceDate.getFullYear() === 2024 && invoiceDate.getMonth() < 7)
            ) {
                entry.TFY_SUMMARY += parseFloat(row['SaleAmountCDN']);
            }

            //LY_SUMMARY
            const lastYearDate = new Date();
            lastYearDate.setFullYear(lastYearDate.getFullYear() - 1);
            if (invoiceDate > lastYearDate && invoiceDate < currentDate) {
                entry.LY_SUMMARY += parseFloat(row['SaleAmountCDN']);
            }

            //LM_SUMMARY
            const lastMonthDate = new Date();
            lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
            if (
                invoiceDate.getMonth() === lastMonthDate.getMonth() &&
                invoiceDate.getFullYear() === lastMonthDate.getFullYear()
            ) {
                entry.LM_SUMMARY += parseFloat(row['SaleAmountCDN']);
            }
        });

        //console.log(groupedData);
        globalDataResult = groupedData;
        hideProgressBar();

    })
    .catch(error => {
        console.error(error);
    });

const coordinatesDataPromise = getCoordinates()
    .then(coordsData => {
        coordinates = coordsData;
    })
    .catch(error => {
        console.error(error);
    });

const notesDataPromise = getNotes()
    .then(notesData => {
        notes = notesData;
    })
    .catch(error => {
        console.error(error);
    })


$(document).ready(function () {
    const checkboxes = document.querySelectorAll('.checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            filterData();
        });
    });

    Promise.all([csvDataPromise, coordinatesDataPromise, notesDataPromise])
        .then(() => {
            console.log(notes);

            for (let val of groupedData) {
                let rightCoord = coordinates.find(coord => coord.storeName === val.ArCustomerName);

                if (rightCoord) {
                    val.latitude = rightCoord.latitude;
                    val.longitude = rightCoord.longitude;
                } else {
                    val.latitude = '';
                    val.longitude = '';
                }
            }

            for (let val of groupedData) {
                let matchingNotes = notes
                    .filter(note => note.store_name === val.ArCustomerName)
                    .map(note => note.note);

                if (matchingNotes.length > 0) {
                    val.note = matchingNotes.join(', ');
                }
            }

            finalData = groupedData.filter(val => val.latitude !== '' & val.longitude !== '');

            console.log(finalData);

            let uniqueSalesPersons = getUniqueValuesForFilter(finalData, 'ArSalesperson');
            let uniqueCustomerNames = getUniqueValuesForFilter(finalData, 'ArCustomerName');

            let salesPersonSelect = $('.salesPersonFilter');
            salesPersonSelect.empty();

            $.each(uniqueSalesPersons, function (index, value) {
                salesPersonSelect.append($('<option>').text(value.text).attr('value', value.text));
            });

            salesPersonSelect.select2({
                placeholder: 'Select multiple options...',
                width: '100%',
                allowClear: true,
                tokenSeparators: [',', ' '],
                minimumInputLength: 0,
                pagination: {
                    more: true,
                },
                closeOnSelect: false,
            });

            let customerNameSelect = $('.customerNameFilter');
            customerNameSelect.empty();

            $.each(uniqueCustomerNames, function (index, value) {
                //console.log(value)
                customerNameSelect.append($('<option>').text(value.text).attr('value', value.text));
            });

            customerNameSelect.select2({
                placeholder: 'Select multiple options...',
                width: '100%',
                allowClear: true,
                tokenSeparators: [',', ' '],
                minimumInputLength: 0,
                pagination: {
                    more: true,
                },
                closeOnSelect: false,
            });

            salesPersonSelect.on('change', function () {
                filterData();
            });

            customerNameSelect.on('change', function () {
                filterData();
            });

            drawPinsAndClusters(finalData);
        })
        .catch(error => {
            console.error(error);
        });
});
