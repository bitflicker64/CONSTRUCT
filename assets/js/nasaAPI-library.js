// START NASA IMAGE AND VIDEO LIBRARY ================================================================================== //


var currentLibraryPage = 1; //Library global variables for paging
var numberOfLibraryPages = 1; // calculates the total number of pages

var varLibraryQuery;
var varMediaType; // variable for holding media type selected by user; image, video, audio
var varNextPageUrl; // variable for holding the next page url returned by API
var varPrevPageUrl; // variable for holding the previous page url returned by API
var varFirstPageUrl; // variable for holding the first page
var varLastPageUrl; // variable for holding the last page

var linkToAudioJson;
var linkToVideoJson;


// Function called from Search button
// Values received from html form and validated
function getQueryText() {
    //clear div of any previous error messages
    document.getElementById("errorLibraryMessage").textContent = ""; 
    //Get query text from form
    varLibraryQuery = document.getElementById("searchLibraryText").value; 
    //Get media type from form
    varMediaType = document.querySelector('input[name="mediaType"]:checked').value; 
    //create url to send to NASA API
    varFirstPageUrl = "https://images-api.nasa.gov/search?q=" + varLibraryQuery + "&page=1&media_type=" + varMediaType; 

    if (varLibraryQuery !== "") {
        // Display Page pageNumber of pageCount
        document.getElementById('pageNumber').innerHTML = ""; 
        // Display Page pageNumber of pageCount
        document.getElementById('pageCount').innerHTML = ""; 
        searchNASALibrary(varFirstPageUrl);
    }
    else {
        document.getElementById("errorLibraryMessage").innerHTML = "Please enter text to search the NASA Library.";
    }
}

// Call made to NASA Library API using XMLHttpRequest()
// Result object sent to getLibraryResultsData() for looping and rendering to HTML
function searchNASALibrary(pagedUrl) {
    var varLibraryResult = document.getElementById("libraryResults");
    var xhr = new XMLHttpRequest();
    var url = pagedUrl;

    xhr.open("GET", url);
    xhr.send();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            //parse responseText as json object
            var varNasaLibraryData = JSON.parse(this.responseText);
            //clear div between refreshes
            varLibraryResult.innerHTML = ""; 
            //clear div between refreshes
            document.getElementById("errorLibraryMessage").innerHTML = ""; 
            //check to see if any results came back from query
            var varTotalLibraryHits = varNasaLibraryData.collection.metadata.total_hits; 
            //total number of hits returned by call to API for search query
                document.getElementById('totalLibraryHits').innerHTML = varTotalLibraryHits; 
            if (varTotalLibraryHits !== 0 && varMediaType === "image") {
                getLibraryResultsDataImage(varNasaLibraryData, varMediaType);
            }
            else if (varTotalLibraryHits !== 0 && varMediaType === "audio") {
                getLibraryResultsDataAudio(varNasaLibraryData, varMediaType);
            }
            else if (varTotalLibraryHits !== 0 && varMediaType === "video") {
                getLibraryResultsDataVideo(varNasaLibraryData, varMediaType);
            }
            else {
                document.getElementById("errorLibraryMessage").innerHTML = "There were no <strong>" + varMediaType + "</strong> results for <strong>" + varLibraryQuery + "</strong>";
                $('#searchLibraryResultsContainer').hide();
            }
        }
        else if (this.status == 400) {
            document.getElementById("errorLibraryResultMessage").innerHTML = "Maximum number of search results have been displayed. Please refine your search.";
        }
    };
}

