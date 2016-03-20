;(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(function() { return factory() });
    }
    else if (typeof exports !== 'undefined' && typeof module === 'object') {
        module.exports = factory();
    }
    else if (typeof window.DateRangePicker === 'undefined' || typeof window.DateRangePicker !== 'function') {
        root.DateRangePicker = factory();
    }

}(this, function() {

    var dateHelper = {
        getNumberDaysInMonth: function(month, year) {
            var date = new Date();
            var currentYear = typeof year !== 'undefined' ?  year : date.getFullYear();
            var currentMonth = typeof month !== 'undefined' ? month : date.getMonth();

            return new Date(currentYear, currentMonth + 1, 0).getDate();
        },
        formatDate: function(timestamp) {
            var year = new Date(timestamp).getFullYear();
            var month = new Date(timestamp).getMonth();
            var monthName = defaultConfig.monthNames[month];
            var day = new Date(timestamp).getDate();

            return day + ' ' + monthName + ' ' + year;
        }
    };

    function $(selector, scope) {
        var currentScope = document;

        if (typeof scope !== 'undefined') {
            if (Array.isArray(scope)) {
                currentScope = scope[0];
            }
            else {
                currentScope = scope;
            }
        }

        var elements = currentScope.querySelectorAll(selector);

        return Array.prototype.slice.call(elements);
    }

    $.createElement = function(elemName) {
        var elementName = elemName || 'div';

        return document.createElement(elementName);
    };

    var defaultConfig = {
        LAST_MONTH_INDEX: 11,
        input: null,
        element: null,
        elementSelector: '.js-drp-input',
        calendarContainer: '.js-drp-container',
        year: new Date().getFullYear(),
        month: new Date().getMonth(),
        fragmentsNumber: 2,
        daysPerWeek: 7,
        daysNames: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    };

    var messages = {
        error: 'this month already exist'
    };

    function extendConfig(customConf) {
        var configExtended = defaultConfig;

        if (typeof customConf !== 'undefined') {
            configExtended = {};

            for (var prop in defaultConfig) {
                if (defaultConfig.hasOwnProperty(prop)) {
                    if (customConf[prop]) {
                        configExtended[prop] = customConf[prop];
                    }
                    else {
                        configExtended[prop] = defaultConfig[prop];
                    }
                }
            }
        }

        return configExtended;
    }

    var FragmentsManager = function(data) {
        this.parent = data.parent;
        this.fragments = {};

        this.selectedDateRange = {
            start: null,
            end: null
        };
    };

    var FM = FragmentsManager;

    FM.fn = FM.prototype;

    FM.fn.initMonthSwitchingEvent = function(elem) {
        var self = this;
        var arrows = $('.js-nav-elem', elem);

        arrows.forEach(function(arrow) {
            arrow.addEventListener('click', function(e) {
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
                    nextMonth = defaultConfig.LAST_MONTH_INDEX;
                }
                else if (nextMonth > defaultConfig.LAST_MONTH_INDEX) {
                    nextYear = currentYear + 1;
                    nextMonth = 0;
                }

                self.updateFragment({
                    year: currentYear,
                    nextYear: nextYear,
                    monthIndex: month,
                    nextMonthIndex: nextMonth
                });

                self.toggleArrows();
            });
        });
    };

    FM.fn.toggleArrows = function() {
        var self = this;
        var mainContainer = self.parent.config.element;
        var sides = $('.js-side', mainContainer);

        sides.forEach(function(element) {
            var nextSibling = element.nextSibling;
            var previousSibling = element.previousSibling;

            var currentMonthIndex = +element.getAttribute('data-month');
            var currentYearIndex = +element.getAttribute('data-year');

            if (nextSibling) {
                var nextSiblingMonthIndex = +nextSibling.getAttribute('data-month');
                var nextSiblingYearIndex = +nextSibling.getAttribute('data-year');
                var monthsDiffRight = nextSiblingMonthIndex - currentMonthIndex;
                var yearsDiffRight = nextSiblingYearIndex - currentYearIndex;

                if (monthsDiffRight === 1 && yearsDiffRight === 0 || monthsDiffRight === -defaultConfig.LAST_MONTH_INDEX) {
                    var elemArrowRight = $('.js-nav-right', element)[0];

                    elemArrowRight.classList.add('invisible');
                }
                else {
                    var nextSiblingArrowLeft = $('.js-nav-left', nextSibling)[0];

                    nextSiblingArrowLeft.classList.remove('invisible');
                }
            }

            if (previousSibling) {
                var previousSiblingMonthIndex = +previousSibling.getAttribute('data-month');
                var previousSiblingYearIndex = +previousSibling.getAttribute('data-year');
                var monthsDiffLeft = currentMonthIndex - previousSiblingMonthIndex;
                var yearsDiffLeft = currentYearIndex - previousSiblingYearIndex;

                if (monthsDiffLeft === 1 && yearsDiffLeft === 0 || monthsDiffLeft === -defaultConfig.LAST_MONTH_INDEX) {
                    var elemArrowLeft = $('.js-nav-left', element)[0];

                    elemArrowLeft.classList.add('invisible');
                }
                else {
                    var previousSiblingArrowRight = $('.js-nav-right', previousSibling)[0];

                    previousSiblingArrowRight.classList.remove('invisible');
                }
            }
        });
    };

    FM.fn.renderAllFragments = function() {
        var self = this;
        var mainContainer = self.parent.config.element;
        var sidesContainer = $('.js-sides-container', mainContainer)[0];
        var index;

        self.parent.config.element.style.opacity = 0;

        for (index in self.fragments) {
            if (self.fragments.hasOwnProperty(index)) {
                var fragment = self.fragments[index].fragmentHtml;

                sidesContainer.appendChild(fragment);

                self.initListeners(fragment);
            }
        }

        self.toggleArrows();
    };

    FM.fn.renderFragment = function(fragmentIndex) {
        var self = this;

        if (typeof fragmentIndex !== 'undefined') {
            var calendarObj = self.fragments[fragmentIndex];
            var mainContainer = self.parent.config.element;
            var container = $(calendarObj.containerClassName, mainContainer)[0];

            container.innerHTML = '';
            container.setAttribute('data-month', calendarObj.index);
            container.setAttribute('data-year', calendarObj.year);
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
        var container = $.createElement();
        var tableCaption = self.parent.fragmentsFactory.createTableCaption(nextMonthIndex, nextYear);
        var calendarHtml = self.parent.fragmentsFactory.creteFragment(nextMonthIndex, nextYear);

        container.classList.add('display-table-cell');

        container.appendChild(tableCaption);
        container.appendChild(calendarHtml);

        if (typeof self.fragments[nextYear + '-' + nextMonthIndex] !== 'undefined') {
            console.error(messages.error);
        }
        else  {
            var currentFragmentIndex = currentYear + '-' + monthIndex;
            var nextFragmentIndex = nextYear + '-' + nextMonthIndex;

            currentCalendar.year = nextYear;
            currentCalendar.index = nextMonthIndex;
            currentCalendar.name = self.parent.config.monthNames[nextMonthIndex];
            currentCalendar.fragmentHtml = container;

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
        var tbody = $('tbody', elem)[0];

        tbody.addEventListener('click', function(e) {
            var target = e.target;
            var classListArr = Array.prototype.slice.call(target.classList);

            if (classListArr.indexOf('day') >= 0) {
                var timestamp = parseInt(target.getAttribute('data-timestamp'), 10);

                if (classListArr.indexOf('selected') >= 0) {
                    self.updateDateRange(timestamp);

                    target.classList.remove('selected');

                    self.resetInput();
                }
                else {
                    self.resetDateRange();
                    self.setDateRange(timestamp);

                    target.classList.add('selected');
                }

                self.showDateRange();
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
        var startLabelTxt = 'Start: ';
        var endLabelTxt = ' End: ';

        self.resetInput();

        if (start) {
            input.value = startLabelTxt + dateHelper.formatDate(start);
        }

        if (end) {
            input.value += endLabelTxt + dateHelper.formatDate(end);
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
            var sidesContainer = $('.js-sides-container', mainContainer);
            var selectedDays = $('.selected', sidesContainer);
            var hoveredDays = $('.hovered', sidesContainer);

            selectedDays.forEach(function(cell) {
                cell.classList.remove('selected');
            });

            hoveredDays.forEach(function(cell) {
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

    var FragmentsFactory = function(data) {
        this.parent = data.parent;
    };

    var FF = FragmentsFactory;

    FF.fn = FF.prototype;

    FF.fn.createTableCaption = function(month, year) {
        var self = this;
        var currentMonth = typeof month !== 'undefined' ? month : self.parent.month;
        var currentYear = typeof year !== 'undefined' ? year : self.parent.year;
        var monthName = self.parent.config.monthNames[currentMonth];

        var tableCaption = $.createElement();
        var tableCaptionInner = $.createElement();

        tableCaption.classList.add('drp-caption');
        tableCaptionInner.classList.add('display-table', 'parent-size');

        var middleCell = $.createElement();
        var middleCellTxt = document.createTextNode(monthName + ' ' + currentYear);

        middleCell.classList.add('bold', 'display-table-cell', 'vertical-align-middle');
        middleCell.appendChild(middleCellTxt);

        function createArrows(type) {
            var cellContainer = $.createElement();
            var arrowsContainer = $.createElement();
            var arrow = $.createElement();
            var circle = $.createElement();
            var iconClass = 'drp-svg-arrow-right';
            var state = 'next';
            var align = 'align-right';

            if (type === 'left') {
                iconClass = 'drp-svg-arrow-left';
                state =  'prev';
                align = 'align-left';
            }

            cellContainer.classList.add(align, 'display-table-cell', 'vertical-align-middle');
            arrowsContainer.classList.add('js-nav-elem', 'js-nav-' + type, 'drp-arrows-container', 'display-inline-block', 'relative');

            arrow.classList.add(iconClass, 'parent-size', 'absolute');
            circle.classList.add('drp-svg-circle', 'parent-size', 'absolute');

            arrowsContainer.setAttribute('data-month', currentMonth);
            arrowsContainer.setAttribute('data-state', state);
            arrowsContainer.setAttribute('data-year', currentYear);

            arrowsContainer.appendChild(arrow);
            arrowsContainer.appendChild(circle);

            cellContainer.appendChild(arrowsContainer);

            return cellContainer;
        }

        var leftCell = createArrows('left');
        var rightCell = createArrows('right');

        tableCaptionInner.appendChild(leftCell);
        tableCaptionInner.appendChild(middleCell);
        tableCaptionInner.appendChild(rightCell);

        tableCaption.appendChild(tableCaptionInner);

        return tableCaption;
    };

    FF.fn.creteFragment = function(month, year) {
        var self = this;
        var currentMonth = typeof month !== 'undefined' ? month : self.parent.month;
        var currentYear = typeof year !== 'undefined' ? year : self.parent.year;
        var table = $.createElement('table');
        var daysPerWeek = self.parent.config.daysPerWeek;
        var daysNames = self.parent.config.daysNames;

        table.classList.add('drp-table', 'fixed-table-layout', 'parent-width', 'txt-align-center');

        function createTableHeader() {
            var tableHeader = $.createElement('thead');
            var row = $.createElement('tr');

            tableHeader.classList.add('drp-thead');

            daysNames.forEach(function(dayName) {
                var cell = $.createElement('td');
                var text = document.createTextNode(dayName);

                cell.appendChild(text);
                row.appendChild(cell);
            });

            tableHeader.appendChild(row);

            return tableHeader;
        }

        function createTableBody() {
            var tableBody = $.createElement('tbody');
            var daysInMonth = dateHelper.getNumberDaysInMonth(currentMonth, currentYear);
            var startCounter = 0;
            var daysCounter = 1;
            var dayIndex = new Date(currentYear, currentMonth, 1).getDay();
            var dayIndexShifted = (dayIndex === 0) ? 6 : dayIndex - 1;
            var firstDay = daysNames[dayIndexShifted];
            var startIndex = daysNames.indexOf(firstDay);
            var weeksCounter = Math.ceil((daysInMonth + startIndex)/daysPerWeek);

            function createCells() {
                var cells = document.createDocumentFragment();
                var dayIndex = 0;
                var cell;
                var text;

                for (dayIndex; dayIndex < daysPerWeek; dayIndex++) {
                    if (daysCounter <= daysInMonth) {
                        cell = $.createElement('td');
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
                    row = $.createElement('tr');
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

        var tableWrapper = $.createElement();

        tableWrapper.classList.add('drp-table-wrapper');

        table.appendChild(createTableHeader());
        table.appendChild(createTableBody());

        tableWrapper.appendChild(table);
        tableWrapper.appendChild(table);

        return tableWrapper;
    };

    FF.fn.creteFragmentContainer = function(month, year) {
        var container = $.createElement();
        var sideName = '.js-side-' + month;

        container.classList.add(sideName.slice(1), 'js-side', 'drp-side', 'display-table-cell');
        container.setAttribute('data-month', month);
        container.setAttribute('data-year', year);

        return container;
    };

    var DateRangePicker = function(config) {
        var self = this;

        self.config = extendConfig(config);
        self.fragmentsManager = new FragmentsManager({ parent: self });
        self.fragmentsFactory = new FragmentsFactory({ parent: self });

        var elementSelector = self.config.elementSelector || defaultConfig.elementSelector;
        var elements = $(elementSelector);

        function calculatePosition(e) {
            var target = e.target;

            self.config.element.style.top = target.offsetTop + target.offsetHeight  + 'px';
            self.config.element.style.left = target.offsetLeft + 'px';
        }

        function createMainContainer() {
            var mainContainer = $(defaultConfig.calendarContainer)[0];

            if (!mainContainer) {
                mainContainer = $.createElement();
                mainContainer.classList.add(defaultConfig.calendarContainer.slice(1), 'drp-container', 'none-selectable', 'hide');

                document.body.appendChild(mainContainer);
            }

            self.config.element = mainContainer;
        }

        function render() {
            self.month = self.config.month;
            self.year = self.config.year;

            resetCalendarContainer();
            createCalendarContainer();
            initFragments();

            self.fragmentsManager.renderAllFragments();

            initListeners();

            function resetCalendarContainer() {
                self.config.element.innerHTML = '';
            }

            function createCalendarContainer() {
                var mainContainer = self.config.element;
                var field = $.createElement();

                mainContainer.classList.add('js-has-drp');

                field.classList.add('js-sides-container', 'drp-sides-container', 'display-table', 'parent-size');
                mainContainer.appendChild(field);
            }

            function initFragments() {
                var currentMonth = self.month;
                var currentYear = self.year;
                var fragmentsNumber = self.config.fragmentsNumber;

                self.fragmentsManager.fragments = {};

                while (fragmentsNumber--) {
                    var fragmentContainer = self.fragmentsFactory.creteFragmentContainer(currentMonth, currentYear);
                    var container = $.createElement();
                    var tableCaption = self.fragmentsFactory.createTableCaption(currentMonth, currentYear);
                    var table = self.fragmentsFactory.creteFragment(currentMonth, currentYear);

                    container.classList.add('display-table-cell');

                    container.appendChild(tableCaption);
                    container.appendChild(table);

                    fragmentContainer.appendChild(container);

                    self.fragmentsManager.setFragments({
                        year: currentYear,
                        monthIndex: currentMonth,
                        fragmentHtml: fragmentContainer,
                        containerClassName: '.js-side-' + currentMonth
                    });

                    if (currentMonth < defaultConfig.LAST_MONTH_INDEX) {
                        currentMonth++;
                    }
                    else {
                        currentYear++;
                        currentMonth = 0;
                    }
                }
            }

            function initListeners() {
                initCellHoverEffect();
            }

            function initCellHoverEffect() {
                var mainContainer = self.config.element;
                var sidesContainer = $('.js-sides-container', mainContainer)[0];

                sidesContainer.addEventListener('mouseover', function(e) {
                    var start = self.fragmentsManager.selectedDateRange.start;
                    var end = self.fragmentsManager.selectedDateRange.end;

                    if (start && !end) {
                        var target = e.target;
                        var targetClassList = target.classList;
                        var targetClassListArr = Array.prototype.slice.call(targetClassList);

                        if (targetClassListArr.indexOf('day') >= 0) {
                            var timestamp = parseInt(e.target.getAttribute('data-timestamp'), 10);

                            hoverCells(timestamp);
                        }
                    }
                });

                function hoverCells(timestamp) {
                    var mainContainer = self.config.element;
                    var sidesContainer = $('.js-sides-container', mainContainer);
                    var cells = $('.day', sidesContainer);

                    cells.forEach(function(cell) {
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
                }
            }
        }

        createMainContainer();

        elements.forEach(function(element) {
            self.config.input = element;
            self.config.input.classList.add('js-has-drp');

            self.events = function(e) {
                var classList = self.config.input.classList;
                var inputs = $('input.js-has-drp');

                inputs.forEach(function(input) {
                    input.classList.remove('shown');
                });

                if (classList.contains('js-has-drp') && !classList.contains('shown')) {
                    calculatePosition(e);
                    render();
                    self.config.input.classList.add('shown');
                }
            };

            element.addEventListener('click', self.events);
        });

        return this;
    };

    DateRangePicker.prototype.getInterval = function() {
        var self = this;
        var selectedDateRange = self.fragmentsManager.selectedDateRange;

        return {
            start: selectedDateRange.start,
            end: selectedDateRange.end
        }
    };

    DateRangePicker.prototype.destroy = function() {
        var self = this;
        var input = self.config.input;

        input.removeEventListener('click', self.events);
        input.classList.remove('js-has-drp');
    };

    function fadeIn(el, speed) {
        var elementOpacity = el.style.opacity ? parseInt(el.style.opacity, 10) : 0;
        var last = +new Date();
        var defaultSpeed = 400;
        var animationSpeed = typeof speed !== 'undefined' ? speed : defaultSpeed;
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
        var defaultSpeed = 400;
        var animationSpeed = typeof speed !== 'undefined' ? speed : defaultSpeed;
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

    function toggleDateRangePicker(e) {
        var element = e.target;

        if (element) {
            var showMainContainer = false;
            var mainContainer = $(defaultConfig.calendarContainer)[0];

            if (typeof mainContainer !== 'undefined') {
                if (element != document && element != document.body) {
                    while (element) {
                        if (element.classList && (element.classList.contains('js-has-drp') || element.classList.contains('js-nav-elem'))) {
                            showMainContainer = true;
                            break;
                        }

                        element = element.parentNode
                    }
                }

                if (showMainContainer) {
                    fadeIn(mainContainer);
                }
                else {
                    fadeOut(mainContainer);
                }
            }
        }
    }

    document.addEventListener('click', toggleDateRangePicker);

    // TODO: change this return. Needs to process few selectors, so, please, add object wrapper to drp;
    return DateRangePicker;
}));