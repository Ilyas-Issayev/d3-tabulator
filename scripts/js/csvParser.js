// csvParser.js

/**
 * Получает CSV-файл по указанному URL, отслеживает прогресс загрузки и парсит его в массив объектов.
 * 
 * @param {string} url - URL для загрузки CSV-файла.
 * @param {HTMLElement} progressBar - Элемент прогресс-бара для отображения прогресса загрузки.
 * @returns {Promise<Array<Object>>} Промис, который резолвится в массив объектов, представляющих данные CSV-файла.
 */
export function fetchAndParseCSV(url, progressBar) {
    return fetch(url)
    .then(response => {
      var reader = response.body.getReader();
      var totalBytes = response.headers.get('Content-Length');
      var loadedBytes = 0;
      var chunks = [];

      function read() {
        return reader.read().then(({ done, value }) => {
          if (done) {
            return chunks;
          }

          loadedBytes += value.length;
          var percentComplete = (loadedBytes / totalBytes) * 100;
          progressBar.style.width = percentComplete + '%';

          chunks.push(value);
          return read();
        });
      }

      return read()
        .then(chunks => {
          var concatenatedChunks = new Uint8Array(loadedBytes);
          var offset = 0;

          for (var i = 0; i < chunks.length; i++) {
            concatenatedChunks.set(chunks[i], offset);
            offset += chunks[i].length;
          }

          return new TextDecoder('utf-8').decode(concatenatedChunks);
        })
        .finally(() => reader.releaseLock());
    })
    .then(csvData => parseCSV(csvData));
}

/**
 * Удаляет дубликаты из массива объектов.
 * 
 * @param {Array<Object>} data - Массив объектов для удаления дубликатов.
 * @returns {Array<Object>} Массив объектов без дубликатов.
 */
export function removeDuplicates(data) {
    const uniqueArray = [];
    const seen = new Set();

    data.forEach(obj => {
        const objString = JSON.stringify(obj);

        if (!seen.has(objString)) {
            seen.add(objString);
            uniqueArray.push(obj);
        }
    });

    return uniqueArray;
}

/**
 * Преобразует текст CSV-файла в массив объектов.
 * 
 * @param {string} csvData - Текст CSV-файла.
 * @returns {Array<Object>} Массив объектов, представляющих данные CSV-файла.
 */
export function parseCSV(csvData) {
    const lines = csvData.split('\n');
  
    const headers = lines[0].split('|');
  
    const result = [];
  
    for (let i = 1; i < lines.length; i++) {
      const obj = {};
      const currentLine = lines[i].split('|');
  
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = currentLine[j];
      }
  
      result.push(obj);
    }
  
    return result;
}