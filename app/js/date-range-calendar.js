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

    var dateHelper = {
        getNumberDaysInMonth: function(month, year) {
            var self = this;
            var date = new Date();
            var currentYear = typeof year !== 'undefined' ?  year : date.getFullYear();
            var currentMonth = typeof month !== 'undefined' ? month : date.getMonth();

            return new Date(currentYear, currentMonth, 0).getDate();
        },
        getMonthFirstDay: function(month, year) {
            var self = this;
            var date = new Date();
            var currentYear = typeof year !== 'undefined' ?  year : date.getFullYear();
            var currentMonth = typeof month !== 'undefined' ? month : date.getMonth();

            return new Date(currentYear, currentMonth, 1);
        },
        getMonthLastDay: function(month, year) {
            var self = this;
            var date = new Date();
            var currentYear = typeof year !== 'undefined' ?  year : date.getFullYear();
            var currentMonth = typeof month !== 'undefined' ? month : date.getMonth();

            return new Date(currentYear, currentMonth + 1, 0);
        }
    };

    var dom = {
        createElement: function(elemName) {
            var elementName = elemName || 'div';

            return document.createElement(elementName);
        },
        addClass: function(element, classNames) {
            return element.className = classNames;
        }
    };

    var calendar = {
        config: {
            fragmentsNumber: 2,
            daysPerWeek: 7,
            daysNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
        },
        creteMonthCalendar: function(month) {
            var self = this;
            var table = dom.createElement('table');
            var daysPerWeek = self.config.daysPerWeek;
            var daysCounter = 1;
            var daysNames = self.config.daysNames;
            var startIndex = daysNames.indexOf(daysNames[dateHelper.getMonthFirstDay(month).getDay()]) + 1;
            var startCounter = 0;

            dom.addClass(table, 'fixed-table-layout parent-width txt-align-center');

            function createTableCaption() {
                var monthName = self.config.monthNames[month];
                var tableCaption = dom.createElement('caption');
                var text = document.createTextNode(monthName);

                tableCaption.appendChild(text);

                return tableCaption;
            }

            function createTableHeader() {
                var tableHeader = dom.createElement('thead');
                var row = dom.createElement('tr');

                for (var i = 0; i < daysNames.length; i++) {
                    var cell = dom.createElement('td');
                    var text = document.createTextNode(daysNames[i]);

                    cell.appendChild(text);
                    row.appendChild(cell);
                }

                tableHeader.appendChild(row);

                return tableHeader;
            }

            function createTableBody() {
                var tableBody = dom.createElement('tbody');
                var daysInMonth = dateHelper.getNumberDaysInMonth(month);
                var weeksCounter = Math.ceil(daysInMonth/daysPerWeek);

                function createCells() {
                    var cells = document.createDocumentFragment();
                    var dayIndex = 0;
                    var cell;
                    var text;

                    for (dayIndex; dayIndex < daysPerWeek; dayIndex++) {
                        startCounter++;
                        if (daysCounter <= daysInMonth) {
                            cell = dom.createElement('td');
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

                function createRows() {
                    var rows = document.createDocumentFragment();
                    var weekIndex = 0;
                    var row;
                    var week;

                    for (weekIndex; weekIndex < weeksCounter; weekIndex++) {
                        row = dom.createElement('tr');
                        week = createCells();

                        row.appendChild(week);
                        rows.appendChild(row);
                    }

                    return rows;
                }

                tableBody.appendChild(createRows());

                return tableBody;
            }

            table.appendChild(createTableCaption());
            table.appendChild(createTableHeader());
            table.appendChild(createTableBody());

            return table;
        },
        createFields: function() {
            var self = this;
            var mainContainer = document.getElementById('calendar-container');
            var field = dom.createElement();
            var sidesClassNames = [];

            dom.addClass(field, 'display-table parent-size');
            mainContainer.appendChild(field);

            for (var i = 0; i < self.config.fragmentsNumber; i++) {
                var side = dom.createElement();
                var sideName = 'side-' + i;

                dom.addClass(side, sideName + ' display-table-cell');
                sidesClassNames.push('.' + sideName);

                field.appendChild(side);
            }

            return sidesClassNames;
        },
        createCalendarFragments: function(month) {
            var self = this;
            var currentMont = typeof month !== 'undefined' ? month : new Date().getMonth();
            var fragments = [];

            for (var i = 0; i < self.config.fragmentsNumber; i++) {
                fragments.push(self.creteMonthCalendar(currentMont++));
            }

            return fragments;
        },
        render: function(month) {
            var self = this;
            var fragments = self.createCalendarFragments(month);
            var fields = self.createFields();

            for (var i = 0; i < fields.length; i++) {
                document.querySelector(fields[i]).appendChild(fragments[i])
            }
        }
    };

    return {
        initialize: function() {
            console.error('init calendar');
        },
        generateMonth: function(month) {
            calendar.render(month);
        }
    }
}));