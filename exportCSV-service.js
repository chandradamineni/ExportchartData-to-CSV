define(['angular', './c-module'], function(angular, module) {
    'use strict';
    /**
     * Excursion Service is a service that integrates with the Excursions API
     */
    module.factory('CService', ['$q', '$http', function($q, $http) {
       var baseUrl = 'api/';
       var transformInboxData = function(entities) {
            var deferred = $q.defer();
            var newEntities = [];
            if(entities !==null){
            $q.all(entities.map(function(entity){
                var qmap = $q.defer();
               /* var d = new Date(entity.creationDate);
                var day = (d.getUTCDate() < 10) ? '0' + d.getUTCDate() : d.getUTCDate();
                var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                var month = monthNames[d.getUTCMonth()];
                var year = d.getUTCFullYear();
                //var date =  month + '/' + day + '/' + year.toString();*/
                 var dateWithZone =  POA.getTimeString(Number(entity.modifiedDate), '', 'MM/DD/YYYY z-LT');
                  var date = dateWithZone.split('-')[0]; // Date
                  var hour =  dateWithZone.split('-')[1]; // Time in hours
                var tempEntitie = entity;
                tempEntitie.hour = hour;
                tempEntitie.date = date;
                tempEntitie.id=entity.case_id;
                tempEntitie.epoch=entity.modifiedDate;
                newEntities.push(tempEntitie);
                qmap.resolve();
                return qmap;
            }))
            .then(function() {
                deferred.resolve(newEntities);
            }, function() {
                deferred.reject('Error transforming data');
            });
          }else
        {
   deferred.resolve([]);
          }

            return deferred.promise;
        };
       /* Posting data to back end for newly created case*/
        var postCaseData = function(payload){          
            var apiUrl = baseUrl+'cases/';
            var deferred = $q.defer();
            $http.post(apiUrl,payload)
              .success(function(data) {
                  deferred.resolve(data);
              })
              .error(function() {
                deferred.reject('Error in creating cases');
              });
            return deferred.promise;
        };
         
        var getAllCasesInbox = function(){
            var deferred = $q.defer();
           var apiUrl = baseUrl + 'cases/all_cases/';
            //var promise = $http.get(apiUrl);
             //return promise;
                $http.get(apiUrl)
                .success(function(data) {
                    transformInboxData(data.data).then(function(newData) {
                        deferred.resolve(newData);
                    }, function() {
                        deferred.reject('Error adding details to excursions');
                    });
                })
                .error(function() {
                    deferred.reject('Error fetching excursions');
                });
            return deferred.promise;
        };
        return{
           postCaseData: postCaseData,
           getAllCasesInbox: getAllCasesInbox
        };    
    }]);
});