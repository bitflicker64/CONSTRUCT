// START EPIC WITH ONE ITEM PER PAGE  - PAGING ================================================================================== //
// GET DATA Using Fetch

// EPIC Global variables for paging
var pageList = new Array();
var currentPage = 1;
var numberPerPage = 1;
var numberOfPages = 1; // calculates the total number of pages
var currentImageNumber = 1;
var numberOfImages = 1;

// Function called from Search button
// Call made to EPIC API using FETCH. 
// Result Object returned
// Result object sent to getResultItems() for looping and rendering to HTML
// with help from Simen Daehlin on slack
function getEpicImageByDate() {
    if (document.getElementById("formDate").value !== "") {
        //clear div between refreshes
        document.getElementById("errorMessage").innerHTML = ""; 
        $('#epicMostRecentContainer').hide(200);
        //Get user date input via form
        let varDate = document.getElementById("formDate").value;
        //objDateSplitUp is an object containing year, month, day splitdate() is in helperTools.js
        let objDateSplitUp = splitDate(varDate, 0); 
        //get image type from form
        let varImageType = document.querySelector('input[name="imageType"]:checked').value;
        let varDataCol = document.getElementById("dataCol");
        let varImageCol = document.getElementById("imageCol");

        //scroll window to results
        $('html, body').animate({
            scrollTop: $("#jumpto1").offset().top - 20
        }, 'slow');

        // START OF GET DATA USING FETCH
        if (varImageType === "enhanced") {
            // If most recent EPIC image showing then hide
            $('#epicMostRecentContainer').hide(); 
            //call to API for enhanced images on a specified date
            let url = fetch("https://api.nasa.gov/EPIC/api/enhanced/date/" + varDate + "?api_key=pyZKDq8cb4x1dJi0dsodTT9PBoWkQaa5CgxmPAxZ") 
                .then(function(response) {
                    if (response.ok) {
                        // parses response to JSON
                        return response.json(); // parses response to JSON
                    }
                    //catch connection errors
                    throw new Error('There was a problem connecting to NASA. Please try again later. EPIC Search is only compatible with Chrome or Firefox.'); 
                }).then(function(result) {
                    //clear div between refreshes
                    varDataCol.innerHTML = ""; 
                    //clear div between refreshes
                    varImageCol.innerHTML = ""; 
                    //clear div between refreshes
                    document.getElementById('resultStatus').innerHTML = ""; 
                    //get total count of results returned
                    let totalResultCount = result.length; 
                    //Results message to site user
                    document.getElementById('resultStatus').innerHTML += "<p class='text-faded'>There were <span class='font-weight-bold'>" + totalResultCount + "</span> enhanced images found for <br><span class='font-weight-bold'>" +
                        objDateSplitUp.day + "-" + objDateSplitUp.month + "-" + objDateSplitUp.year + "</span></p>"; 
            
                    if (result.length !== 0) {
                        // Send result object to function 'pageTheResult()' to slice the object for paging
                        let pagedResultEnhanced = pageTheResult(result);
                        // Send the sliced object to 'getResultItems()' for looping and rendering to HTML
                        $('#epicResultsContainer').show(200);
                        getResultItems(pagedResultEnhanced, varImageType, objDateSplitUp, varDataCol, varImageCol, totalResultCount);
                    }
                    else {
                        $('#epicResultsContainer').show(200);
                        $('#pagingRow').hide();
                        // If most recent EPIC image showing then hide
                        $('#epicMostRecentContainer').hide(300); 
                        document.getElementById('resultStatus').innerHTML += "<p class='text-faded'>Please note images were not captured before 01 September 2015 or there were no images captured for the date: " +
                            +objDateSplitUp.day + "-" + objDateSplitUp.month + "-" + objDateSplitUp.year;
                    }
                }).catch(function(error) {
                    console.log('Error in NASA EPIC enhanced request.', error.message);
                });
        }
        else if (varImageType === "natural") {
            // If most recent EPIC image showing then hide
            $('#epicMostRecentContainer').hide();
            // call to API for natural images on a specified date
            let url = fetch("https://api.nasa.gov/EPIC/api/natural/date/" + varDate + "?api_key=pyZKDq8cb4x1dJi0dsodTT9PBoWkQaa5CgxmPAxZ") 
                .then(function(response) {
                    if (response.ok) {
                        // parses response to JSON
                        return response.json(); 
                    }
                    // catch connection errors
                    throw new Error('There was a problem connecting to NASA. Please try again later.'); 
                }).then(function(result) {
                    // clear div between refreshes
                    varDataCol.innerHTML = ""; 
                    // clear div between refreshes
                    varImageCol.innerHTML = ""; 
                    // clear div between refreshes
                    document.getElementById('resultStatus').innerHTML = ""; 
                    //Get total count of results returned
                    let totalResultCount = result.length; 
                    // Results message to site user
                    document.getElementById('resultStatus').innerHTML += "<p class='text-faded'>There were <span class='font-weight-bold'>" + totalResultCount + "</span> natural images found for <br><span class='font-weight-bold'>" +
                        objDateSplitUp.day + "-" + objDateSplitUp.month + "-" + objDateSplitUp.year + "</span></p>"; 

                    if (result.length !== 0) {
                        // Send result object to function 'pageTheResult()' to slice the object for paging
                        let pagedResultNatural = pageTheResult(result);

                        // Send the sliced object to 'getResultItems()' for looping and rendering to HTML
                        $('#epicResultsContainer').show(200);
                        getResultItems(pagedResultNatural, varImageType, objDateSplitUp, varDataCol, varImageCol, totalResultCount);
                    }
                    else {
                        $('#epicResultsContainer').show(200);
                        $('#pagingRow').hide();
                        // If most recent EPIC image showing then hide
                        $('#epicMostRecentContainer').hide(200); 
                        document.getElementById('resultStatus').innerHTML += "<p class='text-faded'>Please note images were not captured before 01 September 2015 or there were no images captured for the date: " +
                            +objDateSplitUp.day + "-" + objDateSplitUp.month + "-" + objDateSplitUp.year;
                    }
                }).catch(function(error) {
                    console.log('Error in NASA EPIC natural request.', error.message);
                });

        }
        // END OF GET DATA USING FETCH
    }
    else {
        // If most recent EPIC image showing then hide
        $('#epicMostRecentContainer').hide(200); 
        // if error message showing then hide
        if ($('#errorMessage').css("display", "none")) {$('#errorMessage').show(100);} 
        document.getElementById("errorMessage").textContent = "Please enter a date to search.";
    }

} //end of getEpicImageByDate()

