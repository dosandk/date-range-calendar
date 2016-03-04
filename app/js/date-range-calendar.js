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
        /*getMonthFirstDay: function(month, year) {
            var self = this;
            var date = new Date();
            var currentYear = typeof year !== 'undefined' ?  year : date.getFullYear();
            var currentMonth = typeof month !== 'undefined' ? month : date.getMonth();

            return new Date(currentYear, currentMonth, 1);
        },*/
        getMonthLastDay: function(month, year) {
            var self = this;
            var date = new Date();
            var currentYear = typeof year !== 'undefined' ?  year : date.getFullYear();
            var currentMonth = typeof month !== 'undefined' ? month : date.getMonth();

            return new Date(currentYear, currentMonth + 1, 0);
        }
    };

    function formatDate(timestamp) {
        var year = new Date(timestamp).getFullYear();
        var month = new Date(timestamp).getMonth();
        var monthName = defaultConfig.monthNames[month];
        var day = new Date(timestamp).getDate();

        return day + ' ' + monthName + ' ' + year;
    }

    var dom = {
        createElement: function(elemName) {
            var elementName = elemName || 'div';

            return document.createElement(elementName);
        },
        addClass: function(element, classNames) {
            return element.className = classNames;
        }
    };

    var defaultConfig = {
        input: null,
        element: null,
        elementSelector: '.date-range-picker',
        calendarContainer: '.date-range-container',
        year: new Date().getFullYear(),
        month: new Date().getMonth(),
        fragmentsNumber: 2,
        daysPerWeek: 7,
        daysNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    };

    function extendConfig(customConf) {
        var configExtended = defaultConfig;

        if (typeof customConf !== 'undefined') {
            configExtended = {};

            for (var prop in defaultConfig) {
                if (customConf[prop]) {
                    configExtended[prop] = customConf[prop];
                }
                else {
                    configExtended[prop] = defaultConfig[prop];
                }
            }
        }

        return configExtended;
    }

    var FragmentsManager = FM = function(data) {
        this.parent = data.parent;
        this.fragments = {};

        this.selectedDateRange = {
            start: null,
            end: null
        };
    };

    FM.fn = FM.prototype;

    FM.fn.initMonthSwitchingEvent = function(elem) {
        var self = this;
        var arrows = elem.querySelectorAll('span[class^="js-arrow-"]');
        var arrowIndex = arrows.length;

        while (arrowIndex--) {
            arrows[arrowIndex].addEventListener('click', function(e) {
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

                self.updateFragment({
                    year: currentYear,
                    nextYear: nextYear,
                    monthIndex: month,
                    nextMonthIndex: nextMonth
                });
            });
        }
    };

    FM.fn.renderAllFragments = function() {
        var self = this;
        var mainContainer = self.parent.config.element;
        var sidesContainer = mainContainer.querySelector('.js-sides-container');

        for (var i in self.fragments) {
            var fragment = self.fragments[i].fragmentHtml;

            sidesContainer.appendChild(fragment);

            self.initListeners(fragment);
        }
    };

    FM.fn.renderFragment = function(fragmentIndex) {
        var self = this;

        if (typeof fragmentIndex !== 'undefined') {
            var calendarObj = self.fragments[fragmentIndex];
            var mainContainer = self.parent.config.element;
            var container = mainContainer.querySelector(calendarObj.containerClassName);

            container.innerHTML = '';
            container.appendChild(calendarObj.fragmentHtml);

            self.initListeners(container);
        }
    };

    FM.fn.setFragments = function(data) {
        var self = this;
        var monthIndex = data.monthIndex;
        var containerClassName = data.containerClassName;
        var fragmentHtml = data.fragmentHtml;
        var currentYear = data.year;
        var fragmentIndex = currentYear + '-' + monthIndex;

        self.fragments[fragmentIndex] = {
            year: currentYear,
            name: self.parent.config.monthNames[monthIndex],
            index: monthIndex,
            containerClassName: containerClassName,
            fragmentHtml: fragmentHtml
        };
    };

    FM.fn.updateFragment = function(data) {
        var self = this;
        var monthIndex = data.monthIndex;
        var nextMonthIndex = data.nextMonthIndex;
        var currentYear = data.year;
        var currentCalendar = self.fragments[currentYear + '-' + monthIndex];
        var nextYear = typeof data.nextYear !== 'undefined' ? data.nextYear : currentCalendar.year;
        var calendarHtml = self.parent.fragmentsFactory.creteFragment(nextMonthIndex, nextYear);

        if (typeof self.fragments[nextYear + '-' + nextMonthIndex] !== 'undefined') {
            console.error('this month already exist');
        }
        else  {
            var currentFragmentIndex = currentYear + '-' + monthIndex;
            var nextFragmentIndex = nextYear + '-' + nextMonthIndex;

            currentCalendar.year = nextYear;
            currentCalendar.index = nextMonthIndex;
            currentCalendar.name = self.parent.config.monthNames[nextMonthIndex];
            currentCalendar.fragmentHtml = calendarHtml;

            self.fragments[nextFragmentIndex] = currentCalendar;
            delete self.fragments[currentFragmentIndex];

            self.renderFragment(nextFragmentIndex);
        }
    };

    FM.fn.initListeners = function(elem) {
        var self = this;

        self.initMonthSwitchingEvent(elem);
        self.initGetTimestampEvent(elem);
    };

    FM.fn.initGetTimestampEvent = function(elem) {
        var self = this;
        var tbody = elem.querySelector('tbody');

        tbody.addEventListener('click', function(e) {
            var target = e.target;
            var classListArr = Array.prototype.slice.call(target.classList);

            if (classListArr.indexOf('day') >= 0) {
                var timestamp = parseInt(target.getAttribute('data-timestamp'), 10);

                if (classListArr.indexOf('selected') >= 0) {
                    self.updateDateRange(timestamp);

                    target.classList.remove('selected');
                }
                else {
                    self.resetDateRange();
                    self.setDateRange(timestamp);
                    self.showDateRange();

                    target.classList.add('selected');
                }
            }
        });
    };

    FM.fn.setDateRange = function(timestamp) {
        var self = this;

        if (!self.selectedDateRange.start) {
            self.selectedDateRange.start = timestamp;
        }
        else if (!self.selectedDateRange.end) {
            if (timestamp < self.selectedDateRange.start) {
                self.selectedDateRange.end = self.selectedDateRange.start;
                self.selectedDateRange.start = timestamp;
            }
            else {
                self.selectedDateRange.end = timestamp;
            }
        }
    };

    FM.fn.showDateRange = function() {
        var self = this;
        var start = self.selectedDateRange.start;
        var end = self.selectedDateRange.end;
        var input = self.parent.config.input;

        self.resetInput();

        if (start) {
            input.value = 'Start: ' + formatDate(start);
        }

        if (end) {
            input.value += ' End: ' + formatDate(end);
        }
    };

    FM.fn.resetInput = function() {
        this.parent.config.input.value = '';
    };

    FM.fn.resetDateRange = function() {
        var self = this;

        if (self.selectedDateRange.start && self.selectedDateRange.end) {
            self.resetInput();

            self.selectedDateRange.start = null;
            self.selectedDateRange.end = null;

            var mainContainer = self.parent.config.element;
            var sidesContainer = mainContainer.querySelector('.js-sides-container');
            var selectedDays = sidesContainer.querySelectorAll('.selected');
            var hoveredDays = sidesContainer.querySelectorAll('.hovered');
            var hoveredDaysArr = Array.prototype.slice.call(hoveredDays);
            var selectedDaysArr = Array.prototype.slice.call(selectedDays);

            selectedDaysArr.forEach(function(cell) {
                cell.classList.remove('selected');
            });

            hoveredDaysArr.forEach(function(cell) {
                cell.classList.remove('hovered');
            });
        }
    };

    FM.fn.updateDateRange = function(timestamp) {
        var self = this;

        if (timestamp === self.selectedDateRange.start) {
            self.selectedDateRange.start = self.selectedDateRange.end;
            self.selectedDateRange.end = null;
        }
        else if (timestamp === self.selectedDateRange.end) {
            self.selectedDateRange.end = null;
        }
    };

    var FragmentsFactory = FF = function(data) {
        this.parent = data.parent;
    };

    FF.fn = FF.prototype;

    FF.fn.creteFragment = function(month, year) {
        var self = this;
        var currentMonth = typeof month !== 'undefined' ? month : self.parent.month;
        var currentYear = typeof year !== 'undefined' ? year : self.parent.year;
        var table = dom.createElement('table');
        var daysPerWeek = self.parent.config.daysPerWeek;
        var daysNames = self.parent.config.daysNames;

        table.classList.add('drp-table', 'fixed-table-layout', 'parent-width', 'txt-align-center');

        function createTableHeader() {
            var tableHeader = dom.createElement('thead');
            var row = dom.createElement('tr');

            tableHeader.classList.add('drp-thead');

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
            var startCounter = 0;
            var daysCounter = 1;
            var firstDay = daysNames[new Date(currentYear, currentMonth, 1).getDay()];
            var startIndex = daysNames.indexOf(firstDay);
            var weeksCounter = Math.ceil((daysInMonth + startIndex)/daysPerWeek);

            function createCells() {
                var cells = document.createDocumentFragment();
                var dayIndex = 0;
                var cell;
                var text;

                for (dayIndex; dayIndex < daysPerWeek; dayIndex++) {
                    if (daysCounter <= daysInMonth) {
                        cell = dom.createElement('td');
                        text = document.createTextNode('');

                        cell.classList.add('drp-td');

                        if (startCounter >= startIndex) {
                            var date = new Date();
                            var nowYear = date.getFullYear();
                            var nowMonth = date.getMonth();
                            var nowDay = date.getDate();
                            var nowTimestamp = new Date(nowYear, nowMonth, nowDay).getTime();
                            var dayTimestamp = new Date(currentYear, currentMonth, daysCounter).getTime();

                            text = document.createTextNode(daysCounter);
                            cell.setAttribute('data-timestamp', dayTimestamp);

                            cell.classList.add('day');

                            if (nowTimestamp === dayTimestamp) {
                                cell.classList.add('active');
                            }

                            var start = self.parent.fragmentsManager.selectedDateRange.start;
                            var end = self.parent.fragmentsManager.selectedDateRange.end;

                            if (dayTimestamp === start || dayTimestamp === end) {
                                cell.classList.add('selected');
                            }
                            else if (dayTimestamp > start && dayTimestamp < end) {
                                cell.classList.add('hovered');
                            }

                            daysCounter++;
                        }

                        cell.appendChild(text);
                        cells.appendChild(cell);

                        startCounter++;
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

                    row.classList.add('drp-row');

                    row.appendChild(week);
                    rows.appendChild(row);
                }

                return rows;
            }

            tableBody.appendChild(createRows());

            return tableBody;
        }

        function createTableCaption() {
            var monthName = self.parent.config.monthNames[currentMonth];

            var tableCaption = document.createElement('div');
            var text = document.createTextNode(monthName + ' ' + currentYear);

            tableCaption.classList.add('drp-caption');

            function createNavigation() {
                var leftArrow = dom.createElement('span');
                var leftArrowIcon = document.createTextNode('<<');

                leftArrow.classList.add('js-arrow-left-' + currentMonth, 'js-nav-elem');

                leftArrow.setAttribute('data-month', currentMonth);
                leftArrow.setAttribute('data-state', 'prev');
                leftArrow.setAttribute('data-year', currentYear);
                leftArrow.appendChild(leftArrowIcon);

                var rightArrow = dom.createElement('span');
                var rightArrowIcon = document.createTextNode('>>');

                rightArrow.classList.add('js-arrow-right-' + currentMonth, 'js-nav-elem');

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

        var fragmentContainer = self.creteFragmentContainer(currentMonth);
        var tableWrapper = document.createElement('div');
        tableWrapper.classList.add('drp-table-wrapper');

        table.appendChild(createTableHeader());
        table.appendChild(createTableBody());

        tableWrapper.appendChild(table);

        fragmentContainer.appendChild(createTableCaption());
        fragmentContainer.appendChild(tableWrapper);

        return fragmentContainer;
    };

    FF.fn.creteFragmentContainer = function(month) {
        var container = document.createElement('div');
        var sideName = '.js-side-' + month;

        container.classList.add(sideName.slice(1), 'drp-side', 'display-table-cell');

        return container;
    };

    var Calendar = function(config) {
        var self = this;

        self.config = extendConfig(config);
        self.fragmentsManager = new FragmentsManager({ parent: self });
        self.fragmentsFactory = new FragmentsFactory({ parent: self });

        var elementSelector = self.config.elementSelector || defaultConfig.elementSelector;
        var elements = document.querySelectorAll(elementSelector);
        var elementsArr = Array.prototype.slice.call(elements);

        self.createMainContainer();

        elementsArr.forEach(function(element) {
            self.config.input = element;
            self.config.input.classList.add('has-date-range-picker');

            self.eventHandler = function(e) {
                if (self.config.input.classList.contains('has-date-range-picker')) {
                    self.calculatePosition(e);
                    self.render();
                }
            };

            element.addEventListener('click', self.eventHandler);
        });

        return this;
    };

    Calendar.fn = Calendar.prototype;

    Calendar.fn.calculatePosition = function(e) {
        var self = this;
        var target = e.target;

        self.config.element.style.top = target.offsetTop + target.offsetHeight  + 'px';
        self.config.element.style.left = target.offsetLeft + 'px';
    };

    Calendar.fn.createMainContainer = function() {
        var self = this;
        var mainContainer = document.querySelector(defaultConfig.calendarContainer);

        if (!mainContainer) {
            mainContainer = document.createElement('div');
            mainContainer.classList.add(defaultConfig.calendarContainer.slice(1), 'hide');

            document.body.appendChild(mainContainer);
        }

        self.config.element = mainContainer;
    };

    Calendar.fn.render = function() {
        var self = this;

        self.month = self.config.month;
        self.year = self.config.year;

        self.resetCalendarContainer();
        self.createCalendarContainer();
        self.initFragments();

        self.fragmentsManager.renderAllFragments();

        self.initListeners();
    };

    Calendar.fn.resetCalendarContainer = function() {
        this.config.element.innerHTML = '';
    };

    Calendar.fn.createCalendarContainer = function() {
        var self = this;
        var mainContainer = self.config.element;
        var field = dom.createElement();

        mainContainer.classList.add('has-date-range-picker');

        field.classList.add('js-sides-container', 'drp-sides-container', 'display-table', 'parent-size');
        mainContainer.appendChild(field);
    };

    Calendar.fn.initFragments = function() {
        var self = this;
        var currentMonth = self.month;
        var currentYear = self.year;

        self.fragmentsManager.fragments = {};

        for (var i = 0; i < self.config.fragmentsNumber; i++) {
            self.fragmentsManager.setFragments({
                year: currentYear,
                monthIndex: currentMonth,
                fragmentHtml: self.fragmentsFactory.creteFragment(currentMonth, currentYear),
                containerClassName: '.js-side-' + currentMonth
            });

            if (currentMonth < 11) {
                currentMonth++;
            }
            else {
                currentYear++;
                currentMonth = 0;
            }
        }
    };

    Calendar.fn.initListeners = function() {
        var self = this;

        self.initCellHoverEffect();
    };

    Calendar.fn.initCellHoverEffect = function() {
        var self = this;
        var mainContainer = self.config.element;
        var sidesContainer = mainContainer.querySelector('.js-sides-container');

        sidesContainer.addEventListener('mouseover', function(e) {
            var start = self.fragmentsManager.selectedDateRange.start;
            var end = self.fragmentsManager.selectedDateRange.end;

            if (start && !end) {
                var target = e.target;
                var targetClassList = target.classList;
                var targetClassListArr = Array.prototype.slice.call(targetClassList);

                if (targetClassListArr.indexOf('day') >= 0) {
                    var timestamp = parseInt(e.target.getAttribute('data-timestamp'), 10);

                    self.hoverCells(timestamp);
                }
            }
        });
    };

    Calendar.fn.hoverCells = function(timestamp) {
        var self = this;
        var mainContainer = self.config.element;
        var sidesContainer = mainContainer.querySelector('.js-sides-container');
        var cells = sidesContainer.querySelectorAll('.day');
        var cellsArr = Array.prototype.slice.call(cells);

        cellsArr.forEach(function(cell) {
            var cellTimestamp = parseInt(cell.getAttribute('data-timestamp'), 10);
            var start = self.fragmentsManager.selectedDateRange.start;

            if (cellTimestamp < timestamp && cellTimestamp > start) {
                cell.classList.add('hovered');
            }
            else if (cellTimestamp > timestamp && cellTimestamp < start) {
                cell.classList.add('hovered');
            }
            else {
                cell.classList.remove('hovered');
            }
        });
    };

    function fadeIn(el, speed) {
        var elementOpacity = el.style.opacity ? parseInt(el.style.opacity, 10) : 0;
        var last = +new Date();
        var animationSpeed = typeof speed !== 'undefined' ? speed : 400;
        var FPS = 16;

        el.classList.remove('hide');

        var tick = function() {
            elementOpacity += (new Date() - last) / animationSpeed;
            last = +new Date();

            el.style.opacity = elementOpacity;

            if (+el.style.opacity < 1) {

                (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, FPS);
            }
        };

        tick();
    }

    function fadeOut(el, speed) {
        var elementOpacity = el.style.opacity ? parseInt(el.style.opacity, 10) : 0;
        var last = +new Date();
        var animationSpeed = typeof speed !== 'undefined' ? speed : 400;
        var FPS = 16;

        var tick = function() {
            elementOpacity -= (new Date() - last) / animationSpeed;
            last = +new Date();

            el.style.opacity = elementOpacity;

            if (+el.style.opacity > 0) {
                (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, FPS);
            }
            else {
                el.classList.add('hide')
            }
        };

        tick();
    }

    document.addEventListener('click', function(e) {
        var element = e.target;

        if (element) {
            var isMainContainerShown = false;
            var mainContainer = document.querySelector('.date-range-container');

            for (element; element != document.body && element.parentNode; element = element.parentNode) {
                if (element.classList.contains('has-date-range-picker') || element.classList.contains('js-nav-elem')) {
                    isMainContainerShown = true;
                    break;
                }
            }

            if (!isMainContainerShown) {
                fadeOut(mainContainer);
            }
            else {
                fadeIn(mainContainer);
            }
        }
    });

    Calendar.fn.destroy = function() {
        var self = this;
        var input = self.config.input;

        input.removeEventListener('click', self.eventHandler);
        input.classList. remove('has-date-range-picker');
    };

    return Calendar;
}));