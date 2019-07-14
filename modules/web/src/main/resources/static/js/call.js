var contextPath = "/communiQ";

$(document).ready(function () {

    $("#call-form").submit(function (event) {
        //stop submit the form, we will post it manually.
        event.preventDefault();
        makecall();
    });
    
    /*$("#callerId-form").submit(function (event) {
        //stop submit the form, we will post it manually.
        event.preventDefault();
        makecall();
    });*/

});

function makecall() {

    var toNumber = $("#toNumber").val();
    $("#call-button").prop("disabled", true);

    $.ajax({
        type: "POST",
        contentType: "application/json",
        url: contextPath + "/makecall",
        data: JSON.stringify(toNumber),
        dataType: 'json',
        cache: false,
        timeout: 600000,
        success: function (data) {

            var json = "<table> <tr>  <td>Call From:</td> 	<td>" +  data.from + "</td> </tr> "
						+ "<tr> <td>Call To:</td> <td>" + data.to + "</td> 	</tr>"
			            + "<tr> <td>Call sid:</td> <td> " + data.sid + "</td> </tr> </table>" ;
						
            $('#call-detail').html(json);
            console.log("SUCCESS : ", data);
            
            $("#call-button").prop("disabled", false);

        },
        error: function (e) {

            var json = "<h4>Ajax Response</h4><pre>"
                + e.responseText + "</pre>";
            $('#call-detail').html(json);

            console.log("ERROR : ", e);
            $("#call-button").prop("disabled", false);

        }
    });

}