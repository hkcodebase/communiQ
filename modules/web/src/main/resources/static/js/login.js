$(document).ready(function() {

    $('#loginForm').bValidator();

	var winH = $(window).height();
	var winW = $(window).width();
	$('.login-box').css('margin-top', winH / 2 - $('.login-box').height() / 2);
	$('.login-box').css('margin-left', winW / 2 - $('.login-box').width() / 2);
	
	$("#loginForm").submit(function() {
        var username = $("#uname").val();
    	var password = $("#pwd").val();
    	var domain = $("#domain").val();
    	var usernameToSend =  (domain) ? (username + "|" + domain) : username;
		$("#hdnuname").val(usernameToSend);
		return true;
	});
	
});


