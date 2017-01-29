define(['angular', './c-module'], function(angular, controllers) {
    'use strict';
    // Controller definition
    controllers.controller('cToolCtrl', ['$scope', '$q', '$http', '$log', '$compile', 'PUserService',
        function($scope, $q, $http, $log, $compile, PUserService) {

            moment.tz.setDefault('America/Chicago');

            //loading spiner 
            $scope.loading = true;

            //default 24 hrs range 

            $scope.rangeTime = function() {
                // var currDate= new Date();
                var currDateMs = moment().valueOf();
                var last24HrsTime = currDateMs - (24 * 60 * 60000);
                $scope.fetchcDetails(last24HrsTime, currDateMs);
                $scope.currTime = moment().toISOString();
                $scope.prevsTime = moment().subtract(1, 'day').toISOString();
                $('#rangemodal').attr('range', '{ "from":'
                 + JSON.stringify($scope.prevsTime) + ' , "to": ' 
                 + JSON.stringify($scope.currTime) + '}');

            };
            //changing the data according to selected range 
            var rangemdl = document.querySelector('#rangemodal');
            rangemdl.addEventListener('px-submit-range', function() {
                $scope.loading = true;
                var rangePickerStr = $('#rangemodal').attr('range');
                var dateRange = JSON.parse(rangePickerStr);
                var fromDate = moment(dateRange.from).valueOf();
                var toDate = moment(dateRange.to).valueOf();
                $scope.fetchcDetails(fromDate, toDate);
            });
            //exporting to CSV
            $scope.exportToCSV = function() {
                var expData = $scope.mainData;
                var csvContent = 'data:text/csv;charset=utf-8,';
                csvContent += 'Case Id,Case Owner,Date Closed,Date Modified,Date Opened,Genuine,Is Action Required,No Of Action Completed,Number Of Action,Priority,Reportable,Status' + '\n';
                for (var i = 0; i < expData.length; i++) {
                    var currObj = expData[i];
                    var dateFormat = 'MM/DD/YYYY hh:mm:ss a z';
                    // var currData = currObj.data;
                    var closedDate = (currObj['dateClosed'] === null) ? '--' : moment(currObj['dateClosed']).format(dateFormat);
                    var modifiedDate = (currObj['dateModified'] === null) ? '--' : moment(currObj['dateModified']).format(dateFormat);
                    csvContent += currObj['caseId'] + ',' + currObj['caseOwner'] + ',' + closedDate + ',' + modifiedDate + ',' + moment(currObj['dateOpened']).format(dateFormat) + ',' + currObj['genuine'] + ',' + currObj['isActionRequired'] + ',' + currObj['noOfActionsCompleted'] + ',' + currObj['numberOfAction'] + ',' + currObj['priority'] + ',' + currObj['reportable'] + ',' + currObj['status'] + '\n';
                }
                var encodedUri = encodeURI(csvContent);
                var link = document.createElement('a');
                link.setAttribute('href', encodedUri);
                link.setAttribute('download', 'c-monitor-data.csv');
                document.body.appendChild(link); // Required for FF
                link.click();
            };
            //Transforming the data
            $scope.transformData = function(data) {
                var transformedDataSet = [];
                for (var i = 0; i < data.length; i++) {
                    var currentObj = {};
                    currentObj.caseId = (data[i].caseId) ? data[i].caseId : '---';
                    currentObj.caseOwner = (data[i].caseOwner) ? data[i].caseOwner : '';
                    currentObj.dateClosed = (data[i].dateClosed) ? moment(data[i]['dateClosed']).format('MM/DD/YYYY hh:mm:ss a z') : '---';
                    currentObj.dateModified = (data[i].dateModified) ? moment(data[i]['dateModified']).format('MM/DD/YYYY  hh:mm:ss a z') : '---';
                    currentObj.dateOpened = (data[i].dateOpened) ? moment(data[i]['dateOpened']).format('MM/DD/YYYY hh:mm:ss a z') : '---';
                    currentObj.genuine = (data[i].genuine) ? data[i].genuine : 'false';
                    currentObj.isActionRequired = (data[i].isActionRequired) ? data[i].isActionRequired : '---';
                    currentObj.nofOfActionCompleted = (data[i].noOfActionsCompleted) ? data[i].noOfActionsCompleted : '0';
                    currentObj.numberOfAction = (data[i].numberOfAction) ? data[i].numberOfAction : '0';
                    currentObj.priority = (data[i].priority) ? data[i].priority : '---';
                    currentObj.reportable = (data[i].reportable) ? data[i].reportable : 'false';
                    currentObj.status = (data[i].status) ? data[i].status : '---';
                    transformedDataSet.push(currentObj);
                }
                return transformedDataSet;
            };
            //API fetch - put in service
            var baseUrl = 'api/';
            /**
             * fetch the c details
             */
            $scope.fetchcDetails = function(fromTime, toTime) {
                //alert("clicked");
                var deferred = $q.defer();
                var apiUrl = baseUrl + 'c/allc/' + fromTime + '/' + toTime + '/';

                $http.get(apiUrl)
                    .success(function(data) {
                        $scope.loading = false;
                        $scope.mainData = data.data;
                        $scope.tableData = $scope.transformData(data.data);
                        deferred.resolve(data);
                    })
                    .error(function() {
                        $scope.loading = false;
                        deferred.reject('Error fetching excursions');
                    });
            };
            $scope.rangeTime();
        }
    ]);
});
