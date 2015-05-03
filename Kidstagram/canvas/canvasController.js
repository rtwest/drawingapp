//canvasController

//////////////////////////////////////////////////////////////////////////////////////////
//  ISSUES
//  - *** Background not saved 'autosaved' with canvas on uploading.  Save, then Upload does work because Background is drawn into canvas. 
//  - Fix orientation to prevent rotating screen.  I think I fixed this in config.xml
//  - have 1 eraser size 20. I think I fixed this
//  -------
//  iOS
//  - CanvasPic re-drawn back onto Canvas at wrong size sometimes.  I think I fixed with a check for HiRes displays.  
//  - DrawTouch has weird 2nd dot on touch release and move start
//  -------
//  ANDROID - KINDLE
//  - AddPicture button doesn't work
//  - DrawTouch has weird 2nd dot on touch release and move start
//  -------
//  - Need to add text 
//  -------
//  - Need localStorage photolibrary.  Limit is 2-5MB.
//    - Saved array of file names in the device library?
//    - Saved array of file names & filename|file pairs?
//    - Saved photolibrary JSON object as key|JSONobject?
//    - Need to handel limit errors
//  - Need to figure out Sharing data needs
//    - Data needs - imagename, Who shared with > ,  
//
//
//////////////////////////////////////////////////////////////////////////////////////////



