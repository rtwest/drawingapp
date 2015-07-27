// galleryController

cordovaNG.controller('gallerfyController', function ($scope, globalService) {


    // Test retrieving == FOR TESTING ONLY. 
    // -----------------------------------
    var foundRecords = globalService.drawappDatabaseGetall();
    console.log(foundRecords);
    // --------------


});