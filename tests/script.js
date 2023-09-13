import { parseCSV, removeDuplicates } from '../scripts/js/csvParser.js';
import { getUniqueValuesForFilter, groupDataByFirstTable } from '../scripts/js/dataProcessor.js';
import { findObjectsByPropertyArray, formatValue, removeDecimalsAndChars, calculateVariancePercentage } from './arr.js';
import { determineCategory } from '../scripts/js/helpers/determineCategory.js';

QUnit.test("Тест функции parseCSV", function (assert) {
    const csvData = "Name|Age|Country\nJohn|30|USA\nAlice|25|Canada\nBob|40|UK";
    const expectedOutput = [
        { Name: "John", Age: "30", Country: "USA" },
        { Name: "Alice", Age: "25", Country: "Canada" },
        { Name: "Bob", Age: "40", Country: "UK" }
    ];

    const result = parseCSV(csvData);

    assert.deepEqual(result, expectedOutput, "Функция должна правильно парсить CSV");
});

QUnit.test("Тест функции parseCSV на пустых данных", function (assert) {
    const csvData = "";
    const expectedOutput = [];

    const result = parseCSV(csvData);

    assert.deepEqual(result, expectedOutput, "Функция должна вернуть пустой массив на пустых данных");
});

QUnit.test("Тест функции removeDuplicates", function (assert) {
    const inputArray = [
        { id: 1, name: "John" },
        { id: 2, name: "Alice" },
        { id: 1, name: "John" },
        { id: 3, name: "Bob" }
    ];

    const expectedOutput = [
        { id: 1, name: "John" },
        { id: 2, name: "Alice" },
        { id: 3, name: "Bob" }
    ];

    const result = removeDuplicates(inputArray);

    assert.deepEqual(result, expectedOutput, "Функция должна удалять дубликаты объектов");
});


QUnit.test("Тест функции getUniqueValuesForFilter", function (assert) {
    const inputArray = [
        { id: 1, name: "John", country: "USA" },
        { id: 2, name: "Alice", country: "Canada" },
        { id: 3, name: "Bob", country: "UK" },
        { id: 4, name: "Eva", country: "USA" },
        { id: 5, name: "Dan", country: "Canada" }
    ];

    const propertyName = "country";

    const expectedOutput = [
        { id: "USA", text: "USA" },
        { id: "Canada", text: "Canada" },
        { id: "UK", text: "UK" }
    ];

    const result = getUniqueValuesForFilter(inputArray, propertyName);

    assert.deepEqual(result, expectedOutput, "Функция должна возвращать уникальные значения свойства в нужном формате");
});

QUnit.test("Тест функции groupDataByFirstTable", function (assert) {
    const inputArray = [
        {
            "InvoiceDateChar": "2021-08-03",
            "TrnBranch": "OB",
            "TrnBranchName": "TILEMASTER AURORA",
            "TrnSalespersonName": "TILEMASTER HOUSE ACCT",
            "StockCode": "KS-SR-LTGREY",
            "TrnProductClassDescription": "CEMENTS, GLUES AND GROUTS",
            "SaleAmountCDN": "-19.50",
            "CostAmtCDN": "-12.92",
            "ArCustomerName": "REEVES CONTRACTING",
            "SupplierName": "KIESEL / EURO ACCT",
            "Series": "SERVOPERL"
        },
        {
            "InvoiceDateChar": "2021-08-03",
            "TrnBranch": "BA",
            "TrnBranchName": "TILEMASTER BARRIE",
            "TrnSalespersonName": "TILEMASTER HOUSE ACCT",
            "StockCode": "S400-2115",
            "TrnProductClassDescription": "PROFILES",
            "SaleAmountCDN": "-42.68",
            "CostAmtCDN": "-23.30",
            "ArCustomerName": "FOREVER FLOOR & WALL (011373)",
            "SupplierName": "SCHLUTER SYSTEMS (CANADA) INC",
            "Series": "JOLLY"
        }
    ];

    const expectedOutput = [
        {
            "TrnBranchName": "TILEMASTER AURORA",
            "SalesAmountCDN": -19.5,
            "Categories": "Other",
            "ArSupplierName": "KIESEL / EURO ACCT",
            "ArCustomerName": "REEVES CONTRACTING",
            "TrnSalespersonName": "TILEMASTER HOUSE ACCT",
            "TrnYear": 2021,
            "TrnMonth": 8,
            "InvoiceDateChar": "2021-08-03",
            "TrnProductClassDescription": "CEMENTS, GLUES AND GROUTS",
            "TrnBranch": "OB",
            "Series": "SERVOPERL",
            "StockCode": "KS-SR-LTGREY"
        },
        {
            "TrnBranchName": "TILEMASTER BARRIE",
            "SalesAmountCDN": -42.68,
            "Categories": "Other",
            "ArSupplierName": "SCHLUTER SYSTEMS (CANADA) INC",
            "ArCustomerName": "FOREVER FLOOR & WALL (011373)",
            "TrnSalespersonName": "TILEMASTER HOUSE ACCT",
            "TrnYear": 2021,
            "TrnMonth": 8,
            "InvoiceDateChar": "2021-08-03",
            "TrnProductClassDescription": "PROFILES",
            "TrnBranch": "BA",
            "Series": "JOLLY",
            "StockCode": "S400-2115"
        }
    ];

    const result = groupDataByFirstTable(inputArray);

    assert.deepEqual(result, expectedOutput, "Функция должна правильно группировать данные");
});