cordovaNG.controller('canvasController', function ($scope, $http, globalService) {

    // Scope is like the partial view datamodel.  'message' is defined in the paritial view
    $scope.message = 'This is the Canvas view';
    // Try seeing if you have image in localStorage
    try {
        document.getElementById("imagegoeshere").src = localStorage.getItem("image1");
    }
    catch (e) {
        console.log("Retrieve failed: " + e);
    };
    var ctx, color = "#000";
    var line_Width, size = 5;
    var tool = 'pen'
    var x, y, lastx, lasty = 0;
    var backgroundImage = new Image;


    // Function to setup a new canvas for drawing
    // ------------------------------------------
    $scope.newCanvas = function () {
        //define, resize, and insert canvas
        document.getElementById("content").style.height = window.innerHeight - 90;
        var canvas = '<canvas id="canvas" width="' + window.innerWidth + '" height="' + (window.innerHeight - 90) + '"></canvas>';
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
    };

    // For choosing the drawing tools
    // ------------------------------------------
    $scope.choosePen = function () {
        $('#canvas').off(); // reset event handler
        drawTouch();
        drawMouse(); // only needed for testing
        $('#pen').css('borderColor', '#fff');
        $('#eraser').css('borderColor', 'transparent');
    };
    $scope.chooseEraser = function () {
        $('#canvas').off(); // reset event handler
        eraseTouch(); 
        eraseMouse(); // for testing only
        $('#eraser').css('borderColor', '#fff');
        $('#pen').css('borderColor', 'transparent');
    };

    // For choosing the color
    // ------------------------------------------
    $scope.selectColor = function (clickEvent) {
        $scope.clickEvent = globalService.simpleKeys(clickEvent); // clean up click event

        // toggle the UI for the selected color
        for (var i = 0; i < document.getElementsByClassName("palette").length; i++) {
            document.getElementsByClassName("palette")[i].style.borderColor = "transparent";
        }
        clickEvent.target.style.borderColor = "#fff";

        color = window.getComputedStyle(clickEvent.target).backgroundColor; // set color to palette
        ctx.beginPath(); // start a new line
        ctx.strokeStyle = color; // set the new line color
    };

    // For choosing the brush size
    // ------------------------------------------
    $scope.selectSize = function (clickEvent) {
        $scope.clickEvent = globalService.simpleKeys(clickEvent);

        // toggle the UI for the selected size
        for (var i = 0; i < document.getElementsByClassName("palette2").length; i++) {
            document.getElementsByClassName("palette2")[i].style.borderColor = "transparent";
        }
        clickEvent.target.style.borderColor = "#fff";

        size = clickEvent.target.id;
        ctx.beginPath(); // start a new line
        ctx.lineWidth = size; // set the new line size
    };

    // prototype to	start drawing on TOUCH using canvas moveTo and lineTo
    // ------------------------------------------
    // @@@@   WHY THE -44PX ON Y AXIS?
    var drawTouch = function () {
        ctx.lineWidth = size;
        var start = function (e) {
            x = e.originalEvent.changedTouches[0].pageX;
            y = e.originalEvent.changedTouches[0].pageY - 44;
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
            y = e.originalEvent.changedTouches[0].pageY - 44;
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
    // @@@@   WHY THE -44PX ON Y AXIS?
    var drawMouse = function () {
        ctx.lineWidth = size;
        var clicked = 0;

        var start = function (e) {
            clicked = 1;
            ctx.beginPath();
            ctx.globalCompositeOperation = 'source-over'; // reset this back to drawing
            x = e.pageX;
            y = e.pageY - 44;
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
                y = e.pageY - 44;
                ctx.moveTo(lastx, lasty);
                ctx.lineTo(x, y);
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

    // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ NEED TO ADD ERASE TOUCH
    function eraseTouch() {
        ctx.lineWidth = 18;
        var starteraser = function (e) {
            x = e.originalEvent.changedTouches[0].pageX;
            y = e.originalEvent.changedTouches[0].pageY - 44;
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
            y = e.originalEvent.changedTouches[0].pageY - 44;
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
            y = e.pageY - 44;
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
                y = e.pageY - 44;
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

        // This plugin may be need for older Android.  Plugin in already in 'plugins' folder
        //window.canvas2ImagePlugin.saveImageDataToLibrary(
        //    function (msg) {
        //        console.log(msg);
        //    },
        //    function (err) {
        //        console.log(err);
        //    },
        //    document.getElementById('canvas')
        //);

        // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        //      THE PROBLEM IS IN HERE
        //      !!! background image fails to be redrawn on iOS
        //
        // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

        // Use same dimensions as canvas
        var h = window.innerHeight - 90;
        var w = window.innerWidth;

        var canvasPic = new Image(); // create a new image with the canvas drawing

        canvasPic.onload = function () { // May take some time to load the src of the new image.  Just in case, do this:
            ctx.clearRect(0, 0, w, h) // clear the canvas
            try { // fail safely if there is no background image

                // Test out fix for vertical squish here 
                // ==================================================
                // ==================================================
                // ==================================================

                // OLD CODE
                // detect high density display
                //// ------------------------------
                ////var isHiRes = function isHighDensity() {
                ////    return ((window.matchMedia && (window.matchMedia('only screen and (min-resolution: 124dpi), only screen and (min-resolution: 1.3dppx), only screen and (min-resolution: 48.8dpcm)').matches || window.matchMedia('only screen and (-webkit-min-device-pixel-ratio: 1.3), only screen and (-o-min-device-pixel-ratio: 2.6/2), only screen and (min--moz-device-pixel-ratio: 1.3), only screen and (min-device-pixel-ratio: 1.3)').matches)) || (window.devicePixelRatio && window.devicePixelRatio > 1.3));
                ////}
                //var isHiRes = ((window.matchMedia && (window.matchMedia('only screen and (min-resolution: 124dpi), only screen and (min-resolution: 1.3dppx), only screen and (min-resolution: 48.8dpcm)').matches || window.matchMedia('only screen and (-webkit-min-device-pixel-ratio: 1.3), only screen and (-o-min-device-pixel-ratio: 2.6/2), only screen and (min--moz-device-pixel-ratio: 1.3), only screen and (min-device-pixel-ratio: 1.3)').matches)) || (window.devicePixelRatio && window.devicePixelRatio > 1.3));
                //console.log(isHiRes);
                //// Platform-specific resizing.
                ////if (device.platform === 'iOS') { ctx.drawImage(backgroundImage, 0, 0, w, 2*h) } // for iOS
                //if (isHiRes) {
                //    ctx.drawImage(backgroundImage, 0, 0, w, 2 * h)
                //} // for iOS
                //else { ctx.drawImage(backgroundImage, 0, 0, w, h) } // for Android

                //GitHub solution here: https://github.com/stomita/ios-imagefile-megapixel/tree/master/test

                //var megaPixelImg = new MegaPixImage(backgroundImage);
                //var resCanvas = $('#canvas');
                //mpImg.render(resCanvas, { maxWidth: w, maxHeight: h }); // draw resampled backgroundimage into canvas element

                // Basic version
                ctx.drawImage(backgroundImage, 0, 0, w, h); // resize to w, h and will squish to fit aspect ratio. 
                //ctx.drawImage(backgroundImage, 0, 0);

                // ==================================================
                // ==================================================
                // ==================================================
            }
            catch (err) {document.getElementById('log').innerHTML += 'Failed redrawing background image ' + err + ' </br>'} // old school dom injection

            ctx.drawImage(canvasPic, 0, 0) // draw canvas drawing on top of background image
            //var imageDataURI = canvas.toDataURL("image/jpg", 1); // captures id=canvas data as image stream
            var imageDataURI = canvas.toDataURL(); // default is PNG.  0-1 only use for quality in JPG.

            // Save image into localStorage
            // ----------------------------
            // Can also use localStorage for a JSON array of Objects like records
            try {
                localStorage.setItem("image1", imageDataURI);
            }
            catch (e) {
                console.log("Storage failed: " + e);
                document.getElementById('log').innerHTML += 'Storage failed: ' + e + ' </br>' // old school dom injection
            };

            // FOR TESTING PURPOSE ONLY
            // ------------------------
            // Try seeing if you have image in localStorage
            try {
                document.getElementById("imagegoeshere").src = localStorage.getItem("image1");
            }
            catch (e) {
                console.log("Retrieve failed: " + e);
                document.getElementById('log').innerHTML += 'Retrieve failed: ' + e + ' </br>' // old school dom injection
            };

        };


        canvasPic.src = canvas.toDataURL();  // this is the trigger for the above onLoad function
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

    }


    });