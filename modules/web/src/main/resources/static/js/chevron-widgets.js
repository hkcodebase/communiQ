var ChevronWidgetsScript = function () {
    var variable = {
        url_export_chevron_report: contextPath + "/export-chevron-report",
        url_download_report: contextPath + "/download-report?fileName=",
        milestonesList: [],
        filterApplied: {},
        data: [],
        isFirstTimeLoad: true,
        color: {
            non_compliant: 'orange',
            in_compliance: 'green',
            unknown: 'grey'
        }
    };

    var selector = {
        chevron_report_title: '#chevronReportTitle',
        chevron_grid_wrap: ".chevron-grid-wrap",
        chevron_grid: "#chevronGrid",
        chevron_compliance_grid: "#chevronComplianceGrid",
        chevron_report_export_outer_wrap: "#chevronReportExportOuterWrap",
        chevron_wrap: "#chevron-wrap"
    };

    var fn = {
        init: function () {
            fn.initFlagReportExportButton();
        },
        bindAllWidgets: function (dataList, filter) {
            dataList = dataList || [];
            variable.filterApplied = filter;

            //Apply the other filters.
            var filteredData = fn.filterStudyDataForChart(dataList, filter);

            var data = fn.transposeDataForChevron(filteredData);

            if (filter.product && filter.product.length === 1 && filter.ccdsVersion && filter.ccdsVersion.length === 1) {
                //if single filter selected 
                $(selector.chevron_report_title).text(filter.product + ' ' + filter.ccdsVersion + ': Implementation');
                fn.renderChevronGrid(data);
            }
            else {
                //else for multiple selection
                $(selector.chevron_report_title).text("Chevron report by Product and CCDS Version: Implementation");
                fn.renderChevronCompliance(data);
            }
        },
        transposeDataForChevron: function (dataList) {
            var currentDate = new Date();
            //we should try to get the 
            var uniqDataList = _.chain(dataList)
                .orderBy(['product', 'ccdsVersion', 'country'], ['asc', 'asc', 'asc'])
                .uniqWith(function (a, b) {
                    return (a.product === b.product
                        && a.ccdsVersion === b.ccdsVersion
                        && a.country === b.country);
                }).value();

            var resultData = _.filter(uniqDataList, function (data) {
                if (!data.regionalRaCompletedDate && !data.regionalRaSentDate) {
                    //#1
                    //If "Date Implementation Plan completed by Regional RA/Affiliate" is blank 
                    //and
                    //"Date CCDS and Implementation Plan Sent to Regional RA" is blank, 
                    //then "Date Implementation Plan completed by Regional RA/Affiliate" should turn Blue 
                    data.compliantStatus = "Non-Complaint";
                    data.regionalRaCompletedDateColor = variable.color.non_compliant;
                }
                else if (!data.regionalRaCompletedDate && data.regionalRaSentDate && currentDate > new Date().setDate(data.regionalRaSentDate.getDate() + 10)) {
                    //#2
                    //If "Date Implementation Plan completed by Regional RA/Affiliate" is blank 
                    //and 
                    //Today > "Date CCDS and Implementation Plan Sent to Regional RA" + 10days = COLORONE, 
                    //then "Date Implementation Plan completed by Regional RA/Affiliate"  should turn Orange
                    data.compliantStatus = "Non-Complaint";
                    data.regionalRaCompletedDateColor = variable.color.non_compliant;
                }
                else if (data.regionalRaCompletedDate && data.regionalRaSentDate && data.regionalRaCompletedDate > new Date().setDate(data.regionalRaSentDate.getDate() + 10)) {
                    //#3
                    //If "Date Implementation Plan completed by Regional RA/Affiliate" > "Date CCDS and Implementation Plan Sent to Regional RA"+10 days, 
                    //then "Date Implementation Plan completed by Regional RA / Affiliate" should turn Red 
                    data.compliantStatus = "Non-Complaint";
                    data.regionalRaCompletedDateColor = variable.color.non_compliant;
                }
                else if (data.regionalRaCompletedDate && data.regionalRaSentDate && data.regionalRaCompletedDate <= new Date().setDate(data.regionalRaSentDate.getDate() + 10)) {
                    //#4
                    //If "Date Implementation Plan completed by Regional RA/Affiliate" =  "Date CCDS and Implementation Plan Sent to Regional RA" + 10 days, 
                    //then "Date Implementation Plan completed by Regional RA / Affiliate" should turn Green 
                    data.compliantStatus = "In Compliance";
                    data.regionalRaCompletedDateColor = variable.color.in_compliance;
                }
                else {
                    data.regionalRaCompletedDateColor = variable.color.unknown;
                }

                if (!data.actualHaSubmissionDate && !data.localLabelPlannedSubmissionDate) {
                    //#5
                    //If "Actual HA Submission Date"  is blank 
                    //AND 
                    //"Local Label Planned Submission Date" is blank 
                    //then "Actual HA Submission Date" should turn Blue
                    data.compliantStatus = "Non-Complaint";
                    data.actualHaSubmissionDateColor = variable.color.non_compliant;
                }
                else if (!data.actualHaSubmissionDate && data.localLabelPlannedSubmissionDate && new Date().setDate(data.localLabelPlannedSubmissionDate.getDate() + 10) < currentDate) {
                    //#7
                    //If Actual HA Submission Date is blank 
                    //AND(Local Label Planned Submission Date + 10days < today))
                    //then "Actual HA Submission Date" should turn  Orange
                    data.compliantStatus = "Non-Complaint";
                    data.actualHaSubmissionDateColor = variable.color.non_compliant;
                }
                else if (data.actualHaSubmissionDate && data.localLabelPlannedSubmissionDate && data.actualHaSubmissionDate > data.localLabelPlannedSubmissionDate) {
                    //#8
                    //If Actual HA Submission Date > Local Label Planned Submission Date
                    //then "Actual HA Submission Date" should turn  Red
                    data.compliantStatus = "Non-Complaint";
                    data.actualHaSubmissionDateColor = variable.color.non_compliant;
                }
                else if (data.actualHaSubmissionDate && data.localLabelPlannedSubmissionDate && data.actualHaSubmissionDate <= data.localLabelPlannedSubmissionDate) {
                    //#10
                    //If Actual HA Submission Date =(Local Label Planned Submission Date) 
                    //then "Actual HA Submission Date" should turn  Green
                    data.compliantStatus = "In Compliance";
                    data.actualHaSubmissionDateColor = variable.color.in_compliance;
                }
                else {
                    data.actualHaSubmissionDateColor = variable.color.unknown;
                }

                if (!data.localLabelApprovalDate) {
                    //#11
                    //If Date of Local Label Approval is blank 
                    //then "Date of Local Label Approval" should turn is Blue
                    data.compliantStatus = "Non-Complaint";
                    data.localLabelApprovalDateColor = variable.color.non_compliant;
                }
                else {
                    data.localLabelApprovalDateColor = variable.color.unknown;
                }

                if (!data.localLabelChangePublicDistributionDate && data.localLabelApprovalDate && new Date().setDate(data.localLabelApprovalDate.getDate() + 30) < currentDate) {
                    //#12
                    //If "Date of Distribution of Local Labeling Change to Public" is blank 
                    //AND(Date of Local Label Approval + 30 days < today), 
                    //then Date of Distribution of Local Labeling Change to Public  Orange
                    data.compliantStatus = "Non-Complaint";
                    data.localLabelChangePublicDistributionDateColor = variable.color.non_compliant;
                }
                else if (data.localLabelChangePublicDistributionDate && data.localLabelApprovalDate && data.localLabelChangePublicDistributionDate > new Date().setDate(data.localLabelApprovalDate.getDate() + 30)) {
                    //#13
                    //If "Date of Distribution of Local Labeling Change to Public" > (Date of Local Label Approval + 30 days) 
                    //then Date of Distribution of Local Labeling Change to Public should turn Red 
                    data.compliantStatus = "Non-Complaint";
                    data.localLabelChangePublicDistributionDateColor = variable.color.non_compliant;
                }
                else if (data.localLabelChangePublicDistributionDate && data.localLabelApprovalDate && data.localLabelChangePublicDistributionDate <= new Date().setDate(data.localLabelApprovalDate.getDate() + 30)) {
                    //#14
                    //If "Date of Distribution of Local Labeling Change to Public" = (Date of Local Label Approval + 30 days)  
                    //then Date of Distribution of Local Labeling Change to Public should turn Green
                    data.compliantStatus = "In Compliance";
                    data.localLabelChangePublicDistributionDateColor = variable.color.in_compliance;
                }
                else {
                    data.localLabelChangePublicDistributionDateColor = variable.color.unknown;
                }

                return true;
            });
            return resultData;
        },
        renderChevronGrid: function (data) {
            var dataList = fn.clone(data);
            dataList = _.filter(dataList, function (item) {
                if (item.ccdsEffectiveDate)
                    item.ccdsEffectiveDate = moment(item.ccdsEffectiveDate).format(global_config.defaultDateFormat);

                if (item.regionalRaCompletedDate)
                    item.regionalRaCompletedDate = moment(item.regionalRaCompletedDate).format(global_config.defaultDateFormat);

                if (item.localLabelPlannedSubmissionDate)
                    item.localLabelPlannedSubmissionDate = moment(item.localLabelPlannedSubmissionDate).format(global_config.defaultDateFormat);

                if (item.actualHaSubmissionDate)
                    item.actualHaSubmissionDate = moment(item.actualHaSubmissionDate).format(global_config.defaultDateFormat);

                if (item.localLabelApprovalDate)
                    item.localLabelApprovalDate = moment(item.localLabelApprovalDate).format(global_config.defaultDateFormat);

                if (item.localLabelChangePublicDistributionDate)
                    item.localLabelChangePublicDistributionDate = moment(item.localLabelChangePublicDistributionDate).format(global_config.defaultDateFormat);

                return true;
            });

            var compliance = fn.calculateCompliance(dataList);

            dataList = _.orderBy(dataList, "country", "asc");
            var viewData = {
                data: dataList,
                compliance: compliance
            };
            var template = $.templates(selector.chevron_grid);
            var templateOutput = $(template.render(viewData));
            $(selector.chevron_grid_wrap).empty().append(templateOutput);
        },
        renderChevronCompliance: function (data) {

            //Gloabal couter to calculate compliance total and length of list
            var total_compliance = {
                regionalRaCompleted_incompliance: 0,
                regionalRaCompleted_cnt: 0,
                actualHaSubmission_incompliance: 0,
                actualHaSubmission_cnt: 0,
                localLabelChangePublicDistribution_incompliance: 0,
                localLabelChangePublicDistribution_cnt: 0
            };

            var dataList = _.chain(data).groupBy(function (data) { return data.product + '-' + data.ccdsVersion; }).map(function (item, key) {
                var product_ccdsVersion_compliance = fn.calculateCompliance(item); //Calculated group by products compliance
                product_ccdsVersion_compliance.product_ccdsVersion = key;

                //Calculating total compliance
                total_compliance.regionalRaCompleted_incompliance += product_ccdsVersion_compliance.total_comliance.regionalRaCompleted_incompliance;
                total_compliance.regionalRaCompleted_cnt += product_ccdsVersion_compliance.total_comliance.regionalRaCompleted_cnt;

                total_compliance.actualHaSubmission_incompliance += product_ccdsVersion_compliance.total_comliance.actualHaSubmission_incompliance;
                total_compliance.actualHaSubmission_cnt += product_ccdsVersion_compliance.total_comliance.actualHaSubmission_cnt;

                total_compliance.localLabelChangePublicDistribution_incompliance += product_ccdsVersion_compliance.total_comliance.localLabelChangePublicDistribution_incompliance;
                total_compliance.localLabelChangePublicDistribution_cnt += product_ccdsVersion_compliance.total_comliance.localLabelChangePublicDistribution_cnt;

                return product_ccdsVersion_compliance;
            }).value();

            //For footer compliance total per
            var footer_compliance = {
                regionalRaCompleted: 0,
                actualHaSubmission: 0,
                localLabelChangePublicDistribution: 0
            };
            footer_compliance.regionalRaCompleted = _.round(((total_compliance.regionalRaCompleted_incompliance / total_compliance.regionalRaCompleted_cnt) * 100), 2);
            if (_.isNaN(footer_compliance.regionalRaCompleted))
                footer_compliance.regionalRaCompleted = 0;

            footer_compliance.actualHaSubmission = _.round(((total_compliance.actualHaSubmission_incompliance / total_compliance.actualHaSubmission_cnt) * 100), 2);
            if (_.isNaN(footer_compliance.actualHaSubmission))
                footer_compliance.actualHaSubmission = 0;

            footer_compliance.localLabelChangePublicDistribution = _.round(((total_compliance.localLabelChangePublicDistribution_incompliance / total_compliance.localLabelChangePublicDistribution_cnt) * 100), 2);
            if (_.isNaN(footer_compliance.localLabelChangePublicDistribution))
                footer_compliance.localLabelChangePublicDistribution = 0;

            var viewData = {
                data: dataList,
                compliance: footer_compliance
            };
            var template = $.templates(selector.chevron_compliance_grid);
            var templateOutput = $(template.render(viewData));
            $(selector.chevron_grid_wrap).empty().append(templateOutput);
        },
        calculateCompliance: function (dataList) {
            //calculation for compliance total
            var comliance = {
                regionalRaCompleted: 0,
                regionalRaCompletedColor: variable.color.non_compliant,
                actualHaSubmission: 0,
                actualHaSubmissionColor: variable.color.non_compliant,
                localLabelChangePublicDistribution: 0,
                localLabelChangePublicDistributionColor: variable.color.non_compliant
            };

            var total_comliance = {
                regionalRaCompleted_incompliance: 0,
                regionalRaCompleted_cnt: 0,
                actualHaSubmission_incompliance: 0,
                actualHaSubmission_cnt: 0,
                localLabelChangePublicDistribution_incompliance: 0,
                localLabelChangePublicDistribution_cnt: 0
            };

            //(%)Per calculation for regionalRaCompleted
            var cnt_regionalRaCompleted_Compliance = 0;
            var regionalRaCompletedList = _.filter(dataList, function (data) {
                if (data.regionalRaCompletedDateColor && data.regionalRaCompletedDateColor !== variable.color.unknown) {
                    if (data.regionalRaCompletedDateColor === variable.color.in_compliance) {
                        cnt_regionalRaCompleted_Compliance += 1;
                    }
                    return true;
                }
                return false;
            });
            total_comliance.regionalRaCompleted_incompliance = cnt_regionalRaCompleted_Compliance;
            total_comliance.regionalRaCompleted_cnt = regionalRaCompletedList.length || 0;

            if (regionalRaCompletedList && regionalRaCompletedList.length) {
                comliance.regionalRaCompleted = _.round(((cnt_regionalRaCompleted_Compliance / regionalRaCompletedList.length) * 100), 2);
                if (comliance.regionalRaCompleted > 0)
                    comliance.regionalRaCompletedColor = variable.color.in_compliance;
            }

            //(%)Per calculation for actualHaSubmission
            var cnt_actualHaSubmissionDate_Compliance = 0;
            var actualHaSubmissionDateList = _.filter(dataList, function (data) {
                if (data.actualHaSubmissionDateColor && data.actualHaSubmissionDateColor != variable.color.unknown) {
                    if (data.actualHaSubmissionDateColor === variable.color.in_compliance) {
                        cnt_actualHaSubmissionDate_Compliance += 1;
                    }
                    return true;
                }
                return false;
            });
            total_comliance.actualHaSubmission_incompliance = cnt_actualHaSubmissionDate_Compliance;
            total_comliance.actualHaSubmission_cnt = actualHaSubmissionDateList.length || 0;

            if (actualHaSubmissionDateList && actualHaSubmissionDateList.length) {
                comliance.actualHaSubmission_cnt = actualHaSubmissionDateList.length;
                comliance.actualHaSubmission = _.round(((cnt_actualHaSubmissionDate_Compliance / actualHaSubmissionDateList.length) * 100), 2);
                if (comliance.actualHaSubmission > 0)
                    comliance.actualHaSubmissionColor = variable.color.in_compliance;
            }

            //(%)Per calculation for localLabelChangePublicDistributionDate
            var cnt_localLabelChangePublicDistributionDate_Compliance = 0;
            var localLabelChangePublicDistributionDateList = _.filter(dataList, function (data) {
                if (data.localLabelChangePublicDistributionDateColor && data.localLabelChangePublicDistributionDateColor != variable.color.unknown) {
                    if (data.localLabelChangePublicDistributionDateColor === variable.color.in_compliance) {
                        cnt_localLabelChangePublicDistributionDate_Compliance += 1;
                    }
                    return true;
                }
                return false;
            });
            total_comliance.localLabelChangePublicDistribution_incompliance = cnt_localLabelChangePublicDistributionDate_Compliance;
            total_comliance.localLabelChangePublicDistribution_cnt = localLabelChangePublicDistributionDateList.length || 0;

            if (localLabelChangePublicDistributionDateList && localLabelChangePublicDistributionDateList.length) {
                comliance.localLabelChangePublicDistributionn_cnt = localLabelChangePublicDistributionDateList.length;
                comliance.localLabelChangePublicDistribution = _.round(((cnt_localLabelChangePublicDistributionDate_Compliance / localLabelChangePublicDistributionDateList.length) * 100), 2);
                if (comliance.localLabelChangePublicDistribution > 0)
                    comliance.localLabelChangePublicDistributionColor = variable.color.in_compliance;
            }

            comliance.total_comliance = total_comliance;
            return comliance;
        },

        //Export
        initFlagReportExportButton: function () {
            var chevronReportPrintButton = $(".chevronReportPrintButton", selector.chevron_report_export_outer_wrap);
            chevronReportPrintButton.click(function () {
                fn.doChevronReportPrint.call(this);
                return false;
            });
        },
        doChevronReportPrint: function () {
            var _this = $(this);
            var fileType = _this.data('export-format') || _this.attr('data-export-format');
            var outputFileName = _this.data('export-file-name') || _this.attr('export-file-name');
            var pages = [];
            var filters = fn.clone(variable.filterApplied);

            var chartItems = $(selector.chevron_grid_wrap + " ul.grid");
            var footer = $(selector.chevron_wrap + ' ul.footer');

            var phTitleVal = $(selector.chevron_report_title).text();
            var phTitle = { name: "<%title_area_html%>", value: phTitleVal };
            var phHeader = { name: "<%header_area_html%>", value: $(selector.chevron_wrap + ' #header').html() };

            var phFooter = '';
            if (footer.length)
                phFooter = footer[0].outerHTML;

            var htmlHeight = 600;

            var chevronHtml = "";
            var totalRecords = chartItems.length;
            currentRecordIndex = 1;
            var noOfRecordsPerPage = 8; //Number of records per page

            if (fileType === "pdf")
                noOfRecordsPerPage = 15;

            chartItems.each(function () {
                var _this = $(this);
                chevronHtml = chevronHtml.concat(_this[0].outerHTML);
                if ((currentRecordIndex !== 1 && currentRecordIndex % noOfRecordsPerPage === 0) || (currentRecordIndex === totalRecords && totalRecords > noOfRecordsPerPage)) {
                    //Appending footer into last index
                    if (currentRecordIndex === totalRecords) {
                        chevronHtml = chevronHtml.concat(phFooter);
                    }

                    //Adding NoOfRecords into page with header
                    var phReportContent = { name: "<%chart_area_html%>", value: chevronHtml };
                    var phHtmlHeight = { name: "<%html_height%>", value: htmlHeight };
                    var page = {
                        inputTemplateFileName: "chevron.html",
                        placeholders: [phTitle, phHeader, phReportContent, phHtmlHeight]
                    };
                    pages.push(page);
                    chevronHtml = "";
                }
                currentRecordIndex += 1;
            });

            if (totalRecords <= noOfRecordsPerPage) {
                chevronHtml = chevronHtml.concat(phFooter);
                var phReportContent = { name: "<%chart_area_html%>", value: chevronHtml };
                var phHtmlHeight = { name: "<%html_height%>", value: htmlHeight };
                var page = {
                    inputTemplateFileName: "chevron.html",
                    placeholders: [phTitle, phHeader, phReportContent, phHtmlHeight]
                };
                pages.push(page);
            }

            //TODO: Do one last page for filter
            var postData = {
                type: fileType,
                outputFileName: outputFileName,
                filters: null,
                pages: pages
            };

            fn.showAjaxLoader();
            ods.remoting.executePost(variable.url_export_chevron_report, "JSON", JSON.stringify(postData), "application/json; charset=utf-8", false, false, function (response) {
                fn.hideAjaxLoader();
                var filePath = response;
                var downloadUrl = variable.url_download_report + encodeURIComponent(filePath);
                window.open(downloadUrl); //iframe method can be used to popup buster
            }, function (status, err) {
                fn.hideAjaxLoader();
                alert("An unknown error occoured during exporting.");
            });
            return false;
        },

        //Filters
        filterStudyDataForChart: function (data, filter) {
            var gdfilterByApplied = {};
            var gdtempFilterApplied = filter;
            var filterDefinitions = {
                "product": "product",
                "ccdsVersion": "ccdsVersion",
            }
            $.each(gdtempFilterApplied, function (index, value) {
                if (Object.keys(filterDefinitions).indexOf(index) == -1) {
                    return;
                }
                if (value.length == 0) {
                    var deselectAll = [];
                    deselectAll.push("~");
                    gdfilterByApplied[filterDefinitions[index]] = deselectAll;

                } else {
                    gdfilterByApplied[filterDefinitions[index]] = value;
                }
            });
            var result = fn.filterData(data, gdfilterByApplied);
            return result;
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
            if (data instanceof Array) {
                return _.values($.extend(true, {}, data, settings));
            }
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
        bindAllWidgets: function (milestonesList, filter) {
            fn.bindAllWidgets(milestonesList, filter);
        }
    };
}();

$(function () {
    ChevronWidgetsScript.init();
});