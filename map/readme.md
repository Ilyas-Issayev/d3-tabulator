# Interactive Sales Map

This project is an interactive map dashboard that visualizes sales data on a map, allowing users to filter and explore sales information for different salespersons and customers. The map displays markers representing customers' locations and clusters them dynamically based on their proximity.

## Features

- Interactive Map: Displays customer locations as markers on the map.
- Marker Clustering: Clusters nearby markers to improve visualization and performance.
- Filters: Provides options to filter data based on salespersons and customer names.
- Data Summaries: Presents sales data summaries for each customer, including different time frames.
- Custom Cluster Icons: Utilizes custom icons for map marker clusters.

## Files and Structure

- `index.html`: The main HTML file that displays the interactive map and user interface.
- `scripts/js/`: Contains JavaScript files for various functionalities.
  - `csvParser.js`: Handles CSV parsing and data processing functions.
  - `ui.js`: Manages UI-related functions such as progress bars and select dropdowns.
  - `dataProcessor.js`: Includes functions for data filtering and processing.
- `scripts/php/gettingCoordinates.php`: PHP script to fetch customer coordinates.
- `logoSvg.svg`: SVG file used as a custom icon for markers.
- `analytics/newAnalytic/mainData.csv`: Sample CSV data containing sales information.

## Function Descriptions

### `drawPinsAndClusters(data)`

Draws map markers and clusters based on the provided data. Clears existing layers before drawing new ones.

### `filterBySummarySales(selectedCheckboxes)`

Filters data based on selected sales summary ranges (checkboxes).

### `filterBySalesPerson(selectedValues, filteredBySummarySales)`

Filters data based on selected salespersons.

### `filterByCustomerName(selectedCustomerNames, filteredBySalesPerson)`

Filters data based on selected customer names.

### `filterData()`

Applies selected filters, clears existing markers and clusters, and redraws them with new filtered data.

### `parseReviver(key, value)`

A custom JSON parsing function that removes double quotes from values.

### `getCoordinates()`

Fetches customer coordinates from the server and processes the data.

## Dependencies

- [Leaflet](https://leafletjs.com/): Open-source JavaScript library for interactive maps.
- [Leaflet.markercluster](https://github.com/Leaflet/Leaflet.markercluster): Plugin for clustering map markers.
- [Select2](https://select2.org/): jQuery-based custom select dropdowns.

## Acknowledgments

- This project was inspired by the need to visualize and analyze sales data geographically.
- Thanks to the Leaflet and Select2 communities for providing useful tools.

## Contact

If you have any questions or suggestions, feel free to reach out to the project maintainer at ilyas@mxn.kz or bakhtiyar@mxn.kz.
