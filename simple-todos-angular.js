Tasks = new Mongo.Collection('tasks');

if (Meteor.isClient) {
 
  function onReady() {
    angular.bootstrap(document, ['simple-todos']);
  }
 
  if (Meteor.isCordova)
    angular.element(document).on('deviceready', onReady);
  else
    angular.element(document).ready(onReady);
  
  // This code only runs on the client
  angular.module('simple-todos',['angular-meteor']);
 
  angular.module('simple-todos').controller('TodosListCtrl', ['$scope','$meteor',
    function ($scope,$meteor) {
 
      $scope.tasks = $meteor.collection(function (){
        return Tasks.find({},{sort: {createAt: -1}});
      });
      $scope.text = '';

      $scope.addTask = function() {
        if ($scope.text == '')
          return;
        $scope.tasks.push({
          text: $scope.text,
          createAt: new Date()
        });
        $scope.text = '';
      };
  }]);
}