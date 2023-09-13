# Interactive Sales Dashboard

This project consists of an interactive sales dashboard that facilitates the visualization and analysis of sales data. The dashboard provides various features, including data filtering, date range selection, and multiple table views to present sales data from different perspectives.

## Features

-   **Progress Bar:** Displays a progress bar while loading and processing data.
-   **Date Range Picker:** Allows users to select a custom date range for data analysis.
-   **Data Parsing:** Fetches and parses CSV data from a specified URL.
-   **Data Grouping:** Groups data into different categories for various table views.
-   **Data Filtering:** Enables filtering of data based on different criteria using Select2 dropdowns.
-   **Table Views:** Presents sales data in multiple tables with specific categories.
-   **Custom JSON Parsing:** Implements a custom JSON parsing function to remove double quotes from values.

## Files and Structure

-   `index.html`: The main HTML file that displays the dashboard interface.
-   `main.js`: JavaScript file containing the main code for data processing and dashboard functionality.
-   `scripts/js/`: Directory containing JavaScript files for different functionalities.
    -   `ui.js`: Manages UI-related functions such as progress bar display and Select2 initialization.
    -   `csvParser.js`: Handles CSV parsing and data processing functions.
    -   `dataProcessor.js`: Includes functions to group and filter data for different tables.
    -   `helpers/dateHelper.js`: Provides functions for initializing and updating the date range picker.
    -   `helpers/tableHelpers.js`: Contains utility functions for table-related tasks.
    -   `firstTable.js`, `secondTable.js`, `thirdTable.js`: JavaScript files for generating specific table views.
-   `analytics/newAnalytic/mainData.csv`: Sample CSV data containing sales information.

## Function Descriptions

### `showProgressBar()` and `hideProgressBar()`

Display and hide the progress bar while loading data.

### `fetchAndParseCSV(csvURL, progressBar)`

Fetches and parses CSV data from the provided URL while updating the progress bar.

### `groupDataByFirstTable(parsedData)`, `groupDataBySecondTable(parsedData)`, etc.

Groups parsed data into different categories based on the specific table's requirements.

### `getUniqueValuesForFilter(data, attribute)`

Extracts unique values for a specific attribute from the data to populate Select2 dropdowns.

### `initializeSelect2(uniqueValues, id)`

Initializes Select2 dropdowns with the provided unique values and element IDs.

### `getFirstTable(groupedData)`, `getSecondTable(groupedData)`, etc.

Generates the content for different table views based on the grouped data.

### `initializeDateRangePicker()`, `updateDateRange(startDate, endDate)`

Initializes and updates the date range picker element.

### `parseReviver(key, value)`

A custom JSON parsing function that removes double quotes from values.

## Dependencies

-   [Select2](https://select2.org/): jQuery-based custom select dropdowns.
-   [Moment.js](https://momentjs.com/): JavaScript library for date and time manipulation.

## Acknowledgments

-   This dashboard was developed to address the need for a comprehensive sales data analysis tool.
-   Special thanks to the developers of Select2 and Moment.js for their valuable libraries.

## Contact

For inquiries or suggestions, please feel free to contact the project maintainers at ilyas@mxn.kz or bakhtiyar@mxn.kz.
