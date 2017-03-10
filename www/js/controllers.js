angular.module('controllers', [])

.controller('PlaceCtrl', function($scope, place){
  $scope.place = place;
})
.directive('groupedRadio', function() {
  return {
    restrict: 'A',
    require: 'ngModel',
    scope: {
      model: '=ngModel',
      value: '=groupedRadio'
    },
    link: function(scope, element, attrs, ngModelCtrl) {
      element.addClass('button');
      element.on('click', function(e) {
        scope.$apply(function() {
          ngModelCtrl.$setViewValue(scope.value);
        });
      });

      scope.$watch('model', function(newVal) {
        element.removeClass('button-positive');
        if (newVal === scope.value) {
          element.addClass('button-positive');
        }
      });
    }
  };
})
.directive('focusMe',['$timeout',function ($timeout) {
  return {
    link: function (scope, element, attrs) {
      if (attrs.focusMeDisable === "true") {
        return;
      }
      $timeout(function () {
        element[0].focus();
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
          cordova.plugins.Keyboard.show(); //open keyboard manually
        }
      }, 350);
    }
  };
}])
.controller('MapCtrl', function($scope, $state, $cordovaGeolocation, $ionicLoading, GooglePlacesService,$ionicPopup,$cordovaNetwork,$rootScope){

document.addEventListener("deviceready", function () {

    var type = $cordovaNetwork.getNetwork()

    var isOnline = $cordovaNetwork.isOnline()

    var isOffline = $cordovaNetwork.isOffline()


  


    // listen for Online event
    $rootScope.$on('$cordovaNetwork:online', function(event, networkState){
      var onlineState = networkState;
    })

    // listen for Offline event
    $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
      $ionicPopup.confirm({
          title: 'No Internet Connection',
          content: 'Sorry, no Internet connectivity detected. Please reconnect and try again.'
        })
        .then(function(result) {
          if(!result) {
            ionic.Platform.exitApp();
          }
        });
    })

  }, false);


