Tasks = new Mongo.Collection('tasks');

Meteor.methods({
  addTask: function (text) {
    if (!Meteor.userId())
      throw new Meteor.Error('not-authorized');

    Tasks.insert({
      text: text,
      createAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username
    });
  },
  deleteTask: function (taskId) {
    // var task = Tasks.findOne(taskId);
    // if (Meteor.userId() != task.owner)
    //   throw new Meteor.Error('not-authorized');
    Tasks.remove(taskId);
  },
  setChecked: function (taskId, value) {
    // var task = Tasks.findOne(taskId);
    // if (Meteor.userId() != task.owner)
    //   throw new Meteor.Error('not-authorized');
    Tasks.update(taskId,{$set: {checked: value}});
  }
});

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
        $meteor.call('addTask', $scope.text);
        $scope.text = '';
      };

      $scope.incompleteCount = function () {
        return Tasks.find({ checked: {$ne: true} }).count();
      };
      $scope.deleteTask = function (task) {
        $meteor.call('deleteTask', task._id);
      }
      $scope.setChecked = function (task) {
        $meteor.call('setChecked', task._id, !task.checked);
      }
  }]);
}