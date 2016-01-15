Tasks = new Mongo.Collection('tasks');

if (Meteor.isClient) {
 
  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });

  function onReady() {
    angular.bootstrap(document, ['simple-todos']);
  }
 
  if (Meteor.isCordova)
    angular.element(document).on('deviceready', onReady);
  else
    angular.element(document).ready(onReady);

  // This code only runs on the client
  angular.module('simple-todos',['angular-meteor','accounts.ui']);
 
  angular.module('simple-todos').controller('TodosListCtrl', ['$scope','$meteor',
    function ($scope,$meteor) {


      $scope.hideCompleted = false;
      $scope.$watch('hideCompleted', function (){
        if ($scope.hideCompleted)
          $scope.query = {checked: {$ne: true}};
        else
          $scope.query = {};
      });
      $scope.query = {};

      $scope.tasks = $meteor.collection(function (){
        return Tasks.find($scope.getReactively('query'),{sort: {createAt: -1}});
      });
      $scope.text = '';

      $scope.addTask = function() {
        // Check empty text and user login
        if ($scope.text == '' || Meteor.userId() == null)
          return;
        var insert = {
          text: $scope.text,
          createAt: new Date(),
          owner: Meteor.userId(),
          username: Meteor.user().username
        };
        $scope.tasks.push(insert);
        $scope.text = '';
      };

      $scope.incompleteCount = function () {
        return Tasks.find({ checked: {$ne: true} }).count();
      };
      $scope.checkEdit = function (e){
        $scope.edit = true;
      };
      $scope.test = function () {
        console.log(Meteor.user().username);
      }
  }]);
}