//get your Location
 var options = {timeout: 10000, enableHighAccuracy: true};

      // Google Places search
      $scope.data = {};
      $scope.data.cash_availability = '';
      $scope.search = { input: '' };
      $scope.predictions = [];


    $scope.switchAvailabiltyClass = function(availabilty){
    console.log(availabilty,"availabilty")
     if(availabilty=="Available")
            return "availability"
     else
         return "not-availabile";
    }

      $scope.sharefeedback = function(place){
            place.cash_availability = place.cash
            $ionicLoading.show({
                  template: 'Submitting your feedback ...'
            });
            GooglePlacesService.shareFeedback(place)
          .then(function(status){
            // Clean map
            //cleanMap();

            $ionicLoading.hide().then(function(){
               var alertPopup = $ionicPopup.alert({
                 title: 'Feedback!',
                 template: 'Thanks for submitting your feedback. Please share the information with your family and friends.'
               });
             
               alertPopup.then(function(res) {
                    $scope.toggleGroup($scope.shownGroup);
               });              
            });
          });



      }


      // Keep track of every marker we create. That way we can remove them when needed
      $scope.markers_collection = [];
      $scope.markers_cluster = null;

      // To properly init the google map with angular js
      $scope.init = function(map) {
        $scope.mymap = map;
        $scope.$apply();
      };

      var showPlaceInfo = function(place){
            $state.go('place', {placeId: place.place_id});
          },
          cleanMap = function(){
            // Remove the markers from the map and from the array
            while($scope.markers_collection.length){
              $scope.markers_collection.pop().setMap(null);
            }

            // Remove clusters from the map
            if($scope.markers_cluster !== null){
              $scope.markers_cluster.clearMarkers();
            }
          },
          createMarker = function(place){
            // Custom image for marker
            var custom_marker_image = {
                  url: '../img/ionic_marker.png',
                  size: new google.maps.Size(30, 30),
                  origin: new google.maps.Point(0, 0),
                  anchor: new google.maps.Point(0, 30)
                },
                marker_options = {
                  map: $scope.mymap,
                  icon: custom_marker_image,
                  animation: google.maps.Animation.DROP
                };

            // Handle both types of markers, places markers and location (lat, lng) markers
            if(place.geometry){
              marker_options.position = place.geometry.location;
            }
            else {
              marker_options.position = place;
            }

            var marker = new google.maps.Marker(marker_options);

            // For the places markers we are going to add a click event to display place details
            if(place.place_id){
              marker.addListener('click', function() {
                showPlaceInfo(place);
              });
            }

            $scope.markers_collection.push(marker);

            return marker;
          },
          createCluster = function(markers){
            // var markerClusterer = new MarkerClusterer($scope.mymap, markers, {
            $scope.markers_cluster = new MarkerClusterer($scope.mymap, markers, {
              styles: [
                {
                  url: '../img/i1.png',
                  height: 53,
                  width: 52,
                  textColor: '#FFF',
                  textSize: 12
                },
                {
                  url: '../img/i2.png',
                  height: 56,
                  width: 55,
                  textColor: '#FFF',
                  textSize: 12
                },
                {
                  url: '../img/i3.png',
                  height: 66,
                  width: 65,
                  textColor: '#FFF',
                  textSize: 12
                },
                {
                  url: '../img/i4.png',
                  height: 78,
                  width: 77,
                  textColor: '#FFF',
                  textSize: 12
                },
                {
                  url: '../img/i5.png',
                  height: 90,
                  width: 89,
                  textColor: '#FFF',
                  textSize: 12
                }
              ],
              imagePath: '../img/i'
            });
          };

      $scope.tryGeoLocation = function(){
        $ionicLoading.show({
          template: 'Getting current position ...'
        });

        // Clean map
        cleanMap();
        $scope.search.input = "";

        $cordovaGeolocation.getCurrentPosition({
          timeout: 10000,
          enableHighAccuracy: true
        }).then(function(position){
          $ionicLoading.hide().then(function(){
            $scope.latitude = position.coords.latitude;
            $scope.longitude = position.coords.longitude;

            createMarker({lat: position.coords.latitude, lng: position.coords.longitude});
          });
        });
      };

      $scope.searchboxPosition = 'fixed';
      $scope.searchboxtopMargin = '40%';
      $scope.searchboxwidth = '95%';
      $scope.changeposition = function(query){
        $scope.searchboxPosition = '';
        $scope.searchboxtopMargin = '';
        $scope.searchboxwidth = '95%';
      }
      $scope.getPlacePredictions = function(query){

        $scope.nearby_places = '';
        if(query !== "")
        {
          GooglePlacesService.getPlacePredictions(query)
          .then(function(predictions){
            $scope.predictions = predictions;
          });
        }else{
          $scope.predictions = [];
        }
      };
      /*$scope.isdiplay = false;
      $scope.showFeedback = function(){

        $scope.isdiplay = !$scope.isdiplay;
      }*/
  /*
   * if given group is the selected group, deselect it
   * else, select the given group
   */
  $scope.toggleGroup = function(group) {
   if ($scope.isGroupShown(group)) {
      $scope.shownGroup = null;
    } else {
      $scope.shownGroup = group;
    }    
    group.show = !group.show;
  };
  $scope.isGroupShown = function(group) {
    return group.show;
  };      

      $scope.selectSearchResult = function(result){
        //console.log(JSON.stringify(result));
        $scope.search.input = result.description;
        $scope.predictions = [];

        $ionicLoading.show({
          template: 'Searching ATMs near '+result.description+' ...'
        });

        // With this result we should find restaurants arround this place and then show them in the map
        // First we need to get LatLng from the place ID


          var options = {};
            options.description = result.description;
        GooglePlacesService.getLatLng(result.place_id)
        .then(function(result_location){
            options.result_location = result_location;
          // Now we are able to search restaurants near this location
          GooglePlacesService.getPlacesNearbyCustom(options)
          .then(function(nearby_places){
            // Clean map
            //cleanMap();

            $ionicLoading.hide().then(function(){
             
             /* for (var i = 0; i < nearby_places.length; i++) {                
                  nearby_places.waitingtime = waitingtime;
                  console.log(nearby_places.waitingtime)
              }*/
                 // console.log("Debug");
                $scope.nearby_places = nearby_places;
              // Create cluster with places
              /*createCluster(places_markers);

              var neraby_places_bound_center = bound.getCenter();

              // Center map based on the bound arround nearby places
              $scope.latitude = neraby_places_bound_center.lat();
              $scope.longitude = neraby_places_bound_center.lng();

              // To fit map with places
              $scope.mymap.fitBounds(bound);*/
            });
          });
        });
      };
});