// Get data items from API result - Image
// Render data to HTML
function getLibraryResultsDataImage(queryResponseData, varMediaType) {
    // Get result collection
    let resultObj = queryResponseData.collection; 
    // Get items array
    let itemsArray = resultObj.items; 
    // Get links array
    let pagingLinks = resultObj.links; 
    // API returns results in lots of 100
    numberOfLibraryPages = Math.ceil(resultObj.metadata.total_hits / 100); 
    // Display Page pageNumber of pageCount
    document.getElementById('pageNumber').innerHTML = currentLibraryPage;
    if (numberOfLibraryPages > 2) {
        document.getElementById('result_ex').innerHTML = "&nbsp;&nbsp;(Displaying 50 results per column if more than one column)";
    }
    // Display Page pageNumber of pageCount
    document.getElementById('pageCount').innerHTML = numberOfLibraryPages; 
    //Display title search results for images
    document.getElementById('media-type').innerHTML = "- Images"; 

    // PAGING ======================
    //disable/enable paging buttons as appropriate
    checkLibraryResultButtons(); 
    // Get next and previous page urls from results object for PAGING

    if (pagingLinks !== undefined) {
        if (pagingLinks[1] === undefined) {
            varNextPageUrl = pagingLinks[0]['href'];
        }
        else {
            varPrevPageUrl = pagingLinks[0]['href'];
            varNextPageUrl = pagingLinks[1]['href'];
        }
    }
    // Build last page url
    varLastPageUrl = "https://images-api.nasa.gov/search?q=" + varLibraryQuery + "&page=" + numberOfLibraryPages + "&media_type=" + varMediaType;

    // Results div hidden when page loads. Show for results.
    $('#searchLibraryResultsContainer').show(); 
    if ($('#paging-buttons').hide()) { $('#paging-buttons').show(); }
    if ($('#pagingInfo').hide()) { $('#pagingInfo').show(); }
    
    // Items: data, href, links, we need data[{}] array
    itemsArray.forEach(function(item, i) { 
        // Data object
        var itemsDataObj = item.data; 
        // Links object
        var itemsThumbnailLinkObj = item.links; 

        //iterate through Data object for item info
        itemsDataObj.forEach(function(item) {
            //iterate through Links object to get url for thumbnail image
            itemsThumbnailLinkObj.forEach(function(itemUrl) {
                var imageUrl = itemUrl.href;
                //send 'center' to getNasaCenter() to get its website
                var nasaCenterWebsite = getNasaCenter(item.center);

                var itemDesc;
                var itemDescTrunc;
                //description or description_508 could be available
                if (!item.hasOwnProperty("description")) {
                    itemDesc = item.description_508;
                }
                else {
                    itemDesc = item.description;
                }

                if (itemDesc.length > 22) {
                    itemDescTrunc = itemDesc.substring(0, 170) + " ...";
                }
                // replace chars with html coded version
                var varItemFullDescription = escapeHtml(itemDesc);
                // Cut off UTC time and split out date into day, month, year
                var varTruncatedDataDate = splitDate(item.date_created.substring(0, 10), 1); 

                // reinitiates the popover as the results are not on the page when loaded first
                $(function() {
                    var $trigger = $('.p-trigger').popover({
                        placement: 'right',
                        animation: true,
                        title: "Click to hide"
                    });
                });

                // id of div is set by using the value of the index (i) and appending it to text (libraryResultsItem)
                document.getElementById('libraryResults').innerHTML += "<div class='col-12 col-md-6' id='libraryResultsItem" + i + "'><div class='row'><div class='col-3 col-sm-2 text-center'>" +
                    "<a href='" + imageUrl + "' target='blank'><img src='" + imageUrl + "' alt='" + item.title + "' title='" + item.title + "'/></a></div>" +
                    "<div class='col-9 col-sm-10'><p><strong>Title:</strong> " + item.title + "<br>" +
                    "<strong>Date created:</strong> " + varTruncatedDataDate.day + " " + varTruncatedDataDate.month + " " + varTruncatedDataDate.year + "<br>" +
                    "<strong>Center: </strong><a href='" + nasaCenterWebsite + "' target='blank'>Click to visit the " + item.center + " website.</a> <i class='fa fa-external-link' aria-hidden='true'></i><br>" +
                    "<strong>Nasa id:</strong> " + item.nasa_id + "<br>" +
                    "<strong>Description:</strong> " + itemDescTrunc + "<br>" +
                    "<button class='p-trigger' href='#' data-content='" + varItemFullDescription + "' data-trigger='focus'>Read full description</button></p>" +
                    "</div></div></div>";

            }); // end thumbnail forEach
        }); // end data forEach

        // if the index (i) is divisable by 2 then it's even otherwise odd
        // different background colours are applied by css if row is even/odd
        if (i % 2 == 0) {
            document.getElementById('libraryResultsItem' + i).classList.add('evenColour');
        }
        else {
            document.getElementById('libraryResultsItem' + i).classList.add('oddColour');
        }
    });
}

