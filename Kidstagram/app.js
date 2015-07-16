/*  
NOTES:

*/

// THIS IS THE MORE STANDARD CORDOVA WAY.  MEANS YOU HAVE TO ADD <SCRIPT>app.initialize();</SCRIPT> TO INDEX.HTML ALSO
var app = {
    // Application Constructor
    initialize: function () {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener('pause', this.onPause, false);
        document.addEventListener('resume', this.onResume, false);
    },
    
    onPause: function() {
        // TODO: This application has been suspended. Save application state here.
        //alert('app paused');
    },

    onResume: function() {
        // TODO: This application has been reactivated. Restore application state here.
        //alert('app resumed');
    },

    // deviceready Event Handler
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function () {

        // #region notification-registration	
        // &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
        // Define the PushPlugin.
        var pushNotification = window.plugins.pushNotification;
		
        // Platform-specific registrations.
        if ( device.platform == 'android' || device.platform == 'Android' ){
            // Register with GCM for Android apps.
            console.log('this is android device');

            pushNotification.register(
               app.successHandler, app.errorHandler,
               { 
                   "senderID": '168753624064',  // GCM_SENDER_ID, Project number generated on the Google Dev' Console at console.developers.google.com
                   "ecb": "app.onNotificationGCM" 
               });
        } else if (device.platform === 'iOS') {
            console.log('this is iOS device');

            // Register with APNS for iOS apps.			
            pushNotification.register(
                app.tokenHandler,
                app.errorHandler, { 
                    "badge":"true",
                    "sound":"true",
                    "alert":"true",
                    "ecb": "app.onNotificationAPN"
                });
        }
        else if(device.platform === "Win32NT"){
            // Register with MPNS for WP8 apps.
            pushNotification.register(
				app.channelHandler,
				app.errorHandler,
				{
				    "channelName": "MyPushChannel",
				    "ecb": "app.onNotificationWP8",
				    "uccb": "app.channelHandler",
				    "errcb": "app.ErrorHandler"
				});
        }
        // #endregion notifications-registration
        // &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
    },

    // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    // #region notification-callbacks
    // Callbacks from PushPlugin
    onNotificationGCM: function (e) {
        switch (e.event) {
            case 'registered':
                // Handle the registration.
                //document.getElementById('log').innerHTML += 'GCM regid from PushNotification is '+ e.regid +' </br>'// old school dom injection

                if (e.regid.length > 0) {
                    console.log("gcm id " + e.regid);

                    if (client) {

                        // Create the integrated Notification Hub client.
                        var hub = new NotificationHub(client);

                        // Template registration.
                        var template = "{ \"data\" : {\"message\":\"$(message)\"}}";

                        // Register for notifications.
                        // (gcmRegId, ["tag1","tag2"], templateName, templateBody)
                        hub.gcm.register(e.regid, null, "myTemplate", template).done(function () {
                            alert("Registered with hub!");
                            document.getElementById('log').innerHTML += 'Registered with hub!</br>'// old school dom injection

                        }).fail(function (error) {
                            alert("Failed registering with hub: " + error);
                            document.getElementById('log').innerHTML += 'Failed registering with hub:</br>'// old school dom injection

                        });
                    }
                    //else {};
                }
                break;

            case 'message':

                if (e.foreground) {
                    // Handle the received notification when the app is running
                    // and display the alert message. 
                    alert(e.payload.message);

                    // Reload the items list.
                    //refreshTodoItems();  .. this function not in my app
                }
                break;

            case 'error':
                alert('GCM error: ' + e.message);
                break;

            default:
                alert('An unknown GCM event has occurred');
                break;
        }
    },

    // Handle the token from APNS and create a new hub registration.
    tokenHandler: function (result) {
        if (client) {

            // Create the integrated Notification Hub client.
            var hub = new NotificationHub(client);

            // This is a template registration.
            var template = "{\"aps\":{\"alert\":\"$(message)\"}}";

            // Register for notifications.
            // (deviceId, ["tag1","tag2"], templateName, templateBody, expiration)
            //document.getElementById('log').innerHTML += 'device token for APNS from PushNotification : '+result+' </br>'// old school dom injection

            hub.apns.register(result, null, "myTemplate", template, null).done(function () {
                alert("Registered with hub!");
                document.getElementById('log').innerHTML += 'Registered with hub!</br>'// old school dom injection

            }).fail(function (error) {
                alert("Failed registering with hub: " + error);
                document.getElementById('log').innerHTML += 'Failed registering with hub:</br>'// old school dom injection

            });
        }
        //else {};
    },

    // Handle the notification when the iOS app is running.
    onNotificationAPN: function (event) {

        if (event.alert) {
            // Display the alert message in an alert.
            alert(event.alert);

            // Reload the items list.
            //refreshTodoItems();
        }

        // // Other possible notification stuff we don't use in this sample.
        // if (event.sound){
        // var snd = new Media(event.sound);
        // snd.play();
        // }

        // if (event.badge){

        // pushNotification.setApplicationIconBadgeNumber(successHandler, errorHandler, event.badge);
        // }

    },

    // Handle the channel URI from MPNS and create a new hub registration. 
    channelHandler: function (result) {
        if (result.uri !== "") {
            if (client) {

                // Create the integrated Notification Hub client.
                var hub = new NotificationHub(client);

                // This is a template registration.
                var template = "<?xml version=\"1.0\" encoding=\"utf-8\"?>" +
                    "<wp:Notification xmlns:wp=\"WPNotification\">" +
                        "<wp:Toast>" +
                            "<wp:Text1>$(message)</wp:Text1>" +
                        "</wp:Toast>" +
                    "</wp:Notification>";

                // Register for notifications.
                // (channelUri, ["tag1","tag2"] , templateName, templateBody)
                hub.mpns.register(result.uri, null, "myTemplate", template).done(function () {
                    alert("Registered with hub!");
                }).fail(function (error) {
                    alert("Failed registering with hub: " + error);
                });
            }
        }
        else {
            console.log('channel URI could not be obtained!');
        }
    },

    // Handle the notification when the WP8 app is running.
    onNotificationWP8: function (event) {
        if (event.jsonContent) {
            // Display the alert message in an alert.
            alert(event.jsonContent['wp:Text1']);

            // Reload the items list.
            //refreshTodoItems();
        }
    },
    // #endregion notification-callbacks

    successHandler: function (result) {
        console.log("callback success, result = " + result);
    },

    errorHandler: function (error) {
        alert(error);
    },
    // &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&

}; // end of 'app' class






