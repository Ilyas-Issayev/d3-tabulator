/**
 * The function `findObjectsByPropertyArray` filters an array of objects based on multiple criteria.
 * @param arr - The `arr` parameter is an array of objects.
 * @param criteria - The `criteria` parameter is an array of objects. Each object in the array
 * represents a criterion that we want to use to filter the `arr` array. Each criterion object has two
 * properties: `key` and `value`. The `key` property represents the property name of the object in `
 * @returns an array of objects that match the given criteria.
 */
export function findObjectsByPropertyArray(arr, criteria) {
    return arr.filter(obj => {
        return criteria.every(criterion => obj[criterion.key] === criterion.value);
    });
}


/**
 * The formatValue function takes a number as input and returns a formatted string representation of
 * the number, with values greater than or equal to one million represented in millions (m) and values
 * greater than or equal to one thousand represented in thousands (k).
 * @param value - The `value` parameter is a number that represents a value that needs to be formatted.
 * @returns a formatted value based on the input value. If the input value is greater than or equal to
 * one million, it returns the value divided by one million with one decimal place followed by "m". If
 * the input value is greater than or equal to one thousand, it returns the value divided by one
 * thousand with one decimal place followed by "k". Otherwise, it returns the input value with
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
 * The function removes decimals and characters from a given string, and returns the modified string
 * with commas replaced by periods if the length is less than or equal to 4, or with commas removed if
 * the comma is at index 1 or 2.
 * @param str - The parameter `str` is a string that may contain decimals and characters.
 * @returns a modified version of the input string.
 */
export function removeDecimalsAndChars(str) {
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
 * The function calculates the variance percentage between two values, taking into account special
 * cases where one of the values is zero.
 * @param lastYearValue - The value from the previous year.
 * @param currentValue - The current value is the value of a certain variable or parameter in the
 * current year or time period.
 * @returns a string representing the variance percentage between the last year value and the current
 * value.
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
        return percentage.toFixed(2) + "%";
    }
}