// Get data items from API result - Audio
// Render data to HTML
function getLibraryResultsDataAudio(queryResponseData, varMediaType) {
    // Get result collection
    let resultObj = queryResponseData.collection; 
    // Get items array
    let itemsArray = resultObj.items; 
    // API returns results in lots of 100
    numberOfLibraryPages = Math.ceil(resultObj.metadata.total_hits / 100); 
    // Display Page pageNumber of pageCount
    document.getElementById('pageNumber').innerHTML = currentLibraryPage;
    // Display Page pageNumber of pageCount
    document.getElementById('pageCount').innerHTML = numberOfLibraryPages;
    //Display title search results for audio 
    document.getElementById('media-type').innerHTML = "- Audio";    
    
    //Results div hidden when page loads. Show for results.
    $('#searchLibraryResultsContainer').show(); 
    $('#paging-buttons').hide();
    $('#pagingInfo').hide();

    // Items: data, href, we need data[{}] array
    itemsArray.forEach(function(item, i) { 
        var itemsDataObj = item.data;
        // href object with links to audio files
        var audioList = item.href; 
        //iterate through Data object for item info
        itemsDataObj.forEach(function(item) {

            //Get & parse JSON file of audio file links
            var xhr = new XMLHttpRequest();
            var url = audioList;
            xhr.open("GET", url);
            xhr.send();
            xhr.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    linkToAudioJson = JSON.parse(this.responseText);

                    // reinitiates the popover as the results are not on the page when loaded first
                    $(function() {
                        var $trigger = $('.p-trigger').popover({
                            placement: 'bottom',
                            animation: true,
                            title: "Click to hide"
                        });
                    });

                    //send 'center' to getNasaCenter() to get its website
                    var nasaCenterWebsite = getNasaCenter(item.center);
                    
                    var itemDesc;
                    var itemDescTrunc;                    
                    //description or description_508 could be available
                    if (!item.hasOwnProperty("description")) {
                        itemDesc = item.description_508;
                    }
                    else {
                        itemDesc = item.description;
                    }

                    if (itemDesc.length > 22) {
                        itemDescTrunc = itemDesc.substring(0, 170) + " ...";
                    }
                    // replace chars with html coded version
                    var varItemFullDescription = escapeHtml(itemDesc);
                    // Cut off UTC time and split out date into day, month, year
                    var varTruncatedDataDate = splitDate(item.date_created.substring(0, 10), 1); 

                    // id of div is set by using the value of the index (i) and appending it to text (libraryResultsItem)

                    document.getElementById('libraryResults').innerHTML += "<div class='col-12 col-md-3' id='libraryResultsItem" + i + "'>" +
                        "<p>" +
                        "<strong>Title: </strong>" + item.title + "<br>" +
                        "<strong>Date created: </strong>" + varTruncatedDataDate.day + " " + varTruncatedDataDate.month + " " + varTruncatedDataDate.year + "<br>" +
                        "<strong>Description: </strong> " + itemDescTrunc + "<br>" +
                        "<strong>Center: </strong><a href='" + nasaCenterWebsite + "' target='blank'>Click to visit the " + item.center + " website.</a> <i class='fa fa-external-link' aria-hidden='true'></i><br>" +
                        "<strong>Nasa id: </strong>" + item.nasa_id + "<br>" +
                        "<strong>Audio: </strong><a href='" + linkToAudioJson[0] + "' target='blank'>Listen to original audio</a> <i class='fa fa-volume-up' aria-hidden='true'></i><br>" +
                        "<button class='p-trigger' href='#' data-content='" + varItemFullDescription + "' data-trigger='focus'>Read full description</button></p>" +
                        "</div>";

                    // if the index (i) is divisable by 2 then it's even otherwise odd
                    // different background colours are applied by css if row is even/odd
                    if (i % 2 == 0) {
                        document.getElementById('libraryResultsItem' + i).classList.add('evenColour');
                    }
                    else {
                        document.getElementById('libraryResultsItem' + i).classList.add('oddColour');
                    }
                }
            };


        }); // end data forEach     
    });
}

