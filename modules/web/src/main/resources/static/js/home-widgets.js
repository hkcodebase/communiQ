var HomeWidgetsScript = function () {
    var variable = {
        url_export_regulatory_report: contextPath + "/export-regulatory-report",
        url_download_report: contextPath + "/download-report?fileName=",
        milestonesList: [],
        filterApplied: {},
        data: [],
        isFirstTimeLoad: true
    };

    var selector = {
        flag_report_outer_wrap: "#flagReportOuterWrap",
        tmpl_flag_report_wrap: "#tmplFlagReportWrap",
        flag_report_export_outer_wrap: "#flagReportExportOuterWrap",
        regulatory_flag_report_header_legend_wrap: "#regulatoryFlagReportHeaderLegendWrap",
        flag_report_chart_items: ".regulatory-flag-report-chart-item-wrap .regulatory-flag-report-chart-item",
        compliant_charts: ".compliant-charts",
        compliant_child_charts: ".compliant-charts .child-chart",
        acknowledgement_charts: ".acknowledgement-charts",
        acknowledgement_child_charts: ".acknowledgement-charts .child-chart"
    };

    var fn = {
        init: function () {
            fn.initVariables();
            fn.initJsRenderFunctions();
            fn.initFlagReportExportButton();
        },
        initVariables: function () {
        },
        bindAllWidgets: function (dataList, filter) {
            dataList = dataList || [];
            //Clears all the regulatory related widgets so that if the new study doesnt have data it wont ghost-data of previous search
            fn.clearAllWidgets();

            //Apply the other filters.
            var filteredData = fn.filterStudyDataForChart(dataList, filter);

            //Load first tab (which ever is active from html)
            fn.doTabChangeForStatusReport.call(null, filteredData);
            fn.renderTimelineChart(filteredData);

            $(selector.compliant_child_charts).hide();
            $(selector.acknowledgement_child_charts).hide();
            $("ul.flipview-tab-wrap > li > a[data-toggle='tab']").on('shown.bs.tab', function (e) {
                fn.doTabChangeForStatusReport.call(e.target.id, filteredData);
            });
        },
        doTabChangeForStatusReport: function (filteredData, targetTabId) {
            targetTabId = targetTabId || $("ul.flipview-tab-wrap > li > a[data-toggle='tab'].active").attr('id');
            if (targetTabId === 'compliant-tab') {
                fn.doShowComplaintStatusTabReports(filteredData);
            } else if (targetTabId === 'acknowledged-tab') {
                fn.doShowAcknowledgementStatusTabReports(filteredData);
            }
        },

        //Compliant tabs chart
        doShowComplaintStatusTabReports: function (filteredData) {
            $(selector.compliant_charts).show();
            $(selector.acknowledgement_charts).hide();

            var chartData = fn.transposeDataForReport_Compliant(filteredData);
            fn.renderSunburstChart_Compliant(chartData);
            fn.renderSumaryTable_Compliant(chartData.allData);
            fn.renderScatterChart_Complaint(chartData);
        },
        transposeDataForReport_Compliant: function (dataList) {
            var currentDate = new Date();
            var acknowledgementStatusData = _.filter(dataList, function (data) {
                if (!data.regionalRaCompletedDate && !data.regionalRaSentDate) {
                    //#1
                    //If "Date Implementation Plan completed by Regional RA/Affiliate" is blank 
                    //and
                    //"Date CCDS and Implementation Plan Sent to Regional RA" is blank, 
                    //then "Date Implementation Plan completed by Regional RA/Affiliate" should turn Blue 
                    data.compliantStatus = "Non-Complaint";
                    data.compliantColor = "red";
                }
                else if (!data.regionalRaCompletedDate && data.regionalRaSentDate && currentDate > new Date().setDate(data.regionalRaSentDate.getDate() + 10)) {
                    //#2
                    //If "Date Implementation Plan completed by Regional RA/Affiliate" is blank 
                    //and 
                    //Today > "Date CCDS and Implementation Plan Sent to Regional RA" + 10days = COLORONE, 
                    //then "Date Implementation Plan completed by Regional RA/Affiliate"  should turn Orange
                    data.compliantStatus = "Non-Complaint";
                    data.compliantColor = "red";
                }
                else if (data.regionalRaCompletedDate && data.regionalRaSentDate && data.regionalRaCompletedDate > new Date().setDate(data.regionalRaSentDate.getDate() + 10)) {
                    //#3
                    //If "Date Implementation Plan completed by Regional RA/Affiliate" > "Date CCDS and Implementation Plan Sent to Regional RA"+10 days, 
                    //then "Date Implementation Plan completed by Regional RA / Affiliate" should turn Red 
                    data.compliantStatus = "Non-Complaint";
                    data.compliantColor = "red";
                }
                else if (data.regionalRaCompletedDate && data.regionalRaSentDate && data.regionalRaCompletedDate <= new Date().setDate(data.regionalRaSentDate.getDate() + 10)) {
                    //#4
                    //If "Date Implementation Plan completed by Regional RA/Affiliate" =  "Date CCDS and Implementation Plan Sent to Regional RA" + 10 days, 
                    //then "Date Implementation Plan completed by Regional RA / Affiliate" should turn Green 
                    data.compliantStatus = "In Compliance";
                    data.compliantColor = "green";
                }
                else if (!data.actualHaSubmissionDate && !data.localLabelPlannedSubmissionDate) {
                    //#5
                    //If "Actual HA Submission Date"  is blank 
                    //AND 
                    //"Local Label Planned Submission Date" is blank 
                    //then "Actual HA Submission Date" should turn Blue
                    data.compliantStatus = "Non-Complaint";
                    data.compliantColor = "red";
                }
                else if (!data.actualHaSubmissionDate && data.localLabelPlannedSubmissionDate && new Date().setDate(data.localLabelPlannedSubmissionDate.getDate() + 10) < currentDate) {
                    //#7
                    //If Actual HA Submission Date is blank 
                    //AND(Local Label Planned Submission Date + 10days < today))
                    //then "Actual HA Submission Date" should turn  Orange
                    data.compliantStatus = "Non-Complaint";
                    data.compliantColor = "red";
                }
                else if (data.actualHaSubmissionDate && data.localLabelPlannedSubmissionDate && data.actualHaSubmissionDate > data.localLabelPlannedSubmissionDate) {
                    //#8
                    //If Actual HA Submission Date > Local Label Planned Submission Date
                    //then "Actual HA Submission Date" should turn  Red
                    data.compliantStatus = "Non-Complaint";
                    data.compliantColor = "red";
                }
                else if (data.actualHaSubmissionDate && data.localLabelPlannedSubmissionDate && data.actualHaSubmissionDate <= data.localLabelPlannedSubmissionDate) {
                    //#10
                    //If Actual HA Submission Date =(Local Label Planned Submission Date) 
                    //then "Actual HA Submission Date" should turn  Green
                    data.compliantStatus = "In Compliance";
                    data.compliantColor = "green";
                }
                else if (!data.localLabelApprovalDate) {
                    //#11
                    //If Date of Local Label Approval is blank 
                    //then "Date of Local Label Approval" should turn is Blue
                    data.compliantStatus = "Non-Complaint";
                    data.compliantColor = "red";
                }
                else if (!data.localLabelChangePublicDistributionDate && data.localLabelApprovalDate && new Date().setDate(data.localLabelApprovalDate.getDate() + 30) < currentDate) {
                    //#12
                    //If "Date of Distribution of Local Labeling Change to Public" is blank 
                    //AND(Date of Local Label Approval + 30 days < today), 
                    //then Date of Distribution of Local Labeling Change to Public  Orange
                    data.compliantStatus = "Non-Complaint";
                    data.compliantColor = "red";
                }
                else if (data.localLabelChangePublicDistributionDate && data.localLabelApprovalDate && data.localLabelChangePublicDistributionDate > new Date().setDate(data.localLabelApprovalDate.getDate() + 30)) {
                    //#13
                    //If "Date of Distribution of Local Labeling Change to Public" > (Date of Local Label Approval + 30 days) 
                    //then Date of Distribution of Local Labeling Change to Public should turn Red 
                    data.compliantStatus = "Non-Complaint";
                    data.compliantColor = "red";
                }
                else if (data.localLabelChangePublicDistributionDate && data.localLabelApprovalDate && data.localLabelChangePublicDistributionDate <= new Date().setDate(data.localLabelApprovalDate.getDate() + 30)) {
                    //#14
                    //If "Date of Distribution of Local Labeling Change to Public" = (Date of Local Label Approval + 30 days)  
                    //then Date of Distribution of Local Labeling Change to Public should turn Green
                    data.compliantStatus = "In Compliance";
                    data.compliantColor = "green";
                }
                else {
                    data.compliantStatus = "Non-Complaint";
                    data.compliantColor = "red";
                }
                return true;
            });

            var groupByStatus = _.groupBy(acknowledgementStatusData, "compliantStatus");

            var resultData = {
                groupByStatus: groupByStatus,
                allData: acknowledgementStatusData
            };
            return resultData;
        },
        renderSunburstChart_Compliant: function (chartDataObj) {
            // creating pi chart for indication
            var chartData = chartDataObj.allData;
            var list = [];

            var seriesData = _.chain(chartData)
                .groupBy("compliantStatus")
                .each(function (statusData, key) {
                    var groupByStatus = _.chain(statusData).groupBy("country").each(function (countryData, key) {
                        var groupByProduct = _.chain(countryData).groupBy("product").each(function (productData, key) {
                            list.push({
                                id: productData[0].country + "-" + productData[0].product + "-" + productData[0].compliantStatus,
                                parent: productData[0].country + "-" + productData[0].compliantStatus,
                                name: key,
                                value: productData.length,
                                data: productData
                            });
                        }).value();
                        list.push({
                            id: countryData[0].country + "-" + countryData[0].compliantStatus,
                            parent: countryData[0].compliantStatus,
                            name: key,
                            value: countryData.length,
                            data: countryData
                        });
                    }).value();
                    list.push({
                        id: statusData[0].compliantStatus,
                        parent: '0.0', name: key,
                        value: statusData.length,
                        data: statusData
                    });
                }).value();

            seriesData = list;
            seriesData.push({ id: '0.0', parent: '', name: 'Complaint Status', color: "#FFFFFF" });

            //Highcharts.getOptions().colors.splice(0, 0, 'transparent');
            Highcharts.chart('compliant-monitoring-data-sunburst-chart', {
                chart: {
                    height: '100%'
                },
                colors: ["#CCC0DA", "#808080", "#D8E4BC", "#FABF8F"],
                credits: {
                    enabled: false
                },
                title: {
                    text: 'Complaint Status'
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            format: '<b>{point.name}</b><br>{point.percentage:.1f} %',
                            distance: -50,
                            filter: {
                                property: 'percentage',
                                operator: '>',
                                value: 4
                            }
                        }
                    },
                    series: {
                        cursor: 'pointer',
                        point: {
                            events: {
                                click: function (e) {
                                    fn.renderSunburstChildChart_Compliant(this.node);
                                }
                            }
                        }
                    }
                },
                series: [{
                    type: "sunburst",
                    data: seriesData,
                    allowDrillToNode: false,
                    cursor: 'pointer',
                    dataLabels: {
                        format: '{point.name}',
                        filter: {
                            property: 'innerArcLength',
                            operator: '>',
                            value: 16
                        }
                    },
                    levels: [{
                        level: 1,
                        levelIsConstant: false,
                        dataLabels: {
                            filter: {
                                property: 'outerArcLength',
                                operator: '>',
                                value: 64
                            }
                        }
                    }, {
                        level: 2,
                        colorByPoint: true
                    },
                    {
                        level: 3,
                        colorVariation: {
                            key: 'brightness',
                            to: -0.5
                        }
                    }, {
                        level: 4,
                        colorVariation: {
                            key: 'brightness',
                            to: 0.5
                        }
                    }]
                }],
                tooltip: {
                    headerFormat: "",
                    pointFormat: '<b>{point.name}</b> is <b>{point.value}</b>'
                }
            });
        },
        renderSunburstChildChart_Compliant: function (chartDataObj) {
            $(selector.compliant_child_charts).show();
            //Onclick compliant status binding child level nodes
            var parent = { id: chartDataObj.id, parent: '', name: chartDataObj.name, value: chartDataObj.val, color: chartDataObj.color };
            var list = [parent];
            var firstLevelParent = null;
            $.each(chartDataObj.children, function (index, firstLevelChild) {
                list.push({ id: firstLevelChild.id, parent: parent.id, name: firstLevelChild.name, color: "#FFFFFF", value: firstLevelChild.val, color: firstLevelChild.color });
                firstLevelParent = firstLevelChild;
                $.each(firstLevelChild.children, function (index, secondLevelChild) {
                    list.push({ id: secondLevelChild.id, parent: firstLevelParent.id, name: secondLevelChild.name, color: "#FFFFFF", value: secondLevelChild.val, color: secondLevelChild.color });
                });
            });

            var seriesData = list;
            Highcharts.chart('compliant-monitoring-data-sunburst-child-chart', {
                chart: {
                    height: '100%'
                },
                //colors: ["red", "blue", "green", "black"],
                credits: {
                    enabled: false
                },
                title: {
                    text: 'Complaint Status'
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            format: '<b>{point.name}</b><br>{point.percentage:.1f} %',
                            distance: -50,
                            filter: {
                                property: 'percentage',
                                operator: '>',
                                value: 4
                            }
                        }
                    },
                    series: {
                        cursor: 'pointer',
                        point: {
                            events: {
                                click: function (e) {
                                }
                            }
                        }
                    }
                },
                series: [{
                    type: "sunburst",
                    data: seriesData,
                    allowDrillToNode: false,
                    cursor: 'pointer',
                    dataLabels: {
                        format: '{point.name}',
                        filter: {
                            property: 'innerArcLength',
                            operator: '>',
                            value: 16
                        }
                    },
                    levels: [{
                        level: 1,
                        levelIsConstant: false,
                        dataLabels: {
                            filter: {
                                property: 'outerArcLength',
                                operator: '>',
                                value: 64
                            }
                        }
                    }, {
                        level: 2,
                        colorByPoint: true
                    },
                    {
                        level: 3,
                        colorVariation: {
                            key: 'brightness',
                            to: -0.5
                        }
                    }, {
                        level: 4,
                        colorVariation: {
                            key: 'brightness',
                            to: 0.5
                        }
                    }]
                }],
                tooltip: {
                    headerFormat: "",
                    pointFormat: '<b>{point.name}</b> is <b>{point.value}</b>'
                }
            });
        },
        renderSumaryTable_Compliant: function (chartDataObj) {
            var gridConfig = {
                toolbar: ["excel"],
                excel: {
                    fileName: "Monitoring-Report-Data-Tabular-View.xlsx",
                    allPages: true
                },
                dataSource: {
                    data: chartDataObj,
                    schema: {
                        data: function (data) {
                            return data;
                        }
                    }
                },
                excelExport: function (e) {
                    var columns = e.workbook.sheets[0].columns;
                    e.workbook.fileName = "Monitoring-Report-Data-Tabular-View.xlsx";
                    columns.forEach(function (column) {
                        delete column.width;
                        column.autoWidth = true;
                    });
                },
                filterable: true,
                groupable: false,
                sortable: true,
                resizable: true,
                serverPaging: false,
                serverSorting: false,
                serverFiltering: false,
                pageable: {
                    refresh: false,
                    pageSizes: true,
                    buttonCount: 5,
                    pageSize: 10
                },
                columns: [{
                    title: "CCDS Version",
                    field: 'ccdsVersion',
                    width: "150px",
                    type: "string",
                    filterable: {
                        multi: true,
                        search: true
                    }
                }, {
                    title: "Product",
                    field: 'product',
                    type: "string",
                    headerAttributes: {
                        "class": "text-center",
                    },
                    attributes: {
                        "class": "text-center",
                    },
                    filterable: {
                        multi: true,
                        search: true
                    }
                }, {
                    title: "Country",
                    field: 'country',
                    type: "string",
                    headerAttributes: {
                        "class": "text-center",
                    },
                    attributes: {
                        "class": "text-center",
                    }
                }, {
                    title: "Trigger Date",
                    field: 'triggerDate',
                    format: "{0:dd-MMM-yyyy}",
                    type: "date",
                    headerAttributes: {
                        "class": "text-center",
                    },
                    attributes: {
                        "class": "text-center",
                    }
                }, {
                    title: "CCDS Effective Date",
                    field: 'ccdsEffectiveDate',
                    format: "{0:dd-MMM-yyyy}",
                    type: "date",
                    headerAttributes: {
                        "class": "text-center",
                    },
                    attributes: {
                        "class": "text-center",
                    }
                }, {
                    title: "Local Label Planned Submission Date",
                    field: 'localLabelPlannedSubmissionDate',
                    format: "{0:dd-MMM-yyyy}",
                    type: "date",
                    headerAttributes: {
                        "class": "text-center",
                    },
                    attributes: {
                        "class": "text-center",
                    }
                }, {
                    title: "Actual Date of Submission to HA",
                    field: 'actualHaSubmissionDate',
                    format: "{0:dd-MMM-yyyy}",
                    type: "date",
                    headerAttributes: {
                        "class": "text-center",
                    },
                    attributes: {
                        "class": "text-center",
                    },
                    template: function (data) {
                        var currentDate = new Date();
                        if (!data.actualHaSubmissionDate && !data.localLabelPlannedSubmissionDate) {
                            //#5
                            //If "Actual HA Submission Date"  is blank AND "Local Label Planned Submission Date" is blank 
                            //then "Actual HA Submission Date" should turn Blue
                            return "<div class='blue'>&nbsp;</div>";
                        }
                        else if (!data.actualHaSubmissionDate && data.localLabelPlannedSubmissionDate && new Date().setDate(data.localLabelPlannedSubmissionDate.getDate() + 10) < currentDate) {
                            //#7
                            //If Actual HA Submission Date is blank  AND (Local Label Planned Submission Date + 10days < today))
                            //then "Actual HA Submission Date" should turn  Orange
                            return "<div class='orange'>" + moment(data.actualHaSubmissionDate).format("DD-MMM-YYYY") + "</div>";
                        }
                        else if (data.actualHaSubmissionDate && data.localLabelPlannedSubmissionDate && data.actualHaSubmissionDate > data.localLabelPlannedSubmissionDate) {
                            //#8
                            //If Actual HA Submission Date > Local Label Planned Submission Date
                            //then "Actual HA Submission Date" should turn  Red
                            return "<div class='red'>" + moment(data.actualHaSubmissionDate).format("DD-MMM-YYYY") + "</div>";
                        }
                        else if (data.actualHaSubmissionDate && data.localLabelPlannedSubmissionDate && data.actualHaSubmissionDate <= data.localLabelPlannedSubmissionDate) {
                            //#10
                            //If Actual HA Submission Date =(Local Label Planned Submission Date) 
                            //then "Actual HA Submission Date" should turn  Green
                            return "<div class='green'>" + moment(data.actualHaSubmissionDate).format("DD-MMM-YYYY") + "</div>";
                        }
                        else {
                            return moment(data.actualHaSubmissionDate).format("DD-MMM-YYYY");
                        }
                    }
                }, {
                    title: "Date of Local Label Approval ",
                    field: 'localLabelApprovalDate',
                    format: "{0:dd-MMM-yyyy}",
                    type: "date",
                    headerAttributes: {
                        "class": "text-center",
                    },
                    attributes: {
                        "class": "text-center",
                    },
                    template: function (data) {
                        var currentDate = new Date();
                        if (!data.localLabelApprovalDate) {
                            //#11
                            //If Date of Local Label Approval is blank 
                            //then "Date of Local Label Approval" should turn is Blue
                            return "<div class='blue'>&nbsp;</div>";
                        }
                        else {
                            return moment(data.localLabelApprovalDate).format("DD-MMM-YYYY");
                        }
                    }
                }, {
                    title: "Date of Distribution of Local Labeling Change to Public",
                    field: 'localLabelChangePublicDistributionDate',
                    format: "{0:dd-MMM-yyyy}",
                    type: "date",
                    headerAttributes: {
                        "class": "text-center",
                    },
                    attributes: {
                        "class": "text-center",
                    },
                    template: function (data) {
                        var currentDate = new Date();
                        if (!data.localLabelChangePublicDistributionDate && data.localLabelApprovalDate && new Date().setDate(data.localLabelApprovalDate.getDate() + 30) < currentDate) {
                            //#12
                            //If "Date of Distribution of Local Labeling Change to Public" is blank AND(Date of Local Label Approval + 30 days < today), 
                            //then Date of Distribution of Local Labeling Change to Public Orange
                            return "<div class='orange'>&nbsp;</div>";
                        }
                        else if (data.localLabelChangePublicDistributionDate && data.localLabelApprovalDate && data.localLabelChangePublicDistributionDate > new Date().setDate(data.localLabelApprovalDate.getDate() + 30)) {
                            //#13
                            //If "Date of Distribution of Local Labeling Change to Public" > (Date of Local Label Approval + 30 days) 
                            //then Date of Distribution of Local Labeling Change to Public should turn Red 
                            return "<div class='red'>" + moment(data.localLabelChangePublicDistributionDate).format("DD-MMM-YYYY") + "</div>";
                        }
                        else if (data.localLabelChangePublicDistributionDate && data.localLabelApprovalDate && data.localLabelChangePublicDistributionDate <= new Date().setDate(data.localLabelApprovalDate.getDate() + 30)) {
                            //#14
                            //If "Date of Distribution of Local Labeling Change to Public" = (Date of Local Label Approval + 30 days)  
                            //then Date of Distribution of Local Labeling Change to Public should turn Green
                            return "<div class='green'>" + moment(data.localLabelChangePublicDistributionDate).format("DD-MMM-YYYY") + "</div>";
                        }
                        else {
                            return moment(data.localLabelChangePublicDistributionDate).format("DD-MMM-YYYY");
                        }
                    }
                }, {
                    title: "Status",
                    field: 'status',
                    type: "string",
                    headerAttributes: {
                        "class": "text-center",
                    },
                    attributes: {
                        "class": "text-center",
                    }
                }, {
                    title: "Reason",
                    field: 'reason',
                    type: "string",
                    headerAttributes: {
                        "class": "text-center",
                    },
                    attributes: {
                        "class": "text-center",
                    }
                }, {
                    title: "raManager",
                    field: 'raManager',
                    type: "string",
                    headerAttributes: {
                        "class": "text-center",
                    },
                    attributes: {
                        "class": "text-center",
                    }
                }, {
                    title: "Regional RA/Affiliate Sent Date",
                    field: 'regionalRaSentDate',
                    format: "{0:dd-MMM-yyyy}",
                    type: "date",
                    headerAttributes: {
                        "class": "text-center",
                    },
                    attributes: {
                        "class": "text-center",
                    }
                }, {
                    title: "Regional RA/Affiliate Returned Date",
                    field: 'regionalRaReturnedDate',
                    format: "{0:dd-MMM-yyyy}",
                    type: "date",
                    headerAttributes: {
                        "class": "text-center",
                    },
                    attributes: {
                        "class": "text-center",
                    }
                }, {
                    title: "Acknowledgement Status",
                    field: 'acknowledgementStatus',
                    type: "string",
                    headerAttributes: {
                        "class": "text-center",
                    },
                    attributes: {
                        "class": "text-center",
                    }
                }, {
                    title: "Regional RA/Affiliate Completed Date",
                    field: 'regionalRaCompletedDate',
                    type: "date",
                    headerAttributes: {
                        "class": "text-center",
                    },
                    attributes: {
                        "class": "custom-cell text-center",
                    },
                    template: function (data) {
                        var currentDate = new Date();
                        if (!data.regionalRaCompletedDate && !data.regionalRaSentDate) {
                            //#1
                            //If "Date Implementation Plan completed by Regional RA/Affiliate" is blank 
                            //and
                            //"Date CCDS and Implementation Plan Sent to Regional RA" is blank, 
                            //then "Date Implementation Plan completed by Regional RA/Affiliate" should turn Blue 
                            return "<div class='blue'>&nbsp;</div>";
                        }
                        else if (!data.regionalRaCompletedDate && data.regionalRaSentDate && currentDate > new Date().setDate(data.regionalRaSentDate.getDate() + 10)) {
                            //#2
                            //If "Date Implementation Plan completed by Regional RA/Affiliate" is blank 
                            //and 
                            //Today > "Date CCDS and Implementation Plan Sent to Regional RA" + 10days = COLORONE, 
                            //then "Date Implementation Plan completed by Regional RA/Affiliate"  should turn Orange
                            return "<div class='orange'>&nbsp;</div>";
                        }
                        else if (data.regionalRaCompletedDate && data.regionalRaSentDate && data.regionalRaCompletedDate > new Date().setDate(data.regionalRaSentDate.getDate() + 10)) {
                            //#3
                            //If "Date Implementation Plan completed by Regional RA/Affiliate" > "Date CCDS and Implementation Plan Sent to Regional RA"+10 days, 
                            //then "Date Implementation Plan completed by Regional RA / Affiliate" should turn Red 
                            return "<div class='red'>" + moment(data.regionalRaCompletedDate).format("DD-MMM-YYYY") + "</div>";
                        }
                        else if (data.regionalRaCompletedDate && data.regionalRaSentDate && data.regionalRaCompletedDate <= new Date().setDate(data.regionalRaSentDate.getDate() + 10)) {
                            //#4
                            //If "Date Implementation Plan completed by Regional RA/Affiliate" =  "Date CCDS and Implementation Plan Sent to Regional RA" + 10 days, 
                            //then "Date Implementation Plan completed by Regional RA / Affiliate" should turn Green 
                            return "<div class='green'>" + moment(data.regionalRaCompletedDate).format("DD-MMM-YYYY") + "</div>";
                        }
                        else {
                            return moment(data.regionalRaCompletedDate).format("DD-MMM-YYYY");
                        }
                    },
                }, {
                    title: "Local Implementation Date",
                    field: 'localImplementationDate',
                    format: "{0:dd-MMM-yyyy}",
                    type: "date",
                    headerAttributes: {
                        "class": "text-center",
                    },
                    attributes: {
                        "class": "text-center",
                    }
                },{
                    title: "Error",
                    field: 'error',
                    width: "150px",
                    type: "string",
                    filterable: {
                        multi: true,
                        search: true
                    }
                }
                ]
            };
            var grid = $("#monitoring-data-table");
            grid.empty();
            grid.kendoGrid(gridConfig);

            var wrap = $("#monitoring-data-table-wrap");
            fn.initKendoGridExtraFeatures(grid, wrap);
        },
        renderScatterChart_Complaint: function (chartDataObject) {
            var allData = chartDataObject.allData;

            var chartData = {};
            //setup static data
            chartData.chartTitle = "Company / Product wise Complaint Status View";
            chartData.xAxisTitle = "country";
            chartData.yAxisTitle = "product";
            //prepare categories
            var xAxisFieldName = 'country'; //name of the field to be used for x-axis
            var yAxisFieldName = 'product'; //name of the field to be used for y-axis
            chartData.xAxisCategories = _.sortedUniq(_.uniq(_.map(allData, xAxisFieldName)));
            chartData.yAxisCategories = _.sortedUniq(_.uniq(_.map(allData, yAxisFieldName)));

            var valueFieldName = 'compliantStatus'; //name of the field that will generate different series
            var uniqSeriesNames = _.sortedUniq(_.uniq(_.map(allData, valueFieldName)));

            //prepare series based on status
            chartData.series = _.map(uniqSeriesNames, function (seriesName) {
                var seriesItem = {
                    name: seriesName,
                    color: fn.getComplainceStatusColor(seriesName),
                    data: [],
                    //marker: { enabled: true, symbol: "circle", radius: 5 }
                };
                return seriesItem;
            });


            _.forEach(chartData.xAxisCategories, function (xAxisCategoryName, xCategoryIndex) {
                _.forEach(chartData.yAxisCategories, function (yAxisCategoryName, yCategoryIndex) {
                    _.forEach(uniqSeriesNames, function (seriesName, seriesIndex) {
                        var filteredData = _.filter(allData, function (r) { return r[xAxisFieldName] == xAxisCategoryName && r[yAxisFieldName] == yAxisCategoryName && r[valueFieldName] == seriesName; });
                        if (filteredData.length > 0) {

                            var xValue = _.indexOf(chartData.xAxisCategories, xAxisCategoryName);
                            var yValue = _.indexOf(chartData.yAxisCategories, yAxisCategoryName);

                            var seriesItemData = {
                                x: xValue,
                                y: yValue,
                                //z: riskAvg,
                                //risk: riskAvg,
                                xAxisFieldName: xAxisFieldName,
                                yAxisFieldName: yAxisFieldName,
                                items: filteredData
                            };
                            chartData.series[seriesIndex].data.push(seriesItemData);
                        }
                    });
                });
            });


            Highcharts.chart('monitoring-data-scatter-chart', {
                chart: {
                    type: 'scatter',
                    zoomType: 'xy'
                },
                title: {
                    text: chartData.chartTitle
                },
                subtitle: {
                    text: ''
                },
                xAxis: {
                    categories: chartData.xAxisCategories,
                    title: {
                        enabled: true,
                        text: chartData.xAxisTitle
                    },
                    startOnTick: true,
                    endOnTick: true,
                    showLastLabel: true
                },
                yAxis: {
                    categories: chartData.yAxisCategories,
                    showLastLabel: true,
                    title: {
                        text: chartData.yAxisTitle
                    }
                },
                legend: {
                    layout: 'horizontal',
                    align: 'center',
                    verticalAlign: 'bottom',
                    backgroundColor: Highcharts.defaultOptions.chart.backgroundColor,
                    borderWidth: 1
                },
                plotOptions: {
                    scatter: {
                        marker: {
                            radius: 5,
                            states: {
                                hover: {
                                    enabled: true,
                                    lineColor: 'rgb(100,100,100)'
                                }
                            }
                        },
                        states: {
                            hover: {
                                marker: {
                                    enabled: false
                                }
                            }
                        },
                        tooltip: {
                            headerFormat: '<b>{series.name}</b><br>',
                            //pointFormat: '{point.x} cm, {point.y} kg
                            pointFormatter: function (point) {
                                var lines = [];
                                lines.push(this.xAxisFieldName + ": " + this.series.xAxis.categories[this.x]);
                                lines.push(this.yAxisFieldName + ": " + this.series.yAxis.categories[this.y]);
                                lines.push("<b>Total</b>: " + this.items.length);
                                return lines.join("<br/>");
                            }
                        },
                        events: {
                            click: function (event) {
                                fn.renderSumaryTable_Compliant(event.point.items);
                            }
                        }
                    }
                },
                series: chartData.series
            });

        },

        //Acknowledgement tabs chart
        doShowAcknowledgementStatusTabReports: function (filteredData) {
            $(selector.compliant_charts).hide();
            $(selector.acknowledgement_charts).show();

            var chartData = fn.transposeDataForReport_Acknowledgement(filteredData);
            fn.renderSunburstChart_Acknowledgement(chartData);
            fn.renderSumaryTable_Acknowledgement(chartData.allData);
            fn.renderScatterChart_Acknowledgement(chartData);
        },
        transposeDataForReport_Acknowledgement: function (dataList) {
            var groupByStatus = _.groupBy(dataList, "acknowledgementStatus");

            var resultData = {
                groupByStatus: groupByStatus,
                allData: dataList
            };
            return resultData;
        },
        renderSunburstChart_Acknowledgement: function (chartDataObj) {
            // creating pi chart for indication
            var chartData = chartDataObj.allData;
            var list = [];

            var seriesData = _.chain(chartData)
                .groupBy("status")
                .each(function (statusData, key) {
                    var groupByStatus = _.chain(statusData).groupBy("country").each(function (countryData, key) {
                        var groupByProduct = _.chain(countryData).groupBy("product").each(function (productData, key) {
                            list.push({
                                id: productData[0].country + "-" + productData[0].product + "-" + productData[0].status,
                                parent: productData[0].country + "-" + productData[0].status,
                                name: key,
                                value: productData.length,
                                data: productData
                            });
                        }).value();
                        list.push({
                            id: countryData[0].country + "-" + countryData[0].status,
                            parent: countryData[0].status,
                            name: key,
                            value: countryData.length,
                            data: countryData
                        });
                    }).value();
                    list.push({
                        id: statusData[0].status,
                        parent: '0.0', name: key,
                        value: statusData.length,
                        data: statusData
                    });
                }).value();

            seriesData = list;
            seriesData.push({ id: '0.0', parent: '', name: 'Acknowledgement Status', color: "#FFFFFF" });

            //Highcharts.getOptions().colors.splice(0, 0, 'transparent');
            Highcharts.chart('acknowledgement-monitoring-data-sunburst-chart', {
                chart: {
                    height: '100%'
                },
                colors: ["#CCC0DA", "#808080", "#D8E4BC", "#FABF8F"],
                credits: {
                    enabled: false
                },
                title: {
                    text: 'Acknowledgement Status'
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            format: '<b>{point.name}</b><br>{point.percentage:.1f} %',
                            distance: -50,
                            filter: {
                                property: 'percentage',
                                operator: '>',
                                value: 4
                            }
                        }
                    },
                    series: {
                        cursor: 'pointer',
                        point: {
                            events: {
                                click: function (e) {
                                    fn.renderSunburstChildChart_Acknowledgement(this.node);
                                }
                            }
                        }
                    }
                },
                series: [{
                    type: "sunburst",
                    data: seriesData,
                    allowDrillToNode: false,
                    cursor: 'pointer',
                    dataLabels: {
                        format: '{point.name}',
                        filter: {
                            property: 'innerArcLength',
                            operator: '>',
                            value: 16
                        }
                    },
                    levels: [{
                        level: 1,
                        levelIsConstant: false,
                        dataLabels: {
                            filter: {
                                property: 'outerArcLength',
                                operator: '>',
                                value: 64
                            }
                        }
                    }, {
                        level: 2,
                        colorByPoint: true
                    },
                    {
                        level: 3,
                        colorVariation: {
                            key: 'brightness',
                            to: -0.5
                        }
                    }, {
                        level: 4,
                        colorVariation: {
                            key: 'brightness',
                            to: 0.5
                        }
                    }]
                }],
                tooltip: {
                    headerFormat: "",
                    pointFormat: '<b>{point.name}</b> is <b>{point.value}</b>'
                }
            });

        },
        renderSunburstChildChart_Acknowledgement: function (chartDataObj) {
            $(selector.acknowledgement_child_charts).show();
            //Onclick compliant status binding child level nodes
            var parent = { id: chartDataObj.id, parent: '', name: chartDataObj.name, value: chartDataObj.val, color: chartDataObj.color };
            var list = [parent];
            var firstLevelParent = null;
            $.each(chartDataObj.children, function (index, firstLevelChild) {
                list.push({ id: firstLevelChild.id, parent: parent.id, name: firstLevelChild.name, color: "#FFFFFF", value: firstLevelChild.val, color: firstLevelChild.color });
                firstLevelParent = firstLevelChild;
                $.each(firstLevelChild.children, function (index, secondLevelChild) {
                    list.push({ id: secondLevelChild.id, parent: firstLevelParent.id, name: secondLevelChild.name, color: "#FFFFFF", value: secondLevelChild.val, color: secondLevelChild.color });
                });
            });

            var seriesData = list;
            Highcharts.chart('acknowledgement-monitoring-data-sunburst-child-chart', {
                chart: {
                    height: '100%'
                },
                //colors: ["red", "blue", "green", "black"],
                credits: {
                    enabled: false
                },
                title: {
                    text: 'Complaint Status'
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            format: '<b>{point.name}</b><br>{point.percentage:.1f} %',
                            distance: -50,
                            filter: {
                                property: 'percentage',
                                operator: '>',
                                value: 4
                            }
                        }
                    },
                    series: {
                        cursor: 'pointer',
                        point: {
                            events: {
                                click: function (e) {
                                }
                            }
                        }
                    }
                },
                series: [{
                    type: "sunburst",
                    data: seriesData,
                    allowDrillToNode: false,
                    cursor: 'pointer',
                    dataLabels: {
                        format: '{point.name}',
                        filter: {
                            property: 'innerArcLength',
                            operator: '>',
                            value: 16
                        }
                    },
                    levels: [{
                        level: 1,
                        levelIsConstant: false,
                        dataLabels: {
                            filter: {
                                property: 'outerArcLength',
                                operator: '>',
                                value: 64
                            }
                        }
                    }, {
                        level: 2,
                        colorByPoint: true
                    },
                    {
                        level: 3,
                        colorVariation: {
                            key: 'brightness',
                            to: -0.5
                        }
                    }, {
                        level: 4,
                        colorVariation: {
                            key: 'brightness',
                            to: 0.5
                        }
                    }]
                }],
                tooltip: {
                    headerFormat: "",
                    pointFormat: '<b>{point.name}</b> is <b>{point.value}</b>'
                }
            });
        },
        renderSumaryTable_Acknowledgement: function (chartDataObj) {
            var gridConfig = {
                toolbar: ["excel"],
                excel: {
                    fileName: "Monitoring-Report-Data-Tabular-View.xlsx",
                    allPages: true
                },
                dataSource: {
                    data: chartDataObj,
                    schema: {
                        data: function (data) {
                            return data;
                        }
                    }
                },
                excelExport: function (e) {
                    var columns = e.workbook.sheets[0].columns;
                    e.workbook.fileName = "Monitoring-Report-Data-Tabular-View.xlsx";
                    columns.forEach(function (column) {
                        delete column.width;
                        column.autoWidth = true;
                    });
                },
                filterable: true,
                groupable: false,
                sortable: true,
                resizable: true,
                serverPaging: false,
                serverSorting: false,
                serverFiltering: false,
                pageable: {
                    refresh: false,
                    pageSizes: true,
                    buttonCount: 5,
                    pageSize: 10
                },
                columns: [{
                    title: "CCDS Version",
                    field: 'ccdsVersion',
                    width: "150px",
                    type: "string",
                    filterable: {
                        multi: true,
                        search: true
                    }
                }, {
                    title: "Product",
                    field: 'product',
                    type: "string",
                    headerAttributes: {
                        "class": "text-center",
                    },
                    attributes: {
                        "class": "text-center",
                    },
                    filterable: {
                        multi: true,
                        search: true
                    }
                }, {
                    title: "Country",
                    field: 'country',
                    type: "string",
                    headerAttributes: {
                        "class": "text-center",
                    },
                    attributes: {
                        "class": "text-center",
                    }
                }, {
                    title: "Trigger Date",
                    field: 'triggerDate',
                    format: "{0:dd-MMM-yyyy}",
                    type: "date",
                    headerAttributes: {
                        "class": "text-center",
                    },
                    attributes: {
                        "class": "text-center",
                    }
                }, {
                    title: "CCDS Effective Date",
                    field: 'ccdsEffectiveDate',
                    format: "{0:dd-MMM-yyyy}",
                    type: "date",
                    headerAttributes: {
                        "class": "text-center",
                    },
                    attributes: {
                        "class": "text-center",
                    }
                }, {
                    title: "Local Label Planned Submission Date",
                    field: 'localLabelPlannedSubmissionDate',
                    format: "{0:dd-MMM-yyyy}",
                    type: "date",
                    headerAttributes: {
                        "class": "text-center",
                    },
                    attributes: {
                        "class": "text-center",
                    }
                }, {
                    title: "Actual Date of Submission to HA",
                    field: 'actualHaSubmissionDate',
                    format: "{0:dd-MMM-yyyy}",
                    type: "date",
                    headerAttributes: {
                        "class": "text-center",
                    },
                    attributes: {
                        "class": "text-center",
                    }
                }, {
                    title: "Date of Local Label Approval ",
                    field: 'localLabelApprovalDate',
                    format: "{0:dd-MMM-yyyy}",
                    type: "date",
                    headerAttributes: {
                        "class": "text-center",
                    },
                    attributes: {
                        "class": "text-center",
                    }
                }, {
                    title: "Date of Distribution of Local Labeling Change to Public",
                    field: 'localLabelChangePublicDistributionDate',
                    format: "{0:dd-MMM-yyyy}",
                    type: "date",
                    headerAttributes: {
                        "class": "text-center",
                    },
                    attributes: {
                        "class": "text-center",
                    }
                }, {
                    title: "Status",
                    field: 'status',
                    type: "string",
                    headerAttributes: {
                        "class": "text-center",
                    },
                    attributes: {
                        "class": "text-center",
                    }
                }, {
                    title: "Reason",
                    field: 'reason',
                    type: "string",
                    headerAttributes: {
                        "class": "text-center",
                    },
                    attributes: {
                        "class": "text-center",
                    }
                }, {
                    title: "raManager",
                    field: 'raManager',
                    type: "string",
                    headerAttributes: {
                        "class": "text-center",
                    },
                    attributes: {
                        "class": "text-center",
                    }
                }, {
                    title: "Regional RA/Affiliate Sent Date",
                    field: 'regionalRaSentDate',
                    format: "{0:dd-MMM-yyyy}",
                    type: "date",
                    headerAttributes: {
                        "class": "text-center",
                    },
                    attributes: {
                        "class": "text-center",
                    }
                }, {
                    title: "Regional RA/Affiliate Returned Date",
                    field: 'regionalRaReturnedDate',
                    format: "{0:dd-MMM-yyyy}",
                    type: "date",
                    headerAttributes: {
                        "class": "text-center",
                    },
                    attributes: {
                        "class": "text-center",
                    }
                }, {
                    title: "Acknowledgement Status",
                    field: 'acknowledgementStatus',
                    type: "string",
                    headerAttributes: {
                        "class": "text-center",
                    },
                    attributes: {
                        "class": "text-center",
                    }
                }, {
                    title: "Regional RA/Affiliate Completed Date",
                    field: 'regionalRaCompletedDate',
                    format: "{0:dd-MMM-yyyy}",
                    type: "date",
                    headerAttributes: {
                        "class": "text-center",
                    },
                    attributes: {
                        "class": "text-center",
                    }
                }, {
                    title: "Local Implementation Date",
                    field: 'localImplementationDate',
                    format: "{0:dd-MMM-yyyy}",
                    type: "date",
                    headerAttributes: {
                        "class": "text-center",
                    },
                    attributes: {
                        "class": "text-center",
                    }
                },{
                    title: "Error",
                    field: 'error',
                    width: "150px",
                    type: "string",
                    filterable: {
                        multi: true,
                        search: true
                    }
                }
                ]
            };
            var grid = $("#monitoring-data-table");
            grid.empty();
            grid.kendoGrid(gridConfig);

            var wrap = $("#monitoring-data-table-wrap");
            fn.initKendoGridExtraFeatures(grid, wrap);
        },
        renderScatterChart_Acknowledgement: function (chartDataObject) {
            var allData = chartDataObject.allData;

            var chartData = {};
            //setup static data
            chartData.chartTitle = "Company / Product wise Acknowledgement Status View";
            chartData.xAxisTitle = "country";
            chartData.yAxisTitle = "product";
            //prepare categories
            var xAxisFieldName = 'country'; //name of the field to be used for x-axis
            var yAxisFieldName = 'product'; //name of the field to be used for y-axis
            chartData.xAxisCategories = _.sortedUniq(_.uniq(_.map(allData, xAxisFieldName)));
            chartData.yAxisCategories = _.sortedUniq(_.uniq(_.map(allData, yAxisFieldName)));

            var valueFieldName = 'status'; //name of the field that will generate different series
            var uniqSeriesNames = _.sortedUniq(_.uniq(_.map(allData, valueFieldName)));

            //prepare series based on status
            chartData.series = _.map(uniqSeriesNames, function (seriesName) {
                var seriesItem = {
                    name: seriesName,
                    color: fn.getComplainceStatusColor(seriesName),
                    data: [],
                    //marker: { enabled: true, symbol: "circle", radius: 5 }
                };
                return seriesItem;
            });


            _.forEach(chartData.xAxisCategories, function (xAxisCategoryName, xCategoryIndex) {
                _.forEach(chartData.yAxisCategories, function (yAxisCategoryName, yCategoryIndex) {
                    _.forEach(uniqSeriesNames, function (seriesName, seriesIndex) {
                        var filteredData = _.filter(allData, function (r) { return r[xAxisFieldName] == xAxisCategoryName && r[yAxisFieldName] == yAxisCategoryName && r[valueFieldName] == seriesName; });
                        if (filteredData.length > 0) {

                            var xValue = _.indexOf(chartData.xAxisCategories, xAxisCategoryName);
                            var yValue = _.indexOf(chartData.yAxisCategories, yAxisCategoryName);

                            var seriesItemData = {
                                x: xValue,
                                y: yValue,
                                //z: riskAvg,
                                //risk: riskAvg,
                                xAxisFieldName: xAxisFieldName,
                                yAxisFieldName: yAxisFieldName,
                                items: filteredData
                            };
                            chartData.series[seriesIndex].data.push(seriesItemData);
                        }
                    });
                });
            });

            Highcharts.chart('monitoring-data-scatter-chart', {
                chart: {
                    type: 'scatter',
                    zoomType: 'xy'
                },
                title: {
                    text: chartData.chartTitle
                },
                subtitle: {
                    text: ''
                },
                xAxis: {
                    categories: chartData.xAxisCategories,
                    title: {
                        enabled: true,
                        text: chartData.xAxisTitle
                    },
                    startOnTick: true,
                    endOnTick: true,
                    showLastLabel: true
                },
                yAxis: {
                    categories: chartData.yAxisCategories,
                    showLastLabel: true,
                    title: {
                        text: chartData.yAxisTitle
                    }
                },
                legend: {
                    layout: 'horizontal',
                    align: 'center',
                    verticalAlign: 'bottom',
                    backgroundColor: Highcharts.defaultOptions.chart.backgroundColor,
                    borderWidth: 1
                },
                plotOptions: {
                    scatter: {
                        marker: {
                            radius: 5,
                            states: {
                                hover: {
                                    enabled: true,
                                    lineColor: 'rgb(100,100,100)'
                                }
                            }
                        },
                        states: {
                            hover: {
                                marker: {
                                    enabled: false
                                }
                            }
                        },
                        tooltip: {
                            headerFormat: '<b>{series.name}</b><br>',
                            //pointFormat: '{point.x} cm, {point.y} kg
                            pointFormatter: function (point) {
                                var lines = [];
                                lines.push(this.xAxisFieldName + ": " + this.series.xAxis.categories[this.x]);
                                lines.push(this.yAxisFieldName + ": " + this.series.yAxis.categories[this.y]);
                                lines.push("<b>Total</b>: " + this.items.length);
                                return lines.join("<br/>");
                            }
                        }
                    }
                },
                series: chartData.series
            });

        },

        renderTimelineChart: function (chartDataObject) {
            var allData = chartDataObject;
            var productDaysList = _.map(allData, function (data) {
                if (data.actualHaSubmissionDate && data.localLabelPlannedSubmissionDate) {
                    var actualHaSubmissionDate = moment(data.actualHaSubmissionDate);
                    var localLabelPlannedSubmissionDate = moment(data.localLabelPlannedSubmissionDate);
                    var dayDifference = localLabelPlannedSubmissionDate.diff(actualHaSubmissionDate, 'days');

                    return {
                        product: data.product,
                        dayDifference: dayDifference,
                        data: data
                    };
                }
            });
            productDaysList = _.reject(productDaysList, _.isUndefined);//Removed undefined from array list

            var categories = Object.keys(_.groupBy(productDaysList, "product"));

            var categoryWiseAvgDays = _.chain(categories).map(function (product) {
                var productsData = _.filter(productDaysList, { product: product });
                var data = [];
                _.each(productsData, function (item, index) {
                    data.push(item.data);
                });
                var daysAvg = _.round(_.meanBy(productsData, 'dayDifference'));
                return {
                    name: product,
                    days: daysAvg,
                    data: data
                };
            }).orderBy("days", "asc").value();

            var seriesData = [];
            var xAxisCategories = [];
            var yAxisCategories = [];
            var cnt = 0;
            categories = _.map(categoryWiseAvgDays, function (data, key) {
                seriesData.push({ x: data.days, y: cnt, product: data.name, data: data.data });
                cnt += 1;
                xAxisCategories.push(data.days);
                yAxisCategories.push(data.name);
                return data.name;
            });

            Highcharts.chart('monitoring-data-timeline-chart', {
                chart: {
                    type: 'scatter',
                    zoomType: 'xy'
                },
                credits: {
                    enabled: false
                },
                title: {
                    text: 'Product wise submission timeline'
                },
                xAxis: {
                    title: {
                        enabled: true,
                        text: 'Days'
                    },
                    startOnTick: true,
                    endOnTick: true,
                    showLastLabel: true
                },
                yAxis: {
                    categories: yAxisCategories,
                    showLastLabel: true,
                    title: {
                        text: 'Products'
                    }
                },
                plotOptions: {
                    bar: {
                        dataLabels: {
                            enabled: true,
                            format: '<b>{point.name} Days</b>',
                            color: '#000'
                        }
                    },
                    series: {
                        stacking: 'normal',
                        point: {
                            events: {
                                click: function (event) {
                                    fn.renderSumaryTable_Compliant(this.data);
                                    fn.renderSumaryTable_Acknowledgement(this.data);
                                }
                            }
                        }
                    }
                },
                tooltip: {
                    formatter: function () {
                        var lines = [];
                        lines.push('<b>' + this.point.product + '</b>');
                        lines.push('Total: ' + this.point.x + " Day(s)");
                        return lines.join("<br/>");
                    }
                },
                legend: false,
                series: [{
                    name: 'Milestone Name',
                    color: '#da9694',
                    negativeColor: '#0088FF',
                    data: seriesData,
                    states: {
                        select: {
                            color: '#28a745',
                            borderColor: '#28a745',
                            stroke: '#28a745'
                        }
                    }
                }]
            });
        },

        initFlagReportExportButton: function () {
            var regulatoryFlagReportPrintButton = $(".regulatoryFlagReportPrintButton", selector.flag_report_export_outer_wrap);
            regulatoryFlagReportPrintButton.click(function () {
                fn.doRegulatoryFlagReportPrint.call(this);
                return false;
            });
        },
        doRegulatoryFlagReportPrint: function () {
            var _this = $(this);

            var fileType = _this.data('export-format') || _this.attr('data-export-format');
            var outputFileName = _this.data('export-file-name') || _this.attr('export-file-name');
            var pages = [];
            var filters = fn.clone(variable.filterApplied);
            var sd = filters.startDate;
            var ed = filters.endDate;
            delete filters.startDate;
            delete filters.endDate;


            //Prepare Header
            var headerHtmlMainCopy = $(selector.regulatory_flag_report_header_legend_wrap);

            var chartItems = $(selector.flag_report_chart_items);
            chartItems.each(function () {
                var _this = $(this);
                var flatReportHtmlMainCopy = _this;
                var headerHtml = headerHtmlMainCopy.clone();
                var flagReportHtml = flatReportHtmlMainCopy.clone();
                flagReportHtml.show();
                var htmlHeight = (headerHtmlMainCopy.height() + flatReportHtmlMainCopy.height());

                var title = $(".export-title").text();
                var startDate = moment(sd, "YYYY-MM-DD").format("DD-MMM-YYYY");
                var endDate = moment(ed, "YYYY-MM-DD").format("DD-MMM-YYYY");
                var rdTime = "<span>Last Refreshed On: " + $("#rdTime").text();
                var printDate = "<span>, Printed On: " + moment(new Date()).format("DD-MMM-YYYY HH:mm a");
                var fDateHtml = "<span>StartDate: " + startDate + " EndDate: " + endDate + "</span>";

                var phTitleVal = "<b style='font-weight:600;color:#333;'>" + title + "<br/>" + fDateHtml + "<br/>" + rdTime + printDate + "</b>";
                var phTitle = { name: "<%title_area_html%>", value: phTitleVal };
                var phHeader = { name: "<%header_area_html%>", value: headerHtml[0].outerHTML };
                var phReportContent = { name: "<%chart_area_html%>", value: flagReportHtml[0].outerHTML };
                var phHtmlHeight = { name: "<%html_height%>", value: htmlHeight };


                var page = {
                    inputTemplateFileName: "psr-regulatory.html",
                    placeholders: [phTitle, phHeader, phReportContent, phHtmlHeight]
                };
                pages.push(page);
            });

            //TODO: Do one last page for filter

            var postData = {
                type: fileType,
                outputFileName: outputFileName,
                filters: filters,
                pages: pages
            };


            fn.showAjaxLoader();
            ods.remoting.executePost(variable.url_export_regulatory_report, "JSON", JSON.stringify(postData), "application/json; charset=utf-8", false, false, function (response) {
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
        getJsRenderHelpersForFlagReport: function () {
            var jsRenderHelpers = {
                dateHasSubmissions: function (dateData) {
                    var has = dateData.some(function (data) {
                        return (data.submissions.length > 0);
                    });
                    return has;
                },
                dateHasApprovals: function (dateData) {
                    var has = dateData.some(function (data) {
                        return (data.approvals.length > 0);
                    });
                    return has;
                },
                dateHasMeetings: function (dateData) {
                    var has = dateData.some(function (data) {
                        return (data.meetings.length > 0);
                    });
                    return has;
                },
                timelineHasMeetings: function (timeline) {
                    var has = timeline.some(function (data) {
                        return jsRenderHelpers.dateHasMeetings(data.datesData);
                    });
                    return has;
                },
                getSubmissionMilestoneIconCss: function (data) {
                    var iconCss = "";
                    switch (data.region) {
                        case "Canada":
                            return "text-purple";
                        case "EU":
                            return "text-danger";
                        case "Japan":
                            return "text-warning";
                        case "OIAA Regions":
                            return "text-success";
                        case "ROW":
                            return "text-muted";
                        case "US":
                            return "text-primary";
                        case "Unknown":
                        default:
                            return iconCss;
                    }
                    return iconCss;
                },
                replaceProjectName: function (projectName) {
                    var projName = projectName.replace(" Indication", "");
                    return projName;
                },
                getApprovalMilestoneIconCss: function (data) {
                    var iconCss = "";
                    switch (data.region) {
                        case "Canada":
                            return "text-purple";
                        case "EU":
                            return "text-danger";
                        case "Japan":
                            return "text-warning";
                        case "OIAA Regions":
                            return "text-success";
                        case "ROW":
                            return "text-muted";
                        case "US":
                            return "text-primary";
                        case "Unknown":
                        default:
                            return iconCss;
                    }
                    return iconCss;
                },
                getMeetingMilestoneIconCss: function (data) {
                    var iconCss = "";
                    switch (data.region) {
                        case "Canada":
                            return "text-purple";
                        case "EU":
                            return "text-danger";
                        case "Japan":
                            return "text-warning";
                        case "OIAA Regions":
                            return "text-success";
                        case "ROW":
                            return "text-muted";
                        case "US":
                            return "text-primary";
                        case "Unknown":
                        default:
                            return iconCss;
                    }
                    return iconCss;
                }
            };
            return jsRenderHelpers;
        },
        generateByYearlySlots: function (startDate, endDate) {
            var startYear = startDate.getFullYear();
            var endYear = endDate.getFullYear();
            var startMonth = startDate.getMonth() + 1;
            var endMonth = endDate.getMonth() + 1;
            var slots = [];

            for (var i = startYear; i <= endYear; i++) {
                var sd1 = i + "-01-01";
                var ed1 = i + "-06-30 23:59:59";

                var sd2 = i + "-07-01";
                var ed2 = i + "-12-31 23:59:59";


                var slot1 = {
                    slot: i + "-Jan-Jun",
                    slotDisplayText: i + " (Jan to Jun)",
                    startDate: moment(sd1).toDate(),
                    endDate: moment(ed1).toDate(),
                }
                var slot2 = {
                    slot: i + "-Jul-Dec",
                    slotDisplayText: i + " (Jul to Dec)",
                    startDate: moment(sd2).toDate(),
                    endDate: moment(ed2).toDate(),
                }

                slots.push(slot1);
                slots.push(slot2);
            }
            return slots;
        },
        clearAllWidgets: function () {
            $(selector.flag_report_export_outer_wrap).hide();
        },
        getComplainceStatusColor: function (complainceStatus) {
            var complaince = {
                'Non-Complaint': '#DA9694',
                'In Compliance': '#D8E4BC'
            };
            return complaince[complainceStatus];
        },
        getAcknowledgementStatusColor: function (complainceStatus) {
            var complaince = {
                'Completed': '#68AB0F',
                'Unknown': '#C93547'
            };
            return complaince[complainceStatus];
        },
        customExportChart: function (exportFormat, wrap) {
            var startDate = $("#startDate").val();
            var endDate = $("#endDate").val();
            var printDate = moment(new Date()).format("DD-MMM-YYYY HH:mm a");
            var dataAsOnDateString = $("#rdTime").text();
            var totalCount = wrap.find(".countPannel .totalCount").text();
            var chartTitle = wrap.find(".chartTitle").text();
            var caption = chartTitle + " (" + totalCount + " Total)";
            var subCaption = "Last Refreshed On: " + dataAsOnDateString + ", Printed On:" + printDate;

            this.exportChart({ type: exportFormat, filename: chartTitle }, {
                title: {
                    text: caption,
                    style: { fontFamily: ' "Exo 2", sans-serif', fontSize: "10px" }, backgroundColor: "#FFFFFF"
                },
                subtitle: {
                    text: subCaption,
                    style: { fontFamily: ' "Exo 2", sans-serif', fontSize: "6px" }, backgroundColor: "#FFFFFF"
                }
            });

        },

        //Filters
        filterStudyDataForChart: function (data, filter) {
            var gdfilterByApplied = {};
            var gdtempFilterApplied = filter;
            var filterDefinitions = {
                "product": "product",
                "country": "country",
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
        initJsRenderFunctions: function () {
            $.views.helpers({
                formatDate: function (date, outputFormat, inputFormat) {
                    if (!date) {
                        return date;
                    }
                    var displayDate = (inputFormat) ? moment(date, inputFormat).format(outputFormat) : moment(date).format(outputFormat);
                    return displayDate;
                }
            });
        },
        initKendoGridExtraFeatures: function (grid, wrap) {
            var exportFlag = true;
            $("#excelExport", wrap).unbind("click").bind("click", function () {
                wrap.find(".k-grid-excel").trigger("click");
            });
            $('.filter', wrap).off('input').on('input', function (e) {
                var gridSelector = $(this).data('grid-selector') || $(this).attr('data-grid-selector');
                var grid = $(gridSelector).data('kendoGrid');
                var columns = grid.columns;

                var filter = { logic: 'or', filters: [] };
                columns.forEach(function (x) {
                    if (x.field) {
                        var type = grid.dataSource.options.schema.model.fields[x.field].type;
                        if (type == 'string') {
                            filter.filters.push({
                                field: x.field,
                                operator: 'contains',
                                value: e.target.value
                            })
                        }
                        else if (type == 'number') {
                            if ($.isNumeric(e.target.value)) {
                                filter.filters.push({
                                    field: x.field,
                                    operator: 'eq',
                                    value: e.target.value
                                });
                            }

                        } else if (type == 'date') {
                            var data = grid.dataSource.data();
                            for (var i = 0; i < data.length; i++) {
                                var dateStr = "";
                                if (x.format)
                                    dateStr = kendo.format(x.format, data[i][x.field]);
                                // change to includes() if you wish to filter that way https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes
                                if (dateStr.indexOf(e.target.value) >= 0) {
                                    filter.filters.push({
                                        field: x.field,
                                        operator: 'eq',
                                        value: data[i][x.field]
                                    })
                                }
                            }
                        } else if (type == 'boolean' && getBoolean(e.target.value) !== null) {
                            var bool = getBoolean(e.target.value);
                            filter.filters.push({
                                field: x.field,
                                operator: 'eq',
                                value: bool
                            });
                        }
                    }
                });
                grid.dataSource.filter(filter);
            });
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
    HomeWidgetsScript.init();
});