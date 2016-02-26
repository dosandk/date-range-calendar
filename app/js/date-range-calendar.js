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
        fragmentsManager: {
            fragments: {},
            renderAll: function() {
                var self = this;

                for (var i in self.fragments) {
                    var fragment = self.fragments[i].fragmentHtml;
                    var field = self.fragments[i].containerClassName;

                    document.querySelector(field).appendChild(fragment);
                }
            },
            renderFragment: function(fragmentIndex) {
                var self = this;

                if (typeof fragmentIndex !== 'undefined') {
                    var calendarObj = self.fragments[fragmentIndex];
                    var container = document.querySelector(calendarObj.containerClassName);

                    container.innerHTML = '';
                    container.appendChild(calendarObj.fragmentHtml);

                    calendar.initMonthSlider(container);
                }
            }
        },
        creteMonthCalendar: function(month, year) {
            var self = this;
            var currentMonth = typeof month !== 'undefined' ? month : self.month;
            var currentYear = typeof year !== 'undefined' ? year : self.year;

            var table = dom.createElement('table');
            var daysPerWeek = self.config.daysPerWeek;
            var daysCounter = 1;
            var daysNames = self.config.daysNames;
            var startIndex = daysNames.indexOf(daysNames[dateHelper.getMonthFirstDay(currentMonth, currentYear).getDay()]) + 1;
            var startCounter = 0;

            dom.addClass(table, 'fixed-table-layout parent-width txt-align-center');

            function createTableCaption() {
                var monthName = self.config.monthNames[currentMonth];
                var tableCaption = dom.createElement('caption');
                var text = document.createTextNode(monthName + ' ' + currentYear);

                function createNavigation() {
                    var leftArrow = dom.createElement('span');
                    var leftArrowIcon = document.createTextNode('<<');

                    dom.addClass(leftArrow, 'js-arrow-left-' + currentMonth);

                    leftArrow.setAttribute('data-month', currentMonth);
                    leftArrow.setAttribute('data-state', 'prev');
                    leftArrow.setAttribute('data-year', currentYear);
                    leftArrow.appendChild(leftArrowIcon);

                    var rightArrow = dom.createElement('span');
                    var rightArrowIcon = document.createTextNode('>>');

                    dom.addClass(rightArrow, 'js-arrow-right-' + currentMonth);

                    rightArrow.setAttribute('data-month', currentMonth);
                    rightArrow.setAttribute('data-state', 'next');
                    rightArrow.setAttribute('data-year', currentYear);
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
                var daysInMonth = dateHelper.getNumberDaysInMonth(currentMonth, currentYear);
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
        createField: function(month, year) {
            var self = this;
            var mainContainer = document.querySelector('.sides-container');
            var container = dom.createElement();
            var sideName = self.fragmentsManager.fragments[year + '-' + month].containerClassName;

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
        createCalendarFragments: function() {
            var self = this;
            var currentMonth = self.month;

            for (var i = 0; i < self.config.fragmentsNumber; i++) {
                self.initFragmentsManager({
                    monthIndex: currentMonth,
                    fragmentHtml: self.creteMonthCalendar(currentMonth),
                    containerClassName: '.side-' + currentMonth
                });

                self.createField(currentMonth, self.year);

                currentMonth++;
            }
        },
        initFragmentsManager: function(data) {
            var self = this;
            var monthIndex = data.monthIndex;
            var containerClassName = data.containerClassName;
            var fragmentHtml = data.fragmentHtml;
            var currentYear = typeof data.year !== 'undefined' ? data.year : self.year;

            self.fragmentsManager.fragments[currentYear + '-' + monthIndex] = {
                year: currentYear,
                name: self.config.monthNames[monthIndex],
                index: monthIndex,
                containerClassName: containerClassName,
                fragmentHtml: fragmentHtml
            };
        },
        updateFragmentsManager: function(data) {
            var self = this;
            var monthIndex = data.monthIndex;
            var nextMonthIndex = data.nextMonthIndex;
            var currentYear = data.year;
            var currentCalendar = self.fragmentsManager.fragments[currentYear + '-' + monthIndex];
            var nextYear = typeof data.nextYear !== 'undefined' ? data.nextYear : currentCalendar.year;
            var calendarHtml = self.creteMonthCalendar(nextMonthIndex, nextYear);

            if (typeof self.fragmentsManager.fragments[nextYear + '-' + nextMonthIndex] !== 'undefined') {
                console.error('this month already exist');
            }
            else  {
                var currentFragmentIndex = currentYear + '-' + monthIndex;
                var nextFragmentIndex = nextYear + '-' + nextMonthIndex;

                currentCalendar.year = nextYear;
                currentCalendar.index = nextMonthIndex;
                currentCalendar.name = self.config.monthNames[nextMonthIndex];
                currentCalendar.fragmentHtml = calendarHtml;

                self.fragmentsManager.fragments[nextFragmentIndex] = currentCalendar;
                delete self.fragmentsManager.fragments[currentFragmentIndex];

                self.fragmentsManager.renderFragment(nextFragmentIndex);
            }

            console.log(self.fragmentsManager);
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
            var currentYear = parseInt(e.currentTarget.getAttribute('data-year'), 10);
            var nextYear;
            var nextMonth;

            switch (state) {
                case 'prev':
                    nextMonth = month - 1;
                    break;
                case 'next':
                    nextMonth = month + 1;
                    break;
            }

            if (nextMonth < 0) {
                nextYear = currentYear - 1;
                nextMonth = 11;
            }
            else if (nextMonth > 11) {
                nextYear = currentYear + 1;
                nextMonth = 0;
            }

            self.updateFragmentsManager({
                year: currentYear,
                nextYear: nextYear,
                monthIndex: month,
                nextMonthIndex: nextMonth
            });

        },
        render: function(month, year) {
            var self = this;

            self.month = typeof month !== 'undefined' ? month : new Date().getMonth();
            self.year = typeof year !== 'undefined' ? year : new Date().getFullYear();

            self.createCalendarFragments();
            self.fragmentsManager.renderAll();

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
        generateMonth: function() {
            var month = 10;
            var year = 2017;

            calendar.render(month, year);
        }
    }
}));