/*
**************************************************************************************************************************
**************************************************************************************************************************
BEGIN ANGULAR SIDE OF THE APP
**************************************************************************************************************************
**************************************************************************************************************************
*/


// ==================================================
// Create the module and name it azurepocApp
// ==================================================

var cordovaNG = angular.module('cordovaNG', [
    'ngRoute',
    'azure-mobile-service.module',
    'ui.bootstrap'
]);
// ==================================================
// ==================================================


// ==================================================
// Set up local storage usage
// ==================================================

var storage_name = 'lawnchairgallery';  // table name

cordovaNG.run(function($rootScope, remoteResources){ //$rootScope is the top most scope and like a JS object / Global var for all

    //$rootScope.api_base = "http://your-domain.com/api/";  // I don't think I have a need for this here with other Azure means for access
});
// ==================================================
// ==================================================


// ==================================================
// Configure the routes for navigation
// ==================================================

cordovaNG.config(function ($routeProvider) {
    $routeProvider
        // route for the draw view
        .when('/draw', {
            templateUrl: 'draw/draw.html',
            controller: 'drawController'
        })
        // route for the canvas view
        .when('/', {
            templateUrl: 'canvas/canvas.html',
            controller: 'canvasController'
        })
        // route for the home view
        .when('/home', {
            templateUrl: 'partials/home.html',
            controller: 'mainController'
        })
        // route for the managed users view
        .when('/view2', {
            templateUrl: 'partials/view2.html',
            controller: 'view2Controller'
        });
});

// ==================================================
// ==================================================


// ==================================================
// Configure service for global use - global data model and localStorage?
// Common Global Functions and Variables to reuse across controllers.  Service seems like a classes with methods and vars.
// Service can have dependencies with a weird 'injection notation' []
// Inject factory/service <name> as a dependency to controllers to make available.
// ==================================================

