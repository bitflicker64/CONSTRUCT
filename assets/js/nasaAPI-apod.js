// START APOD =================================================================================================================== //
// GET DATA Using AJAX
var url = "https://api.nasa.gov/planetary/apod?api_key=pyZKDq8cb4x1dJi0dsodTT9PBoWkQaa5CgxmPAxZ";

$.ajax({
    url: url,
    // if ajax call is successful 
    success: function(result) {
        //copyright
        if ("copyright" in result) {
            $("#copyright").text("Image Credits: " + result.copyright); //Get copyright information and display
        }
        else {
            $("#copyright").text("Image Credits: " + "Public Domain"); //No copyright information, display 'Public Domain'
        }
        //if apod for that day is a video
        if (result.media_type == "video") {
            $("#apod_img_container").css("display", "none"); //If type video...
            $("#apod_vid_id").attr("src", result.url);
            $("#apod_title_vid").text(result.title); //Image title
        }
        //otherwise it's an image
        else {
            $("#apod_vid_container").css("display", "none"); //If type image...
            $('#apod-title-vid-row').css('display', 'none');
            $("#apod_img_id").attr("src", result.url);
            $("#apod_title_img").text(result.title); //Image title
        }
        //NASA image explanation of image text
        $("#apod_explaination").text(result.explanation); //Image explanation

        var varDateString = splitDate(result.date, 1); //Show date of image with Month name. 1 = get Month name

        $("#apod_date").text(varDateString.day + " " + varDateString.month + " " + varDateString.year);
    },
    // if the ajax call fails
    error: function(XMLHttpRequest, textStatus, errorThrown) { 
        $("#apod_img_container").hide();
        $("#apod_vid_container").hide();
        $(".apod-para").hide();
        $("#apod-error-row").css("display", "block");
        $("#apod-error-message").html("There was a problem connecting to NASA Astronomy Picture of the Day. Please try again later.");
    } 
});

// END APOD ===================================================================================================================== //