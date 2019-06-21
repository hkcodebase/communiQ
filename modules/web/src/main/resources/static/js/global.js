"use strict";
var contextPath = "/gra-report";
var global_config = {
    defaultDateFormat: "DD-MMM-YYYY"
};

var ods = ods || {};
ods.remoting = (function ($) {

    var self = {};
    var defaultConfig = {};

    self.get = function (url, data, dataType) {
        return $.ajax({
            url: url,
            data: data,
            dataType: dataType,
            type: "GET"
        });
    },
        self.post = function (url, data, dataType) {
            return $.ajax({
                url: url,
                data: data,
                dataType: dataType,
                type: "POST"
            });
        },
        self.getJSON = function (url, data) {
            return this.get(url, data, "json");
        },
        self.postJSON = function (url, data) {
            return this.post(url, data, "json");
        }

    self.executeGet = function (url, dataType, successCallBack, errorCallback) {
        $.ajax({
            url: url,
            dataType: dataType,
            type: "GET"
        })
            .success(function (respData, textStatus, jqXHR) {
                if (successCallBack && typeof successCallBack === "function") {
                    successCallBack.call({}, respData);
                } else {
                    ods.logging.log("Execute get - successCallBack Undefined");
                }

            })
            .error(function (jqXHR, textStatus, errorThrown) {
                if (jqXHR && jqXHR.status == 401) {
                    window.location.reload(true);
                    return false;
                }
                if (errorCallback && typeof errorCallback === "function") {
                    errorCallback.call({}, textStatus, errorThrown);
                } else {
                    ods.logging.log("Execute get - errorCallback Undefined");
                }

            });
    };

    self.executePost = function (url, encType, postData, contentType, cacheType, processDataType, successCallBack, errorCallback) {
        $.ajax({
            url: url,
            enctype: encType,
            data: postData,
            contentType: contentType,
            cache: cacheType,
            processData: processDataType,
            type: "POST"
        })
            .success(function (respData, textStatus, jqXHR) {
                if (successCallBack && typeof successCallBack === "function") {
                    successCallBack.call({}, respData);
                } else {
                    console.log("Execute post - successCallBack Undefined");
                }
            })
            .error(function (jqXHR, textStatus, errorThrown) {
                if (jqXHR && jqXHR.status == 401) {
                    window.location.reload(true);
                    return false;
                }
                if (errorCallback && typeof errorCallback === "function") {
                    errorCallback.call({}, jqXHR, textStatus, errorThrown);
                } else {
                    console.log("Execute post - errorCallback Undefined");
                }
            });
    };

    self.executePostForm = function (url, encType, postData, contentType, cacheType, processDataType, successCallBack, errorCallback) {
        $.ajax({
            url: url,
            enctype: encType,
            data: postData,
            contentType: contentType,
            cache: cacheType,
            processData: processDataType,
            type: "POST"
        })
            .success(function (respData, textStatus, jqXHR) {
                if (successCallBack && typeof successCallBack === "function") {
                    successCallBack.call({}, respData);
                } else {
                    ods.logging.log("Execute post - successCallBack Undefined");
                }
            })
            .error(function (jqXHR, textStatus, errorThrown) {
                if (jqXHR && jqXHR.status == 401) {
                    window.location.reload(true);
                    return false;
                }
                if (errorCallback && typeof errorCallback === "function") {
                    errorCallback.call({}, textStatus, errorThrown);
                } else {
                    ods.logging.log("Execute post - errorCallback Undefined");
                }
            });
    };


    return self;
})($);

ods.logging = (function ($) {
    var self = {};

    self.log = function (logmessage) {
        console.log(logmessage);
    }
    return self;
})($);


ods.utils = (function ($) {
    var self = {};

    self.redirect = function (url) {
        window.location.href = url;
    }
    return self;
})($);



//common dialog function
function commonDialog(titlemsg, bodytxt, yesOpt, noOpt) {
    $('<div style="z-index:99999;"></div>')
        .appendTo('body')
        .html('<br><div id="dialogBody" class="warning-msg-txt">' + bodytxt + '</div>')
        .dialog({
            modal: true
            , title: titlemsg
            , zIndex: 9999
            , autoOpen: true
            , width: 'auto'
            , resizable: false
            , buttons: {
                Yes: function () {
                    yesOpt();
                    $(this).remove();
                },
                No: function () {
                    noOpt();
                    $(this).remove();
                }
            }
            , close: function (
                event, ui) {
                $(this).remove();
            }
        });
    if (titlemsg == "Error") {
        $("#dialogBody").removeClass("warning-msg-txt");
        $("#dialogBody").addClass("error-msg-txt");
    }
}


function commonDialogOk(titlemsg, bodytxt, okOpt) {
    $('<div style="z-index:99999;"></div>')
        .appendTo('body')
        .html('<br><div id="dialogBody" class="warning-msg-txt">' + bodytxt + '?</div>')
        .dialog({
            modal: true
            , title: titlemsg
            , zIndex: 9999
            , autoOpen: true
            , width: 'auto'
            , resizable: false
            , buttons: {
                Ok: function () {

                    $(this).remove();
                    okOpt();
                }
            }
            , close: function (
                event, ui) {
                $(this).remove();
            }
        });
    if (titlemsg == "Error") {
        $("#dialogBody").removeClass("warning-msg-txt");
        $("#dialogBody").addClass("error-msg-txt");
    }
}

$(document).ready(function () {
    $(".navbar-nav .dropdown-menu a").each(function () {
        if ($(this).attr("href") == window.location.pathname) {
            $(this).closest('.navbar-nav .dropdown-menu').find("a").removeClass("active");
            $(this).parent("li").addClass("active");
        }
    });
    $(".navbar-nav li a").each(function () {
        var windowPath = window.location.pathname;
        if (windowPath == "/clinical-portal/") {
            windowPath = "/clinical-portal/home";
        }
        if ($(this).attr("href") == windowPath) {
            $(this).closest('.navbar-nav ul').find("li").removeClass("active");
            $(this).parent("li").addClass("active");
        }
    });
});