// Get data items from API result - Video
// Render data to HTML
function getLibraryResultsDataVideo(queryResponseData, varMediaType) {
    // Get result collection
    let resultObj = queryResponseData.collection; 
    // Get items array
    let itemsArray = resultObj.items; 
    // API returns results in lots of 100
    numberOfLibraryPages = Math.ceil(resultObj.metadata.total_hits / 100); 
    // Display Page pageNumber of pageCount
    document.getElementById('pageNumber').innerHTML = currentLibraryPage; 
    // Display Page pageNumber of pageCount
    document.getElementById('pageCount').innerHTML = numberOfLibraryPages; 
    //Display title search results for video
    document.getElementById('media-type').innerHTML = "- Video";     

    //Results div hidden when page loads. Show for results.
    $('#searchLibraryResultsContainer').show(); 
    $('#paging-buttons').hide();
    $('#pagingInfo').hide();

    // Items: data, href, we need data[{}] array
    itemsArray.forEach(function(item, i) { 
        var itemsDataObj = item.data;
        // href object with links to audio files
        var videoList = item.href; 
        //iterate through Data object for item info
        itemsDataObj.forEach(function(item) {

            //Get & parse JSON file of audio file links
            var xhr = new XMLHttpRequest();
            var url = videoList;
            xhr.open("GET", url);
            xhr.send();
            xhr.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    linkToVideoJson = JSON.parse(this.responseText);

                    // reinitiates the popover as the results are not on the page when loaded first
                    $(function() {
                        var $trigger = $('.p-trigger').popover({
                            placement: 'bottom',
                            animation: true,
                            title: "Click to hide"
                        });
                    });

                    //send 'center' to getNasaCenter() to get its website
                    var nasaCenterWebsite = getNasaCenter(item.center);
                   
                    var itemDesc;
                    var itemDescTrunc;
                   //description or description_508 could be available
                    if (!item.hasOwnProperty("description")) {
                        itemDesc = item.description_508;
                    }
                    else {
                        itemDesc = item.description;
                    }
                    if (itemDesc.length >22) {
                        itemDescTrunc = itemDesc.substring(0, 170) + " ...";
                    }
                    // replace chars with html coded version
                    var varItemFullDescription = escapeHtml(itemDesc);
                    // Cut off UTC time and split out date into day, month, year
                    var varTruncatedDataDate = splitDate(item.date_created.substring(0, 10), 1); 

                    // id of div is set by using the value of the index (i) and appending it to text (libraryResultsItem)

                    document.getElementById('libraryResults').innerHTML += "<div class='col-12 col-md-3' id='libraryResultsItem" + i + "'>" +
                        "<p>" +
                        "<strong>Title: </strong>" + item.title + "<br>" +
                        "<strong>Date created: </strong>" + varTruncatedDataDate.day + " " + varTruncatedDataDate.month + " " + varTruncatedDataDate.year + "<br>" +
                        "<strong>Description: </strong> " + itemDescTrunc + "<br>" +
                        "<strong>Center: </strong><a href='" + nasaCenterWebsite + "' target='blank'>Click to visit the " + item.center + " website.</a> <i class='fa fa-external-link' aria-hidden='true'></i><br>" +
                        "<strong>Nasa id: </strong>" + item.nasa_id + "<br>" +
                        "<strong>Audio: </strong><a href='" + linkToVideoJson[0] + "' target='blank'>Watch the video</a> <i class='fa fa-play' aria-hidden='true'></i><br>" +
                        "<button class='p-trigger' href='#' data-content='" + varItemFullDescription + "' data-trigger='focus'>Read full description</button></p>" +
                        "</div>";

                    // if the index (i) is divisable by 2 then it's even otherwise odd
                    // different background colours are applied by css if row is even/odd
                    if (i % 2 == 0) {
                        document.getElementById('libraryResultsItem' + i).classList.add('evenColour');
                    }
                    else {
                        document.getElementById('libraryResultsItem' + i).classList.add('oddColour');
                    }
                }
            };
        }); // end data forEach     
    });
}


// Next Button
$('#next-Button').click(function() {
    document.getElementById("errorLibraryResultMessage").innerHTML = "";
    currentLibraryPage += 1;
    searchNASALibrary(varNextPageUrl);
});
// Previous Button
$('#previous-Button').click(function() {
    document.getElementById("errorLibraryResultMessage").innerHTML = "";
    currentLibraryPage -= 1;
    searchNASALibrary(varPrevPageUrl);
});
// First Button
$('#first-Button').click(function() {
    document.getElementById("errorLibraryResultMessage").innerHTML = "";
    currentLibraryPage = 1;
    searchNASALibrary(varFirstPageUrl);
});
// Last Button
$('#last-Button').click(function() {
    document.getElementById("errorLibraryResultMessage").innerHTML = "";
    currentLibraryPage = numberOfLibraryPages;
    searchNASALibrary(varLastPageUrl);
});

// Enable/Disable paging buttons if necessary
function checkLibraryResultButtons() {
    document.getElementById("next-Button").disabled = currentLibraryPage == numberOfLibraryPages ? true : false;
    document.getElementById("previous-Button").disabled = currentLibraryPage == 1 ? true : false;
    document.getElementById("first-Button").disabled = currentLibraryPage == 1 ? true : false;
    document.getElementById("last-Button").disabled = currentLibraryPage == numberOfLibraryPages ? true : false;
}



// END NASA IMAGE AND VIDEO LIBRARY ================================================================================== //
