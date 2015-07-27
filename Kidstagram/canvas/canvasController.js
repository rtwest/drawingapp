//canvasController

//////////////////////////////////////////////////////////////////////////////////////////
//  ISSUES
//  - *** Background not saved 'autosaved' with canvas on uploading.  Save, then Upload does work because Background is drawn into canvas. 
//  - Fix orientation to prevent rotating screen.  I think I fixed this in config.xml
//  -------
//  iOS
//  - CanvasPic re-drawn back onto Canvas at wrong size sometimes.  I think I fixed with a check for HiRes displays.  
//  -------
//  ANDROID - KINDLE
//  - AddPicture button doesn't work
//  -------
//  - Need localStorage photolibrary.  Limit is 2-5MB.
//    - save to camera roll / photo gallery & store file path in localStorage
//    - NEED TO DROP THE SUCCESS ALERT AFTER SAVING IMAGE IN THE IOS AND ANDROID BUILD PROJECTS
//  - Need to figure out Sharing data needs
//    - Data needs - imagename, Who shared with > ,  
//
//
//  TODO
//
//  - BE MINIMAL
//  - AUTO SAVE AS YOU GO
//
//
//////////////////////////////////////////////////////////////////////////////////////////



cordovaNG.controller('canvasController', function ($scope, $rootScope, $http, globalService) {

    // Scope is like the partial view datamodel.  'message' is defined in the partial html view
    //$scope.message = "Let's draw";


    // Variables
    // -----------
    var ctx, ctx2, color = "#000";
    var line_Width, size = 5;
    var tool = 'pen'
    var x, y, lastx, lasty = 0;
    var backgroundImage = new Image();
    var isTouch

    // Test for touch device - NOT USED
    // ---------------------
    function isTouchDevice() {
        return true == ("ontouchstart" in window || window.DocumentTouch && document instanceof DocumentTouch);
    }
    if (isTouchDevice() === true) {
        //alert('Touch Device'); 
        isTouch = 1;
    } else {
        //alert('Not a Touch Device');
    }


    // Function to setup a new canvas for drawing
    // ------------------------------------------
    $scope.newCanvas = function () {
        //define, resize, and insert canvas
        document.getElementById("content").style.height = window.innerHeight - 200;
        var canvas = '<canvas id="canvas" width="' + window.innerWidth + '" height="' + (window.innerHeight - 200) + '"></canvas>';
        document.getElementById("content").innerHTML = canvas;
        // setup canvas
        ctx = document.getElementById("canvas").getContext("2d");
        ctx.lineCap = "round";
        ctx.lineJoin = 'round';
        ctx.strokeStyle = color;
        ctx.lineWidth = line_Width;
        // setup to trigger drawing on mouse or touch
        drawTouch();
        //drawMouse(); // only needed for testing
        resetdrawingtoolbar();
        $('#penicon1').addClass('pen1select');
    };

    // For choosing the drawing tools
    // ------------------------------------------
    $scope.choosePen1 = function () {
        resetdrawingtoolbar();
        drawTouch();
        //drawMouse(); // only needed for testing
        $('#penicon1').addClass('pen1select');
        size = 5;
        ctx.beginPath(); // start a new line
        ctx.lineWidth = size; // set the new line size
        // if brush was selected and canvas is there, draw canvas2 down on original canvas and remove canvas2
        if ($('#canvas2').length) {
            $('#canvas2').remove();
        };
    };
    $scope.choosePen2 = function () {
        resetdrawingtoolbar();
        drawTouch();
        //drawMouse(); // only needed for testing
        $('#penicon2').addClass('pen2select');
        size = 12;
        ctx.beginPath(); // start a new line
        ctx.lineWidth = size; // set the new line size
        // if brush was selected and canvas is there, draw canvas2 down on original canvas and remove canvas2
        if ($('#canvas2').length) {
            $('#canvas2').remove();
        };
    };
    $scope.choosePen3 = function () {
        resetdrawingtoolbar();
        drawTouch();
        //drawMouse(); // only needed for testing
        $('#penicon3').addClass('pen3select');
        size = 30;
        ctx.beginPath(); // start a new line
        ctx.lineWidth = size; // set the new line size
        // if brush was selected and canvas is there, draw canvas2 down on original canvas and remove canvas2
        if ($('#canvas2').length) {
            $('#canvas2').remove();
        };
    };

    $scope.chooseEraser = function () {
        resetdrawingtoolbar();
        eraseTouch();
        //eraseMouse(); // for testing only
        $('#erasericon').addClass('eraserselect');
        // if brush was selected and canvas is there, draw canvas2 down on original canvas and remove canvas2
        if ($('#canvas2').length) {
            $('#canvas2').remove();
        };
    };

    $scope.chooseBrush1 = function () {
        resetdrawingtoolbar();
        if ($('#canvas2').length) {
            $('#canvas2').remove();
        };
        //brushMouse();
        brushTouch(); // use for deploy to touch device

        $('#brushicon1').addClass('brush1select');
        size = 8;

        // use for web
        //if (isTouch == 1) {
        //    brushTouch();
        //}

    };
    $scope.chooseBrush2 = function () {
        resetdrawingtoolbar();
        if ($('#canvas2').length) {
            $('#canvas2').remove();
        };
        //brushMouse();
        brushTouch(); // use for deploy to touch device
        $('#brushicon2').addClass('brush2select');
        size = 18;
    };
    $scope.chooseBrush3 = function () {
        resetdrawingtoolbar();
        if ($('#canvas2').length) {
            $('#canvas2').remove();
        };
        //brushMouse();
        brushTouch(); // use for deploy to touch device
        $('#brushicon3').addClass('brush3select');
        size = 40;
    };

    // For choosing the color
    // ------------------------------------------
    $scope.selectColor = function (clickEvent) {
        $scope.clickEvent = globalService.simpleKeys(clickEvent); // clean up click event

        // toggle the UI for the selected color
        for (var i = 0; i < document.getElementsByClassName("palette").length; i++) {
            document.getElementsByClassName("palette")[i].style.borderColor = "#fff";
        }
        clickEvent.target.style.borderColor = "transparent";

        color = window.getComputedStyle(clickEvent.target).backgroundColor; // set color to palette
        ctx.beginPath(); // start a new line
        ctx.strokeStyle = color; // set the new line color

        ////if eraser selected then pick the pen
        //if (line_width == 18) { // hack because the erase line width is 18
        //    // select icon
        //    // run drawmouse and drawtouch
        //};
    };

    // For choosing the brush size
    // ------------------------------------------
    //$scope.selectSize = function (clickEvent) {
    //    $scope.clickEvent = globalService.simpleKeys(clickEvent); // helper function suggested by somebody

    //    $(".palette2").removeClass('selected');  //remove from all instances of .pensize
    //    clickEvent.target.className += ' selected';

    //    size = clickEvent.target.id;  // !! This is the important part
    //    ctx.beginPath(); // start a new line
    //    ctx.lineWidth = size; // set the new line size
    //};


    resetdrawingtoolbar = function () {
        $('#canvas').off(); // reset event handler
        $('#canvas2').off();

        $('#erasericon').removeClass('eraserselect');
        $('#penicon1').removeClass('pen1select');
        $('#penicon2').removeClass('pen2select');
        $('#penicon3').removeClass('pen3select');
        $('#brushicon3').removeClass('brush3select');
        $('#brushicon2').removeClass('brush2select');
        $('#brushicon1').removeClass('brush1select');
    };



    // prototype to	start drawing on TOUCH using canvas moveTo and lineTo
    // ------------------------------------------
    var drawTouch = function () {

        var start = function (e) {
            x = e.originalEvent.changedTouches[0].pageX;
            y = e.originalEvent.changedTouches[0].pageY - 130; // 130 came from trial and error
            ctx.beginPath();
            ctx.globalCompositeOperation = 'source-over'; // reset this back to drawing
            ctx.moveTo(x, y);
            ctx.arc(x, y, size / 2, 0, 2 * Math.PI, false);
            ctx.fillStyle = color;
            ctx.fill();
        };
        var move = function (e) {
            e.preventDefault();
            ctx.beginPath(); // after dot, start a new line
            ctx.globalCompositeOperation = 'source-over'; // reset this back to drawing
            ctx.moveTo(x, y);
            x = e.originalEvent.changedTouches[0].pageX;
            y = e.originalEvent.changedTouches[0].pageY - 130;
            ctx.lineTo(x, y);
            ctx.closePath();
            ctx.strokeStyle = color;
            ctx.stroke();
        };

        $('#canvas').on('touchstart', start);
        $('#canvas').on('touchmove', move);
    };

    // prototype to	start drawing on MOUSE using canvas moveTo and lineTo
    // ------------------------------------------
    var drawMouse = function () {
        ctx.lineWidth = size;
        var clicked = 0;

        var start = function (e) {
            clicked = 1;
            ctx.beginPath();
            ctx.globalCompositeOperation = 'source-over'; // reset this back to drawing
            x = e.pageX;
            y = e.pageY - 130;
            ctx.moveTo(x, y);
            // make a dot on tap
            ctx.arc(x, y, size/1.9, 0, 2 * Math.PI, false);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.beginPath(); // after dot, start a new line and reset properties
            ctx.globalCompositeOperation = 'source-over'; // reset this back to drawing
        };
        var move = function (e) {
            if (clicked) {
                lastx = x;
                lasty = y;
                x = e.pageX;
                y = e.pageY - 130;
                ctx.moveTo(lastx, lasty);
                ctx.lineTo(x, y);
                //ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
                ctx.closePath();
                ctx.strokeStyle = color;
                ctx.stroke();
            };
        };
        var stop = function (e) {
            clicked = 0;
            e.preventDefault;
        };

        $('#canvas').on('mousedown', start);
        $('#canvas').on('mousemove', move);
        $('#canvas').on('mouseup', stop);

    };

    function eraseTouch() {
        ctx.lineWidth = 18;
        var starteraser = function (e) {
            x = e.originalEvent.changedTouches[0].pageX;
            y = e.originalEvent.changedTouches[0].pageY - 130;
            ctx.beginPath();
            ctx.globalCompositeOperation = 'destination-out'; // reset this back to drawing
            ctx.moveTo(x, y);
            ctx.arc(x, y, size / 2, 0, 2 * Math.PI, false);
            ctx.fillStyle = 'rgba(0,0,0,1)';
            ctx.fill();
        };
        var moveeraser = function (e) {
            e.preventDefault();
            ctx.beginPath(); // after dot, start a new line
            ctx.globalCompositeOperation = 'destination-out'; // reset this back to drawing
            ctx.strokeStyle = 'rgba(0,0,0,1)';
            ctx.moveTo(x, y);
            x = e.originalEvent.changedTouches[0].pageX;
            y = e.originalEvent.changedTouches[0].pageY - 130;
            ctx.lineTo(x, y);
            ctx.closePath();
            ctx.stroke();
        };

        $('#canvas').on('touchstart', starteraser);
        $('#canvas').on('touchmove', moveeraser);

    };

    function eraseMouse() {
        ctx.lineWidth = 18;
        var clicked2 = 0;
        var starteraser = function (e) {
            clicked2 = 1;
            ctx.beginPath();
            x = e.pageX;
            y = e.pageY - 130;
            ctx.moveTo(x, y);
            ctx.globalCompositeOperation = 'destination-out';
            ctx.strokeStyle = 'rgba(0,0,0,1)';
        };
        var moveeraser = function (e) {
            if (clicked2) {
                ctx.beginPath();
                ctx.globalCompositeOperation = 'destination-out';
                ctx.strokeStyle = 'rgba(0,0,0,1)';
                ctx.moveTo(x, y);
                x = e.pageX;
                y = e.pageY - 130;
                ctx.lineTo(x, y);
                ctx.closePath();
                ctx.stroke();
            };
        };
        var stoperaser = function (e) {
            clicked2 = 0;
        };
        $('#canvas').on('mousedown', starteraser);
        $('#canvas').on('mousemove', moveeraser);
        $('#canvas').on('mouseup', stoperaser);
    };

    var brushTouch = function () {
        var canvas2
        var Canvas2Image = new Image();

        //new canvas
        if (!($('#canvas2').length)) {
            canvas2 = document.createElement('canvas');
            canvas2.id = 'canvas2';
            canvas2.width = window.innerWidth;
            canvas2.height = window.innerHeight - 90;
            canvas2.style.position = "absolute";
            canvas2.style.left = 0;
            $('#content').append(canvas2);
            ctx2 = canvas2.getContext("2d");
            ctx2.lineCap = "round";
            ctx2.lineJoin = 'round';
            ctx2.strokeStyle = color;
            ctx2.lineWidth = size;
            ctx2.fillStyle = color;
            ctx2.globalAlpha = .5;
        };

        var startbrush = function (e) {
            $('#canvas2').css('opacity', '1');  //show the 2nd canvas
            x = e.originalEvent.changedTouches[0].pageX;
            y = e.originalEvent.changedTouches[0].pageY - 130; // 130 came from trial and error
            ctx2.beginPath();
            ctx2.globalCompositeOperation = 'destination-atop';
            ctx2.moveTo(x, y);
            // make a dot on tap
            ctx2.arc(x, y, size / 1.9, 0, 2 * Math.PI, false);
            ctx2.fillStyle = color;
            ctx2.fill();
            ctx2.beginPath(); // after dot, start a new line and reset properties
            ctx2.globalCompositeOperation = 'destination-atop';
        };
        var movebrush = function (e) {
            e.preventDefault();
            ctx2.moveTo(x, y);
            x = e.originalEvent.changedTouches[0].pageX;
            y = e.originalEvent.changedTouches[0].pageY - 130;
            ctx2.lineTo(x, y);
            ctx2.lineWidth = size;
            ctx2.closePath();
            ctx2.strokeStyle = color;
            ctx2.stroke();
        };
        var stopbrush = function (e) {
            e.preventDefault;
            // draw canvas2 down on original canvas and remove canvas2
            ctx.globalCompositeOperation = 'source-over'; // reset this back to drawing
            
            Canvas2Image.onload = function () { // May take some time to load the src of the new image.  Just in case, do this:
                ctx.drawImage(Canvas2Image, 0, 0);
            }
            Canvas2Image.src = canvas2.toDataURL();

            $('#canvas2').css('opacity', '0');  //hide the canvas after you copy it down so you don't see it duplicated
        };

        $('#canvas2').on('touchstart', startbrush);
        $('#canvas2').on('touchmove', movebrush);
        $('#canvas2').on('touchend', stopbrush);

    };
    // ------------------------------------------

    var brushMouse = function () {
   
        ////new canvas
        ////if (!($('#canvas2').length)) {
        //    canvas2 = document.createElement('canvas');
        //    canvas2.id = 'canvas2';
        //    canvas2.width = window.innerWidth;
        //    canvas2.height = window.innerHeight - 130;
        //    canvas2.style.position = "absolute";
        //    canvas2.style.left = 0;
        //    $('#content').append(canvas2);
        //    ctx2 = canvas2.getContext("2d");
        //    ctx2.lineCap = "round";
        //    ctx2.lineJoin = 'round';
        //    ctx2.lineWidth = size;
        //    ctx2.strokeStyle = color;
        //    ctx2.globalAlpha = .5;
        ////};

        //var clicked = 0;

        //var startbrush = function (e) {

        //    ctx2.lineWidth = size;
        //    $('#canvas2').css('opacity', '1');  //show the 2nd canvas

        //    clicked = 1;
        //    ctx2.beginPath();
        //    ctx2.globalCompositeOperation = 'destination-atop';
        //    x = e.pageX;
        //    y = e.pageY - 130;
        //    ctx2.moveTo(x, y);
        //    // make a dot on tap
        //    ctx2.arc(x, y, size / 1.9, 0, 2 * Math.PI, false);
        //    ctx2.fillStyle = color;
        //    ctx2.fill();
        //    ctx2.beginPath(); // after dot, start a new line and reset properties
        //    ctx2.globalCompositeOperation = 'destination-atop';
        //};
        //var movebrush = function (e) {
        //    if (clicked) {
        //        lastx = x;
        //        lasty = y;
        //        x = e.pageX;
        //        y = e.pageY - 130;
        //        ctx2.lineWidth = size;
        //        ctx2.moveTo(lastx, lasty);
        //        ctx2.lineTo(x, y);
        //        ctx2.closePath();
        //        ctx2.strokeStyle = color;
        //        ctx2.stroke();
        //    };
        //};
        //var stopbrush = function (e) {
        //    clicked = 0;
        //    e.preventDefault;

        //    // draw canvas2 down on original canvas and remove canvas2
        //    var img = new Image();
        //    img.src = canvas2.toDataURL();
        //    ctx.globalCompositeOperation = 'source-over'; // reset this back to drawing
        //    ctx.drawImage(img,0,0);
        //    $('#canvas2').css('opacity','0');  //hide the canvas after you copy it down so you don't see it duplicated
        //};

        //$('#canvas2').on('mousedown', startbrush);
        //$('#canvas2').on('mousemove', movebrush);
        //$('#canvas2').on('mouseup', stopbrush);

    };
    // ------------------------------------------






    // Function to get picuture from camera and insert onto canvas
    // ------------------------------------------------------------------
    $scope.getPicture = function () {

    // Take picture using device camera and retrieve image as base64-encoded string
        navigator.camera.getPicture(onPhotoDataSuccess, onPhotoDataFail, {
            quality: 75, // reduced size to avoid memory  0-100
            destinationType: Camera.DestinationType.FILE_URI,
            correctOrientation: true,
            sourceType: Camera.PictureSourceType.CAMERA, // @@@@@@@@@@@@@@@@@@  Can also choose to select from photo album
        });
    }
    //Callback function when the picture has been successfully taken
    function onPhotoDataSuccess(imageData) {

        // *************************************************
        // ***** Does MegaPixelImage Detection need to happen here also?????

        //var megaPixelImg = new MegaPixImage(imageData);
        //var h = window.innerHeight - 90;
        //var w = window.innerWidth;
        //megaPixelImg.render(backgroundImage, { maxWidth: w, maxHeight: h, quality: 0.5 });

        // *************************************************

        backgroundImage.src = imageData; // use this for saving the canvas to file later
        $('#canvas').css('background-image', 'url(' + imageData + ')');// Set as Canvas background CSS

        //ctx.drawImage(backgroundImage, 0, 0); // draw resampled photo on top of canvas.  Right here, this will cover up any drawing!!!!

    }
    //Callback function when the picture has not been successfully taken
    function onPhotoDataFail(message) {
        console.log('Failed to load picture because: ' + message);
        $('#log').innerHTML += 'Failed to load picture because: ' + message;  // FOR TESTING ONLY
    }



    // Function to save the Canvas contents to an image on the file system
    // ------------------------------------------------------------------
    $scope.saveImage = function () {
        var w = window.innerWidth;
        var h = window.innerHeight - 90;

        // IF no background image from camera, THEN fill background with white rectangle so it isn't transparent
        // @@@ ENVENTUALLY WILL ADD METHOD TO LOOK FOR BACKGROUND IMAGE AND COMBINE WITH CANVAS BEFORE SAVING @@@
        ctx.globalCompositeOperation = 'destination-over'; // draw behind current drawing
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, w, h);
        ctx.globalCompositeOperation = 'source-over'; // reset this back to drawing

        // Using plugin to save to camera roll / photo gallery and return file path
        // ---
        window.canvas2ImagePlugin.saveImageDataToLibrary(
            function (filepath) {
                console.log('image file path is: ' + filepath); //alert(filepath); //filepath is the filename path (for android and iOS)
                // Save filepath to IndexedDB for gallery
                // --------
                var uid = globalService.makeUniqueID();
                var record = { uid: uid, filepath: filepath, datetime: Date.now() }; //JSON for unique id for picture, filepath to retrieve it, datetime in milliseconds
                globalService.drawappDatabasePut(record); // Save function @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
                // --------
            },
            function (err) {console.log(err);},
            document.getElementById('canvas') // This names the element that is the Canvas.  Other params can follow here with commas...format, quality,etc... ",'.jpg', 80," 
       );   
        $('#canvas').css('background-image', 'url()');// reset the CSS background 
    };





    // To upload file to Azure blob storage.  1. Call API to get a sasURL.  2. PUT the file using the sasURL 
    //  Upload call SaveImage and implicityly saves the canvas and and background to the 'photolibrary'
    // ----------------------------------
    $scope.uploadImage = function () {

        var sasUrl;
        var photoId;
        var requestUrl = "https://service-poc.azure-mobile.net/api/getuploadblobsas" // URL to the custom rest API

        // Save Canvas and combine any Background image first
        // @@@@@@@@@@@@@@@@@@@@@@@@@
        $scope.saveImage();

        // @@@@@@@@@@@@@ THIS IS BEING CALLED BEFORE SAVEIMAGE IS DONE SO THE BACKGROUND ISN'T IN CANVAS YET.
        var blob = dataURItoBlob(canvas.toDataURL("image/png", 1.0));// Convert the Base64 encoded image to just the blob

        // -------------------
        // Using a callback function passed as a para is supposed to work on StackOverflow
        // $scope.saveImage(getSasUrlandUpload);
        // .saveImage needs to be written to take a param and 'return true' at the very end to allow the next fuction to be called * I think
        // -------------------

        getSasUrlandUpload();


        // Get SAS URL using AJAX and Angular.  OnSuccess, update the image the SASUrl points to with our image
        // ----------------------------------------------------------------------------------------------------
        function getSasUrlandUpload() {
            var response = $http.get(requestUrl, {
                headers: { 'X-ZUMO-APPLICATION': 'IfISqwqStqWVFuRgKbgJtedgtBjwrc24' } // need a custom header for Azure Mobile Service Application key for "service-poc"
            })
            response.success(function (data, status, headers, config) { // response will send json in the parts
                sasUrl = data.sasUrl;
                //photoId = data.photoId; Not using right now
                updateFile(sasUrl);
                //putFile(sasUrl);
            });
            response.error(function (data, status, headers, config) {
                //console.log(status);
            });
        };

        // Use SAS URL and PhotID to PUT the image into the Azure Blob Storage container in the SASUrl
        // ----------------------------------
        function updateFile(Url) {
            var xhr = new XMLHttpRequest();
            xhr.open('PUT', Url, true);
            xhr.setRequestHeader('Content-Type', 'image/png');
            xhr.setRequestHeader('x-ms-blob-type', 'BlockBlob');
            xhr.send(blob);
        }

        // Convert base64/URLEncoded data component to raw binary data held in a string
        // ------------------------------
        function dataURItoBlob(dataURI) {
            var byteString;
            if (dataURI.split(',')[0].indexOf('base64') >= 0)
                byteString = atob(dataURI.split(',')[1]);
            else
                byteString = unescape(dataURI.split(',')[1]);
            // separate out the mime component
            var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
            // write the bytes of the string to a typed array
            var ia = new Uint8Array(byteString.length);
            for (var i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            return new Blob([ia], { type: mimeString });
        }

    };


    // Function to nav to gallery view
    // ------------------------------------------------------------------
    $scope.goToGallery = function () {

        // Test retrieving == FOR TESTING ONLY. 
        // -----------------------------------
        //globalService.drawappDatabaseFindRecordWhere('uid', "f6e2f81a-bc13-4109-9153-025319b8edbe");
        //setTimeout(function () { console.log('returned record is: ' + JSON.stringify(globalService.dbRecords[0])) }, 100) // This is a lousy hack.  Should be more elegant Callback method. 
        //globalService.drawappDatabaseGetall();
        //setTimeout(function () {
        //    var items = globalService.dbRecords[0]; // get a JSON collection
        //    // Split the JSON collection into an Array of JSON
        //    var arr = [];
        //    for (var x in items) {
        //        arr.push(items[x]);
        //    }
        //    // ---
        //    //console.log('returned record is: ' + JSON.stringify(arr[0])); // first JSON obj item in array)
        //    console.log('returned record is: ' + arr[0].uid); // JSON obj item in array at postion [x] with named JSON property .name)
        //}, 100) // This is a lousy hack.  Should be more elegant Callback method. 

        // --------------
        var foundItems = []; //dump out this array 
        var onSuccess = function (data) { foundItems.push(data); console.log(data) };//push into array
        globalService.drawappDatabase.getAll(onSuccess, function () { console.log('error') })
        // @@@@@@@@@@@@@@@@@@@@@@@@ MAYBE IS EASIER TO USE THE FUNCTIONS OUTSIDE SERVICE AND USE 'ONSUCCESS' AS THE CALLBACK @@@@@@@@@@@@@@@@@@@@@@@@@@

    };


    // Ugly hack to create an HTML canvas when the HTML partial view is loaded
    // -----------------------------------------------------------------------
    //define, resize, and insert canvas
        document.getElementById("content").style.height = window.innerHeight - 200;
        var canvas = '<canvas id="canvas" width="' + window.innerWidth + '" height="' + (window.innerHeight - 200) + '"></canvas>';
        document.getElementById("content").innerHTML = canvas;
    // setup canvas
        ctx = document.getElementById("canvas").getContext("2d");
        ctx.lineCap = "round";
        ctx.lineJoin = 'round';
        ctx.strokeStyle = color;
        ctx.lineWidth = line_Width;
    // setup to trigger drawing on mouse or touch
        drawTouch();
        drawMouse(); // only needed for testing
        $('#penicon1').addClass('pen1select');
        $('.black').css("borderColor", "transparent");

    });