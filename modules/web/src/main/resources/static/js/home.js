var HomePageScript = function () {
    var variable = {
        url_milestone_data: contextPath + "/get-monitoring-report-data",
        milestones: [],
        masterFilterKeys: ['product', 'country', 'ccdsVersion'],
        masterCollData: {},
        filterApplied: {},
    };
    var selector = {
        filter_start_date: ".filterStartDate",
        filter_end_date: ".filterEndDate",
        last_refreshed_date_time: "#rdTime",
        txt_start_date: "#startDate",
        txt_end_date: "#endDate",
        ddl_project_name: "#projectName-dropdown"
    };

    var fn = {
        init: function () {
            fn.initVariables();
            fn.initDateFilterEvents();
            fn.initDefaultPageValues();
            fn.initFetchPageData();
        },
        initVariables: function () {

        },
        initDefaultPageValues: function () {
            fn.populateDefaultDates();
        },
        populateDefaultDates: function () {
            var startYear = (new Date()).getFullYear();//Current Year
            var endYear = startYear + 0;

            var startDate = moment(startYear + "-01-01").toDate();
            var displayStartDate = moment(startDate).format("MM-DD-YYYY");
            $(selector.txt_start_date).val(displayStartDate);
            var dt = moment(startDate).toDate();
            dt.setDate(dt.getDate() + 1);
            $("#endDate").datepicker("option", "minDate", dt);
            var endDate = moment(endYear + "-12-31").toDate();
            var displayEndDate = moment(endDate).format("MM-DD-YYYY");
            $(selector.txt_end_date).val(displayEndDate);

            $(selector.filter_start_date).text(moment(startDate).format("DD-MMM-YYYY"));
            $(selector.filter_end_date).text(moment(endDate).format("DD-MMM-YYYY"));
        },
        initFetchPageData: function () {
            fn.showAjaxLoader();
            ods.remoting.executeGet(variable.url_milestone_data, "JSON", function (response) {
                var data = response;
                fn.processMonitoringReportData(data);
                variable.milestones = data;
                fn.bindPageData(data);
                fn.hideAjaxLoader();
            }, function (err, x, st) {
                console.log("Error in ajax call:- " + err);
                fn.hideAjaxLoader();
            });
        },
        initDateFilterEvents: function () {
            fn.initDatePickers();
            fn.initResetDateFilters();
        },
        initDatePickers: function () {
            var txtStartDate = $(selector.txt_start_date);
            var txtEndDate = $(selector.txt_end_date);
            txtStartDate.datepicker({
                dateFormat: 'mm-dd-yy',
                changeMonth: true,
                changeYear: true,
                constrainInput: false,
                yearRange: "2000:2035",
                onSelect: function (dateText, inst) {
                    variable.dateFilter = true;
                    var dt = moment(dateText).toDate();
                    dt.setDate(dt.getDate() + 1);
                    txtEndDate.datepicker('option', 'minDate', dt);
                    currentStartDate = txtStartDate.datepicker("getDate");
                    tempStartDate = $.datepicker.formatDate('dd-mmm-yyyy', currentStartDate);
                    $(selector.filter_start_date).text(moment(txtStartDate.val(), "MM-DD-YYYY").format("DD-MMM-YYYY"));
                    $(selector.filter_end_date).text(moment(txtStartDate.val(), "MM-DD-YYYY").format("DD-MMM-YYYY"));

                    doDateFilterChange();
                },
                onClose: function () {
                    $(this).trigger('change');
                }
            });
            txtEndDate.datepicker({
                dateFormat: 'mm-dd-yy',
                changeMonth: true,
                changeYear: true,
                constrainInput: false,
                yearRange: "2000:2035",
                onSelect: function (dateText, inst) {
                    variable.dateFilter = true;
                    var dt = moment(dateText).toDate();
                    dt.setDate(dt.getDate());
                    txtStartDate.datepicker('option', 'maxDate', dt);
                    $(selector.filter_start_date).text(moment(txtStartDate.val(), "MM-DD-YYYY").format("DD-MMM-YYYY"));
                    $(selector.filter_end_date).text(moment(txtEndDate.val(), "MM-DD-YYYY").format("DD-MMM-YYYY"));

                    doDateFilterChange();
                },
                onClose: function () {
                    $(this).trigger('change');
                }
            });
            $("#startDateClick").on("click", function () {
                txtStartDate.focus();
            });
            $("#endDateClick").on("click", function () {
                txtEndDate.focus();
            });

            function doDateFilterChange() {
                fn.applyFilters();
            }
        },
        initResetDateFilters: function () {
            $("#resetBtnDates").on('click', function () {
                fn.populateDefaultDates();
                fn.applyFilters();
            });
        },
        applyFilters: function () {
            //first time call the filter select so that all filters are populated baed on relative-filtering
            var ms = $('#' + variable.masterFilterKeys[0] + '-multiselect');
            fn.doFilersSelectedEvent.call(ms);
        },
        bindPageData: function (dataList) {
            fn.bindLastRefreshDateTime(dataList);
            fn.initBindAndCreateFilters(dataList);
        },
        bindLastRefreshDateTime: function (dataList) {
            if (!dataList || dataList.length == 0) {
                return false;
            }
            if (dataList.length > 0 && dataList[0].refreshDate) {
                var lastRefreshDateTime = moment(dataList[0].refreshDate);
                var displayDate = lastRefreshDateTime.format("DD-MMM-YYYY hh:mm:ss a");
                $(selector.last_refreshed_date_time).text(displayDate);
            }
        },
        processMonitoringReportData: function (dataList) {
            if (!dataList || dataList.length == 0) {
                return;
            }

            //geting key for all the column inside first object;
            var mKeys = Object.keys(dataList[0]);
            //itterating and getting the unique data filter sources
            _.forEach(mKeys, function (value) {
                var tempAll = _.map(dataList, value);
                //For Region we have to split and then take the uniq
                if (value == "region") {
                    tempAll = _(tempAll).flatMap(function (item) {
                        if (item) {
                            return item.split(",");
                        }
                    }).map(function (data) {
                        if (data) {
                            return data.trim();
                        }
                    }).uniq().sort().value();
                }
                tempAll = _.countBy(tempAll);
                variable.masterCollData[value] = tempAll;
            });

            $.each(dataList, function (index, data) {
                //convert all date string values into date data-types
                var dateColumns = ["ccdsEffectiveDate", "localLabelPlannedSubmissionDate", "regionalRaReturnedDate", "regionalRaSentDate", "triggerDate",
                    "actualHaSubmissionDate", "localLabelApprovalDate", "localLabelChangePublicDistributionDate", "regionalRaCompletedDate", "localImplementationDate"];
                $.each(dateColumns, function (index, columnName) {
                    var val = data[columnName];
                    if (val instanceof Date) { } else if (val != null) {
                        data[columnName] = moment(val).toDate();
                    }
                });

                var stringColumns = ["id", "ccdsVersion", "product", "country", "status", "reason", "raManager", "acknowledgementStatus"];
                $.each(stringColumns, function (index, columnName) {
                    var val = data[columnName];
                    if (!val) {
                        data[columnName] = "Unknown";
                    }
                });

                //TODO : unknown column name
            });
        },
        initBindAndCreateFilters: function (studies) {
            var mCollData = variable.masterCollData;
            _.forEach(mCollData, function (mVal, mCollindex) {
                _.forEach(Object.keys(mVal).sort(fn.caseInsensitiveSort), function (chkData, chkIndex) {
                    if (mCollindex == "product") {
                        //This section is the implementaion to append the option with certain attributes to all the filters on the right side
                        $('#product-multiselect').append($('<option>', {
                            value: chkData,
                            text: chkData,
                            class: mCollindex,
                            category: mCollindex
                        }));
                    } else if (mCollindex == "country") {
                        $('#country-multiselect').append($('<option>', {
                            value: chkData,
                            text: chkData,
                            class: mCollindex,
                            category: mCollindex

                        }));
                    } else if (mCollindex == "ccdsVersion") {
                        $('#ccdsVersion-multiselect').append($('<option>', {
                            value: chkData,
                            text: chkData,
                            class: mCollindex,
                            category: mCollindex

                        }));
                    }
                });
            });

            //initiate multiselect
            $.each(variable.masterFilterKeys, function (index, filterName) {
                var ms = $('#' + filterName + '-multiselect');
                ms.multiselect({
                    includeSelectAllOption: true,
                    allSelectedText: 'All',
                    numberDisplayed: 2,
                    maxHeight: 300,
                    onChange: function (element, checked) {
                        SelectedCheckboxEvaluation.call(this);
                    },
                    onSelectAll: function () {
                        SelectedCheckboxEvaluation.call(this);
                    },
                    onDeselectAll: function () {
                        SelectedCheckboxEvaluation.call(this);
                    }
                }).multiselect();

                if (filterName == "responsibleAffiliate") {
                    ms.multiselect('select', ['OPDC']);
                }
                else {
                    ms.multiselect('selectAll', false);
                }
                ms.multiselect('updateButtonText');
            });

            function SelectedCheckboxEvaluation() {
                fn.doFilersSelectedEvent.call(this);
            }

            //first time call the filter select so that all filters are populated based on relative-filtering
            var ms = $('#' + variable.masterFilterKeys[0] + '-multiselect');
            fn.doFilersSelectedEvent.call(ms);

        },
        doFilersSelectedEvent: function () {
            var selectElement = this.$select || this;
            var filterName = selectElement.attr('data-filter') || selectElement.data('filter');

            var filters = fn.getFiltersFromUI();
            var startDate = filters.startDate;
            var endDate = filters.endDate;
            var tempFilterConfig = {};

            var filteredList = _.filter(variable.milestones, function (data) {
                //if (data.taskFinishDate
                //    && (data.taskFinishDate >= startDate && data.taskFinishDate <= endDate)
                //) {
                return true;
                //}
                //return false;
            });

            //IMPORTANT: the order of the switch case is very important for relative-filtering
            //There is a scope to make this code generic into a loop based on the list of filters we have.
            switch (filterName) {
                case "product":
                    var nextFilters = ['product'];
                    tempFilterConfig = fn.extractKeys(fn.getFiltersFromUI(), nextFilters);
                    filteredList = fn.populateNextMultiselectFilter("country", tempFilterConfig, filteredList);
                case "country":
                    var nextFilters = ['product', 'country'];
                    tempFilterConfig = fn.extractKeys(fn.getFiltersFromUI(), nextFilters);
                    filteredList = fn.populateNextMultiselectFilter("ccdsVersion", tempFilterConfig, filteredList);
                case "ccdsVersion":
                    var nextFilters = ['product', 'country', 'ccdsVersion']; //keep adding filters
                    tempFilterConfig = fn.extractKeys(fn.getFiltersFromUI(), nextFilters); //update with new filters
                    filteredList = fn.populateNextMultiselectFilter("indication", tempFilterConfig, filteredList);
                default:
            }

            //add back the properties
            tempFilterConfig.startDate = startDate;
            tempFilterConfig.endDate = endDate;

            HomeWidgetsScript.bindAllWidgets(variable.milestones, tempFilterConfig);
        },
        populateNextMultiselectFilter: function (nextFilterName, filterConfig, dataList, defaultSelection) {
            var filteredData = fn.filterData(dataList, filterConfig);
            var distinctItems = _.chain(filteredData)
                .map(nextFilterName)
                .filter(function (data) { return data; }) //filter out empty items
                .uniq().sort().value();

            var ms = $('#' + nextFilterName + '-multiselect');
            ms.multiselect('destroy');
            ms.empty();

            $.each(distinctItems, function (index, data) {
                ms.append($('<option>', {
                    value: data,
                    text: data,
                    'class': nextFilterName,
                    category: nextFilterName,
                    //"selected": "selected"
                }));
            });
            ms.multiselect({
                includeSelectAllOption: true,
                allSelectedText: 'All',
                maxHeight: 300,
                numberDisplayed: 2,
                onChange: function (element, checked) {
                    SelectedCheckboxEvaluation.apply(this, arguments);
                },
                onSelectAll: function () {
                    SelectedCheckboxEvaluation.apply(this, arguments);
                },
                onDeselectAll: function () {
                    SelectedCheckboxEvaluation.apply(this, arguments);
                }
            }).multiselect();

            //if there are some default selections then honor that if they exist in the dropdown
            var selectedValues = distinctItems;
            if (defaultSelection && (defaultSelection instanceof Array) == true) {
                var items = distinctItems || [];
                var exists = _.some(defaultSelection, function (data) {
                    return (items.indexOf(data) >= 0);
                });
                if (exists) {
                    //only if our selected items are in the dropdown then we will select that. otherwise let the default behaviour happen
                    selectedValues = defaultSelection;
                }
            }
            ms.multiselect('select', selectedValues);

            return filteredData;

            function SelectedCheckboxEvaluation(element, checked) {
                fn.doFilersSelectedEvent.apply(this, arguments);
            }
        },
        extractKeys: function (object, keys) {
            var result = _.pickBy(object, function (value, key) {
                return (keys.indexOf(key) >= 0);
            });
            return result;
        },
        getFiltersFromUI: function (filters) {
            filters = filters || variable.masterFilterKeys;
            //logic for handling on chekbox click filters updated filter applied when user cheked  or uncheked chekbox
            function builderFilterObjectFromInputs() {
                var filterApplied = {};
                $.each(filters, function (index, value) {
                    var selectedValues = $('#' + value + '-multiselect option:selected').map(function () {
                        return this.value;
                    }).get();
                    filterApplied[value] = selectedValues;
                });

                //startDate and endDate
                filterApplied.startDate = moment($(selector.txt_start_date).val() + " 00:00:00", "MM-DD-YYYY HH:mm:ss").toDate();
                filterApplied.endDate = moment($(selector.txt_end_date).val() + " 23:59:59", "MM-DD-YYYY HH:mm:ss").toDate();

                return filterApplied;
            }
            variable.filterApplied = builderFilterObjectFromInputs();
            return variable.filterApplied;
        },
        caseInsensitiveSort: function (a, b) {
            var ret = 0;
            a = a.toLowerCase();
            b = b.toLowerCase();
            if (a > b)
                ret = 1;
            if (a < b)
                ret = -1;
            return ret;
        },
        filterData: function (data, filter) {
            //console.log(gdfilterByApplied);
            var gdfilterBy = filter;
            //Main logic for filtering from all the record by passing arry of object filterapplied
            var gdresult = data.filter(function (o) {
                var result = Object.keys(gdfilterBy).every(function (k) {
                    var result = gdfilterBy[k].some(function (f) {
                        if (k == "region") {
                            if (o[k] && o[k].indexOf(f) >= 0) {
                                return true
                            } else { return false }
                        } else { return o[k] === f; }
                    });
                    return result;
                });
                return result;
            });
            return gdresult;
        },
        clone: function (data, settings) {
            settings = settings || {};
            return $.extend(true, {}, data, settings);
        },
        showAjaxLoader: function () {
            $(".ajax-loader").show();
        },
        hideAjaxLoader: function () {
            $(".ajax-loader").hide();
        },

    };
    return {
        init: function () {
            fn.init();
        },
    };
}();

jQuery(document).ready(function ($) {
    $(function () {
        HomePageScript.init();
    });
});