// Start get data items from API result
// Render data to HTML
function getResultItems(result, varImageType, objDateSplitUp, varDataCol, varImageCol, totalResultCount) {
    if (result.length !== 0) {
        $('#epicResultsContainer').show(300);
        // Results div hidden when page loads. Show for results.
        $('#pagingRow').show();
        result.forEach(function(item) {
            let epicImageTypeUrl = "https://epic.gsfc.nasa.gov/archive/" + varImageType + "/" + objDateSplitUp.year + "/" + objDateSplitUp.month + "/" + objDateSplitUp.day + "/jpg/" + item.image + ".jpg";
            let distanceToSun = dscovrDistance(item.dscovr_j2000_position.x, item.dscovr_j2000_position.y, item.dscovr_j2000_position.z, item.sun_j2000_position.x, item.sun_j2000_position.y, item.sun_j2000_position.z).toLocaleString();
            let distanceToEarth = dscovrDistance(0, 0, 0, item.dscovr_j2000_position.x, item.dscovr_j2000_position.y, item.dscovr_j2000_position.z).toLocaleString();
            // Image data wrote out to HTML page - image, caption ,desc, coords, etc.
            varDataCol.innerHTML += "<div class='imageData'>" +
                "<div><strong>Image name:</strong> " + item.image + ".jpg</div>" +
                "<div>" + item.caption + "</div>" +
                "<div><strong>Centroid coordinates: </strong>Lat: " + item.centroid_coordinates.lat + ", Lon: " + item.centroid_coordinates.lon + "</div>" +
                "<div><a href='https://www.google.ie/maps/@" + item.centroid_coordinates.lat + "," + item.centroid_coordinates.lon + ",4z' target='_blank'>View this location on Google Maps</a> <i class='fa fa-external-link' aria-hidden='true'></i></div>" +
                "<div><strong>Dscovr distance to the Sun:</strong> " + distanceToSun + "km</div>" +
                "<div><strong>Dscovr distance from the Earth:</strong> " + distanceToEarth + "km</div>" +
                "<div><a href='" + epicImageTypeUrl + "' target='blank'>View full size image</a>  <i class='fa fa-external-link' aria-hidden='true'></i></div>" +
                "<div class='mt-3'><b>Showing image: </b>" + currentImageNumber + " of " + totalResultCount + "</div>" +
                "</div>";

            // Images natural and enhanced
            varImageCol.innerHTML += "<div class='earthImage'>" +
                "<img id='" + item.image + "' alt='" + item.image + "' title='" + item.image + "' src='" + epicImageTypeUrl + "'/>" +
                "</div>";
        });
    }
    else {
        document.getElementById('resultStatus').innerHTML += "<p class='text-faded'>Please note images were not captured before 01 September 2015 or there were no images captured for the date: " +
            +objDateSplitUp.day + "-" + objDateSplitUp.month + "-" + objDateSplitUp.year;
    }

} //End get data items from API result

