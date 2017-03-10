angular.module('services', [])

.service('GooglePlacesService', function($q,$http,apiUrl){
  this.getPlacePredictions = function(query){
    var dfd = $q.defer(),
    		service = new google.maps.places.AutocompleteService();

    service.getPlacePredictions({ input: query }, function(predictions, status){
      if (status != google.maps.places.PlacesServiceStatus.OK) {
        dfd.resolve([]);
      }
      else
      {
        dfd.resolve(predictions);
      }
    });

    return dfd.promise;
  };

	this.getLatLng = function(placeId){
    var dfd = $q.defer(),
				geocoder = new google.maps.Geocoder;

		geocoder.geocode({'placeId': placeId}, function(results, status) {
      if(status === 'OK'){
        if(results[0]){
					dfd.resolve(results[0].geometry.location);
				}
				else {
					dfd.reject("no results");
				}
			}
			else {
				dfd.reject("error");
			}
		});

    return dfd.promise;
  };

	this.getPlacesNearbyCustom = function(options){
		var dfd = $q.defer();
	    var reqUrl = apiUrl+"/lists/atm?options="+JSON.stringify(options);
	    var opts = { 
	        method: options.method || 'GET',  
	        headers : options.headers || {} 
	        };
	        
    
     $http({
       url : reqUrl,
       method : 'GET',
       timeout : dfd.promise,
       data : opts,
       headers : {
           Accept : '*/*'
       },
      }).success( function(data, status, headers, config){
          // console.log(data);
          dfd.resolve(data);
      }).error(function(data, status, headers, config){
          //errors.httpHandler(data, status, headers(), callback);
          dfd.resolve([]);
      });		
      return dfd.promise;	
	}
	this.shareFeedback = function(feedback){
		var dfd = $q.defer();
	    var reqUrl = apiUrl+"/post/feedback";
     $http({
       url : reqUrl,
       method : 'POST',
       timeout : dfd.promise,
       data : feedback,
       headers : {
           Accept : '*/*'
       },
      }).success( function(data, status, headers, config){
          // console.log(data);
          dfd.resolve(data);
      }).error(function(data, status, headers, config){
          //errors.httpHandler(data, status, headers(), callback);
          dfd.resolve([]);
      });		
      return dfd.promise;	
	}

	this.getPlacesNearby = function(location){
		console.log(JSON.stringify(location))
		// As we are already using a map, we don't need to pass the map element to the PlacesServices (https://groups.google.com/forum/#!topic/google-maps-js-api-v3/QJ67k-ATuFg)
		var dfd = $q.defer(),
				elem = document.createElement("div"),
    		service = new google.maps.places.PlacesService(elem);

		service.nearbySearch({
	    location: location,
	    radius: '5000',
	    types: ['atm']
	  }, function(results, status){
			if (status != google.maps.places.PlacesServiceStatus.OK) {
		    dfd.resolve([]);
		  }
			else {
				dfd.resolve(results);
			}
		});

    return dfd.promise;
  };

	this.getPlaceDetails = function(placeId){
		// As we are already using a map, we don't need to pass the map element to the PlacesServices (https://groups.google.com/forum/#!topic/google-maps-js-api-v3/QJ67k-ATuFg)
		var dfd = $q.defer(),
				elem = document.createElement("div"),
    		service = new google.maps.places.PlacesService(elem);

		service.getDetails({
	    placeId: placeId
	  }, function(place, status){
			if (status == google.maps.places.PlacesServiceStatus.OK) {
		    dfd.resolve(place);
		  }
			else {
				dfd.resolve(null);
			}
		});

    return dfd.promise;
  };
})
.filter('kilometers', ['$filter', function ($filter) {
  return function (input, decimals) {
    return $filter('number')(input / 1000, decimals) + ' km away';
  };
}]);
;
