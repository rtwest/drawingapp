// galleryController

cordovaNG.controller('galleryController', function ($scope, globalService) {

    // IDB Wrapper - Get All saved images into an array
    // ===============================================
    var onSuccess = function (data) {
        // --- Split the JSON collection into an Array of JSON
        var arr = [];
        for (var x in data) {
            arr.push(data[x]);
        }  // ---
        $scope.galleryItems = arr; // Put the array from indexedDB into this view's scope
        $scope.$apply(); // @@@ CRITICAL: To get view to update after $scope datamodel has updated -- but no UI action triggered it, use .$apply() @@@
        // ...
        // Put other functions of the page here on data load success
        // ...
    };
    // This is the main trigger on the page that kicks off the other actions in onSuccess
    globalService.drawappDatabase.getAll(onSuccess, function () { console.log('error') })  //onSuccess is the key part.  After ',' is onFail
    // ================================================

    // View changer.  Have to use $scope. to make available to the view
    // --------------
    $scope.gotoCanvas = function () {
        globalService.changeView('/');
    };

    // Scope is like the view datamodel.  'gallerymessage' is defined in the paritial view
    $scope.gallerymessage = "Nothing here yet";  //- TEST ONLY

    // Method for getting the image UID in indexedDB from the DOM attributes
    // ----------------
    $scope.galleryImageClick = function (clickEvent) {
        $scope.clickEvent = globalService.simpleKeys(clickEvent);
        $scope.imageUID = clickEvent.target.id; // DOM attribute

        $scope.gallerymessage = $scope.imageUID; // FOR TESTTING
    };

}); //controller end