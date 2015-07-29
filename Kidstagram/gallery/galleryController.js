// galleryController

cordovaNG.controller('galleryController', function ($scope, globalService) {


    // Test retrieving == FOR TESTING ONLY. 
    // -----------------------------------
    // IDB Wrapper - Get All Example - SAVE
    // ---------------------------------
    var onSuccess = function (data) {
        // --- !!! Split the JSON collection into an Array of JSON
        var arr = [];
        for (var x in data) {
            arr.push(data[x]);
        }
        // ---
        console.log('returned record is: ' + arr[0].uid); // JSON obj item in array at postion [x] with named JSON property .name
    };
    globalService.drawappDatabase.getAll(onSuccess, function () { console.log('error') })
    // --------------

    // Have to use $scope. to make available to the view
    $scope.gotoCanvas = function () {
        globalService.changeView('/');
    };


});