QUnit.test("Тест функции findObjectsByPropertyArray", function (assert) {
    const inputArray = [
        { id: 1, name: "John", country: "USA" },
        { id: 2, name: "Alice", country: "Canada" },
        { id: 3, name: "Bob", country: "UK" },
        { id: 4, name: "Eva", country: "USA" },
        { id: 5, name: "Dan", country: "Canada" }
    ];

    const criteria = [
        { key: "country", value: "USA" },
        { key: "name", value: "John" }
    ];

    const expectedOutput = [
        { id: 1, name: "John", country: "USA" }
    ];

    const result = findObjectsByPropertyArray(inputArray, criteria);

    assert.deepEqual(result, expectedOutput, "Функция должна правильно находить объекты по критериям");
});

QUnit.test("Тест функции formatValue", function (assert) {
    assert.equal(formatValue(500000), "500.0 k", "Значение 500000 должно быть сокращено до '500.0 k'");
    assert.equal(formatValue(1500000), "1.5 m", "Значение 1500000 должно быть сокращено до '1.5 m'");
    assert.equal(formatValue(999), "999.00", "Значение 999 должно оставаться без изменений");
});

QUnit.test("Тест функции removeDecimalsAndChars", function (assert) {
    assert.strictEqual(removeDecimalsAndChars("abc 123,456.78"), "123.456.78", "Функция должна удалить буквы, пробелы и заменить запятые на точки");
    assert.strictEqual(removeDecimalsAndChars("1,23"), "1.23", "Функция должна заменить запятую на точку");
    assert.strictEqual(removeDecimalsAndChars("1 234"), "1234", "Функция должна удалить пробелы");
    assert.strictEqual(removeDecimalsAndChars("1234"), "1234", "Функция должна оставить без изменений");
});

QUnit.test("Тест функции calculateVariancePercentage", function (assert) {
    assert.equal(calculateVariancePercentage(0, 100), "+100%", "Функция должна вернуть '+100%' при значениях равных 0 и 100");
    assert.equal(calculateVariancePercentage(0, -100), "-100%", "Функция должна вернуть '-100%' при значениях равных 0 и -100");
    assert.equal(calculateVariancePercentage(0, 0), "0%", "Функция должна вернуть '0%' при значениях равных 0 и ");
    assert.equal(calculateVariancePercentage(100, 200), "100.00%", "Функция должна вернуть '100.00%' при значениях равных 100 и 200");
    assert.equal(calculateVariancePercentage(100, 50), "-50.00%", "Функция должна вернуть '-50.00%' при значениях равных 100 и 50");
});

QUnit.test("Тест функции determineCategory", function (assert) {
    assert.equal(determineCategory("AMANDA LABATTE-DAWE", "SomeBranch"), "Architectural", "Функция должна вернуть 'Architectural' для имени продавца 'AMANDA LABATTE-DAWE'");
    assert.equal(determineCategory("GRACE FARROW", "SomeBranch"), "Distribution", "Функция должна вернуть 'Distribution' для имени продавца GRACE FARROW");
    assert.equal(determineCategory("HOUSE ACCOUNT", "SomeBranch"), "HOUSE ACCOUNT (HOU)", "Функция должна вернуть 'HOUSE ACCOUNT (HOU)' для имени продавца HOUSE ACCOUNT");
    assert.equal(determineCategory("UNKNOWN NAME", "SomeBranch"), "Unknow", "Функция должна вернуть 'Unknown' для неизвестного имени продавца");
});