// Paging the result to one item per page
function pageTheResult(resultApiResponse) {
    numberOfPages = getNumberOfPages(resultApiResponse);
    numberOfImages = resultApiResponse.length;

    var begin = ((currentPage - 1) * numberPerPage);
    var end = begin + numberPerPage;

    pageList = resultApiResponse.slice(begin, end);
    // Enable/Disable paging buttons if necessary
    check();
    return pageList;
}

// Get total number of items returned from API
function getNumberOfPages(resultApiResponse) {
    return Math.ceil(resultApiResponse.length / numberPerPage);
}

// Next Button
function nextPage() {
    currentPage += 1;
    currentImageNumber += 1;
    getEpicImageByDate();
}

// Previous Button
function previousPage() {
    currentPage -= 1;
    currentImageNumber -= 1;
    getEpicImageByDate();
}

// First Item Button
function firstPage() {
    currentPage = 1;
    currentImageNumber = 1;
    getEpicImageByDate();
}

// Last Item Button
function lastPage() {
    currentPage = numberOfPages;
    currentImageNumber = numberOfImages;
    getEpicImageByDate();
}

// Enable/Disable paging buttons if necessary
function check() {
    document.getElementById("next").disabled = currentPage == numberOfPages ? true : false;
    document.getElementById("previous").disabled = currentPage == 1 ? true : false;
    document.getElementById("first").disabled = currentPage == 1 ? true : false;
    document.getElementById("last").disabled = currentPage == numberOfPages ? true : false;
}

// END EPIC  =========================================================================================================== //

// START EPIC MOST RECENT IMAGE ======================================================================================== //

// Get latest image received from EPIC 
function getMostRecentEpic() {
    //scroll window to results
    $('html, body').animate({
        scrollTop: $("#jumpto2").offset().top -50
    }, 'slow');

    // START OF GET DATA
    let varMostRecentImagesDiv = document.getElementById("epicMostRecentImage");
    let varMostRecentDataDiv = document.getElementById("epicMostRecentData");
    // call to API for natural images
    let url = fetch("https://api.nasa.gov/EPIC/api/enhanced/images?api_key=pyZKDq8cb4x1dJi0dsodTT9PBoWkQaa5CgxmPAxZ")
        .then(function(response) {
            if (response.ok) {
                // parses response to JSON
                return response.json(); 
            }
            // catch connection errors
            throw new Error('There was a problem connecting to NASA. Please try again later.'); 
        }).then(function(result) {
            // clear div between refreshes
            varMostRecentImagesDiv.innerHTML = ""; 
            varMostRecentDataDiv.innerHTML = "";
            if (result.length !== 0) {
                // get last array item
                let mostRecent = result[result.length - 1]; 
                // split the date up into year, month, day
                let imageDate = splitDate(mostRecent.date, 0);
                // this contains day and time
                let strImageDay = imageDate.day;
                // remove time from date string
                strImageDay = strImageDay.substring(0, strImageDay.length - 9);
                // Results div hidden when page loads. Show for results.
                $('#epicMostRecentContainer').show(300); 
                // if EPIC results showing then hide
                $('#epicResultsContainer').hide(300);
                // if error message showing then hide
                if ($('#errorMessage').show()) {$('#errorMessage').hide(100);} 

                varMostRecentDataDiv.innerHTML += "<div><strong>Image name:</strong> " + mostRecent.image + ".jpg</div>" +
                    "<div><strong>Image date and time: </strong>" + mostRecent.date + "</div>" +
                    "<div>" + mostRecent.caption + "</div>";

                //Images natural and enhanced
                varMostRecentImagesDiv.innerHTML += "<div class='earthImage'>" +
                    "<a href='https://epic.gsfc.nasa.gov/archive/enhanced/" + imageDate.year + "/" + imageDate.month + "/" + strImageDay + "/jpg/" + mostRecent.image + ".jpg' target='blank'>" +
                    "<img id='" + mostRecent.image + "' alt='" + mostRecent.image + "' title='" + mostRecent.image + "' src='https://epic.gsfc.nasa.gov/archive/enhanced/" + imageDate.year + "/" + imageDate.month + "/" + strImageDay + "/jpg/" + mostRecent.image + ".jpg'/></a>" +
                    "</div>";
            }
            else {
                document.getElementById('imageStatus').textContent = 'Please note images were not captured before 2015-09-01 or there were no images captured for that date:';
            }
        }).catch(function(error) {
            console.log('Request failed', error.message);
        });
}

// END EPIC MOST RECENT IMAGE ======================================================================================== //

 