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

            return new Date(currentYear, currentMonth + 1, 0).getDate();
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
        fragmentsManager: {},
        creteMonthCalendar: function(month) {
            var self = this;
            var currentMonth = month || self.month;
            var table = dom.createElement('table');
            var daysPerWeek = self.config.daysPerWeek;
            var daysCounter = 1;
            var daysNames = self.config.daysNames;
            var startIndex = daysNames.indexOf(daysNames[dateHelper.getMonthFirstDay(currentMonth).getDay()]) + 1;
            var startCounter = 0;

            dom.addClass(table, 'fixed-table-layout parent-width txt-align-center');

            function createTableCaption() {
                var monthName = self.config.monthNames[currentMonth];
                var tableCaption = dom.createElement('caption');
                var text = document.createTextNode(monthName);

                function createNavigation() {
                    var leftArrow = dom.createElement('span');
                    var leftArrowIcon = document.createTextNode('<<');

                    dom.addClass(leftArrow, 'js-arrow-left-' + currentMonth);

                    leftArrow.setAttribute('data-month', currentMonth);
                    leftArrow.setAttribute('data-state', 'prev');
                    leftArrow.appendChild(leftArrowIcon);

                    var rightArrow = dom.createElement('span');
                    var rightArrowIcon = document.createTextNode('>>');

                    dom.addClass(rightArrow, 'js-arrow-right-' + currentMonth);

                    rightArrow.setAttribute('data-month', currentMonth);
                    rightArrow.setAttribute('data-state', 'next');
                    rightArrow.appendChild(rightArrowIcon);

                    return {
                        leftArrow: leftArrow,
                        rightArrow: rightArrow
                    }
                }

                var arrows = createNavigation();

                tableCaption.appendChild(arrows.leftArrow);
                tableCaption.appendChild(text);
                tableCaption.appendChild(arrows.rightArrow);

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
        createField: function(month) {
            var self = this;
            var mainContainer = document.querySelector('.sides-container');
            var container = dom.createElement();
            var sideName = self.fragmentsManager[month].containerClassName;

            dom.addClass(container, sideName.slice(1) + ' display-table-cell');

            mainContainer.appendChild(container);
        },
        createMainContainer: function() {
            var self = this;
            var mainContainer = document.getElementById('calendar-container');
            var field = dom.createElement();

            dom.addClass(field, 'sides-container display-table parent-size');
            mainContainer.appendChild(field);
        },
        createCalendarFragments: function(month) {
            var self = this;

            for (var i = 0; i < self.config.fragmentsNumber; i++) {
                var table = self.creteMonthCalendar(month);

                self.initFragmentsManager({
                    monthIndex: month,
                    fragmentHtml: table,
                    containerClassName: '.side-' + month
                });

                month++;
            }
        },
        initFragmentsManager: function(data) {
            var self = this;
            var monthIndex = data.monthIndex;
            var containerClassName = data.containerClassName;
            var fragmentHtml = data.fragmentHtml;

            self.fragmentsManager[monthIndex] = {
                name: self.config.monthNames[monthIndex],
                index: monthIndex,
                containerClassName: containerClassName,
                fragmentHtml: fragmentHtml
            };

            self.createField(monthIndex);
        },
        updateFragmentsManager: function(data) {
            var self = this;
            var monthIndex = data.monthIndex;
            var nextMonthIndex = data.nextMonthIndex;
            var calendarHtml = self.creteMonthCalendar(nextMonthIndex);
            var currentCalendar = self.fragmentsManager[monthIndex];

            if (typeof self.fragmentsManager[nextMonthIndex] !== 'undefined') {
                console.error('this month already exist');
            }
            else  {
                currentCalendar.index = nextMonthIndex;
                currentCalendar.name = self.config.monthNames[nextMonthIndex];
                currentCalendar.fragmentHtml = calendarHtml;

                self.fragmentsManager[data.nextMonthIndex] = currentCalendar;
                delete self.fragmentsManager[data.monthIndex];

                self.renderCalendarFragment(data.nextMonthIndex);
            }
        },
        renderCalendarFragment: function(index) {
            var self = this;
            var calendarObj = self.fragmentsManager[index];
            var container = document.querySelector(calendarObj.containerClassName);

            container.innerHTML = '';
            container.appendChild(calendarObj.fragmentHtml);

            self.initMonthSlider(container);

            return container;
        },
        initMonthSlider: function(elem) {
            var self = this;
            var arrows = elem.querySelectorAll('span[class^="js-arrow-"]');
            var arrowIndex = arrows.length;

            while (arrowIndex--) {
                arrows[arrowIndex].addEventListener('click', function(e) {
                    self.initMonthSliderEvents(e)
                });
            }
        },
        initMonthSliderEvents: function(e) {
            var self = this;
            var month = parseInt(e.currentTarget.getAttribute('data-month'), 10);
            var state = e.currentTarget.getAttribute('data-state');
            var nextMonth;

            switch (state) {
                case 'prev':
                    nextMonth = month - 1;
                    break;
                case 'next':
                    nextMonth = month + 1;
                    break;
            }

            self.updateFragmentsManager({
                monthIndex: month,
                nextMonthIndex: nextMonth
            });

            console.log(self.fragmentsManager);
        },
        render: function(month) {
            var self = this;

            self.month = typeof month !== 'undefined' ? month : new Date().getMonth();

            self.createCalendarFragments(self.month);

            for (var i in self.fragmentsManager) {
                var fragment = self.fragmentsManager[i].fragmentHtml;
                var field = self.fragmentsManager[i].containerClassName;

                document.querySelector(field).appendChild(fragment);
            }

            self.initListeners();
        },
        initListeners: function() {
            var self = this;
            var arrows = document.querySelectorAll('span[class^="js-arrow-"]');
            var arrowIndex = arrows.length;

            while (arrowIndex--) {
                arrows[arrowIndex].addEventListener('click', function(e) {
                    self.initMonthSliderEvents(e);
                });
            }
        }
    };

    return {
        initialize: function() {
            console.error('init calendar');
            calendar.createMainContainer();
        },
        generateMonth: function(month) {
            calendar.render(month);

            console.log(calendar.fragmentsManager);
        }
    }
}));