cordovaNG.service('globalService', ['$location', function ($location) {

    // Global vars
    // ----------

    // Global functions
    // ----------
    return {
        // Functions for get/set on global vars.  
        // !!!! Persistent Vars in the UI maybe better stored in SESSIONSTORAGE for reload on page refresh
        //----------


        // Global functions
        // ----------------
        changeView: function (view) { // Simple method to change view anywhere
            $location.path(view); // path not hash
        },
        simpleKeys: function (original) { // Helper Recommedation from AngularJS site. Return a copy of an object with only non-object keys we need this to avoid circular references - though I'm not really sure why
            return Object.keys(original).reduce(function (obj, key) {
                obj[key] = typeof original[key] === 'object' ? '{ ... }' : original[key];
                return obj;
            }, {});
        }

    };

}]);
// ==================================================
// ==================================================



// ==================================================
// Create the controllers and inject Angular's $scope
// ==================================================

cordovaNG.controller('mainController', function ($scope, Azureservice) {

    // Scope is like the partial view datamodel.  'message' is defined in the paritial view
    $scope.message = 'Welcome ' + localStorage.user + ', Angular working';

    $scope.loginstatus = Azureservice.isLoggedIn();


    // Had to wrap this Azure Mobile Client call into a function so it wasn't automatically called on view load for some reason
    // -------------------------------
    $scope.azurelogin = function () {
        
        // Call the login method in teh Azure mobile wrapper for Google
        Azureservice.login('google')
        .then(function () { // when done, do this
            $scope.loginstatus = 'Login successful';

            // ###################################################
            // ---------------------------------------------------
            // Example of using a custom API on the Azure Mobile Service called 'servie-POC' that 
            // has 'user' preview function enabled using VS CLI
            Azureservice.invokeApi('userauthenticationproperties') // name of the Custom API
            .then(function (response) { // on success, return this JSON result
                if (response.google) { // if the response obj has a 'google' parameter, it's from Google 
                    // --------
                    // JSON digging specific to the Google Auth returned properties
                    // ---------
                    // using html5 browser storage.  May have to convert from response string to js obj (JSON.parse(string)), 
                    //    but not in the simple case below
                    localStorage.user = response.google.name;
                    $scope.message = 'Welcome ' + localStorage.user;

                };
            },
            function (err) {
                console.error('Azure Custom API Error: ' + err);
                document.getElementById('log').innerHTML += 'Azure Custom API Error: ' + err +' - ' + JSON.stringify(response) +'</br>'// old school dom injection

            })
            // ###################################################

            // @@@@@@ using injected service 'global service' defined function to load another view
            //globalService.changeView('managedusers');

        },
        function (err) {
            $scope.loginstatus = 'Azure Error: ' + err;
            document.getElementById('log').innerHTML += 'login function error: ' + err + '</br>'// old school dom injection
        });
    };

    // Creating var in the $scope view model and will bind to this in the HTML partial with 'ng-model=<$scope.var>'
    // ---------------------------------------------------
    $scope.managedUsername = '';

    // load data from online for the managed user with this name (SHOULD BE MORE SECURE)
    // --------------------------------------
    $scope.loadFromCloud = function () {

        document.getElementById('log').innerHTML += 'Called load from Azure</br>'// old school dom injection

        // Query the Azure table using the Azure service wrapper
        // ---------------------------------------------------
        Azureservice.query('todotable', {
            criteria: { mobileid: '63E726A5-A3B7-49F7-B976-52E382800C8D' }, // Where statement - Guid put on global $rootScope var
            columns: ['id', 'todoitemtitle', 'todoitemstatus'] // Only return these columns
        })
            .then(function (todolistforuser) {
                document.getElementById('log').innerHTML += 'got data</br>'// old school dom injection
                $scope.todolistforuser = todolistforuser;   // Assign the results to a $scope variable 
            }, function (err) {
                document.getElementById('log').innerHTML += 'could not get data</br>'// old school dom injection;
            }
        );
    };
    // Ng-repeat used to list DOM elements with DB table rowid loaded into elementID so its captured on the target.id
    // Need this to retreive GUID in Div ID property for record CRUD
    // ------------------------------------------
    //$scope.todoitemclick = function (clickEvent) {
    //    $scope.clickEvent = globalService.simpleKeys(clickEvent);
    //    $scope.toDoItemId = clickEvent.target.id;
    //    document.getElementById('log').innerHTML += 'selected item '+$scope.toDoItemId+'</br>'// old school dom injection;

    //};


});
// ==================================================


cordovaNG.controller('view2Controller', function ($scope) {

    // Scope is like the partial view datamodel.  'message' is defined in the paritial view
    $scope.message = 'Angular routing is working too';

});


// ==================================================
// ==================================================





// ==================================================
// ==================================================
