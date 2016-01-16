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
    var task = Tasks.findOne(taskId);
    if (Meteor.userId() !== task.owner)
      throw new Meteor.Error('not-authorized');
    Tasks.remove(taskId);
  },
  setChecked: function (taskId, value) {
    Tasks.update(taskId,{$set: {checked: value}});
  },
  setPrivate: function (taskId, value) {
    var task = Tasks.findOne(taskId);
    if (Meteor.userId() !== task.owner)
      throw new Meteor.Error('not-authorized');
    else
      Tasks.update(taskId,{$set: {private: value}});
  },
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
  angular.module('simple-todos',['angular-meteor','accounts.ui','ngMaterial']);
  angular.module('simple-todos').config(['$mdThemingProvider',function ($mdThemingProvider){
    $mdThemingProvider.theme('default')
          .primaryPalette('blue')
          .accentPalette('red')
          .warnPalette('grey');
  }]).controller('TodosListCtrl', ['$scope','$meteor','$mdDialog',
    function ($scope,$meteor,$mdDialog) {
      $scope.hideCompleted = false;

      $scope.query = {};
      $scope.$watch('hideCompleted', function (){
        if ($scope.hideCompleted)
          $scope.query = {checked: {$ne: true}};
        else
          $scope.query = {};
      });

      $scope.$meteorSubscribe('tasks');
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
      };

      $scope.setChecked = function (task) {
        $meteor.call('setChecked', task._id, !task.checked);
      };
      $scope.setPrivate = function (task) {
        $meteor.call('setPrivate', task._id, !task.private);
      }

      /**
       * Handle click about
       */
      $scope.showAbout = function () {
        $mdDialog.show(
          $mdDialog.alert()
            .parent(angular.element(document.querySelector('.container')))
            .title('About')
            .textContent('Todo list v0.1')
            .ok('OK')
        );
      };

      /**
       * Open menu callback
       */
      $scope.openMenu = function($mdOpenMenu, $ev, task) {
        $mdOpenMenu($ev);
      }
  }]);
}

if (Meteor.isServer) {
  Meteor.publish('tasks', function () {
    return Tasks.find({
      $or: [
        { private: {$ne: true}},
        { owner: this.userId}
      ]
    });
  });
}