;(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([''], function() {

        });
    }
    else if (typeof exports !== 'undefined') {

    }
    else {
        root.Calendar = factory();
    }

}(this, function() {

    function getNumberDaysInMonth(month, year) {
        var currentYear = year || new Date().getFullYear();
        var currentMonth = month || new Date().getMonth();

        return new Date(currentYear, currentMonth, 0).getDate();
    }

    function getMonthFirstDay(month, year) {
        var date = new Date();
        var currentYear = year || date.getFullYear();
        var currentMonth = month || date.getMonth();

        return new Date(currentYear, currentMonth, 1);
    }

    function getMonthLastDay(month, year) {
        var date = new Date();
        var currentYear = year || date.getFullYear();
        var currentMonth = typeof month !== 'undefined' ? month : date.getMonth();

        return new Date(currentYear, currentMonth + 1, 0);
    }

    function getMonthNameByIndex(index) {
        var monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        return monthNames[index];
    }

    return {
        initialize: function() {
            console.error('init calendar');
        },
        generateMonth: function(month) {
            var table = document.createElement('table');
            var tableHeader = document.createElement('thead');
            var tableBody = document.createElement('tbody');

            var daysInMonth = getNumberDaysInMonth(month);
            var daysPerWeek = 7;
            var weeksCounter = Math.ceil(daysInMonth/daysPerWeek);
            var daysCounter = 1;
            var daysNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            var startIndex = daysNames.indexOf(daysNames[getMonthFirstDay(month).getDay()]);
            var startCounter = 0;

            console.log('getMonthNameByIndex', getMonthNameByIndex(month));
            console.log('getNumberDaysInMonth', getNumberDaysInMonth());
            console.log('weeksCounter', weeksCounter);
            console.log('startIndex', startIndex);
            console.log('getMonthFirstDay', getMonthFirstDay(month));

            function createWeek() {
                var cells = document.createDocumentFragment();
                var dayIndex = 0;
                var cell;
                var text;

                for (dayIndex; dayIndex < daysPerWeek; dayIndex++) {
                    startCounter++;
                    if (daysCounter <= daysInMonth) {
                        cell = document.createElement('td');
                        text = document.createTextNode('');

                        if (startCounter >= startIndex) {
                            text = document.createTextNode(daysCounter++);
                        }

                        cell.appendChild(text);
                        cells.appendChild(cell);
                    }
                }

                return cells;
            }

            function createMonth() {
                var rows = document.createDocumentFragment();
                var weekIndex = 0;
                var row;
                var week;

                for (weekIndex; weekIndex < weeksCounter; weekIndex++) {
                    row = document.createElement('tr');
                    week = createWeek();

                    row.appendChild(week);
                    rows.appendChild(row);
                }

                return rows;
            }

            tableBody.appendChild(createMonth());
            table.appendChild(tableBody);

            document.getElementById('calendar-container').appendChild(table);
        }
    }
}));