'use strict';

var app = angular.module('app', ['ngRoute']);

app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  $routeProvider.when('/', {
    templateUrl: 'home.html',
    controller: 'HomeCtrl'
  })
  .when('/about', {
    templateUrl: 'about.html',
    controller: 'AboutCtrl'
  })
  .otherwise({
    templateUrl: 'home.html',
    controller: 'HomeCtrl'
  });
  // $locationProvider.html5Mode(true);
}]);

app.run(function($rootScope) {
  $(document).ready(function() {
    $('.dropdown-button').dropdown({"hover": false});
    // if (window_width > 600) {
    //   $('ul.tabs').tabs();
    // }
    // else {
    //   $('ul.tabs').hide();
    // }
    $('.tab-demo').show().tabs();
    $('.parallax').parallax();
    $('.modal-trigger').leanModal();
    $('.tooltipped').tooltip({"delay": 45});
    $('.collapsible-accordion').collapsible();
    $('.collapsible-expandable').collapsible({"accordion": false});
    $('.materialboxed').materialbox();
    $('.scrollspy').scrollSpy();
    $('.button-collapse').sideNav();
  });
});

app.controller('HomeCtrl', ['$scope', '$rootScope', '$location', function($scope, $rootScope, $location) {
  $rootScope.root = {
    title: 'Home'
  };

  // Github Latest Commit
  if ($('#lastUpdated').length) { // Checks if widget div exists (Index only)
    $.ajax({
      url: "https://api.github.com/repos/sonph/hackutds15/commits/master",
      dataType: "json", 
      success: function (data) {
        var sha = data.sha;
        var date = jQuery.timeago(data.commit.author.date);
        // if (window_width < 600) {
        //   sha = sha.substring(0,7);
        // }
        // $('.github-commit').find('.date').html(date);
        $('#lastUpdated').html(date);
        //$('.github-commit').find('.sha').html(sha).attr('href', data.html_url);
        // $('.github-commit').find('.sha').html(sha.substring(0, 7));

        // console.log(returndata, returndata.commit.author.date, returndata.sha);
      }  
    });      
  }

  var window_width = $(window).width;

  $('.dropdown-button').dropdown({"hover": false});
  if (window_width > 600) {
    $('ul.tabs').tabs();
  }
  else {
    $('ul.tabs').hide();
  }
  $('.tab-demo').show().tabs();
  $('.parallax').parallax();
  $('.modal-trigger').leanModal();
  $('.tooltipped').tooltip({"delay": 45});
  $('.collapsible-accordion').collapsible();
  $('.collapsible-expandable').collapsible({"accordion": false});
  $('.materialboxed').materialbox();
  $('.scrollspy').scrollSpy();
  $(document).ready(function() {
    $('.button-collapse').sideNav();
  });

  $(document).ready(function() {
    var editor_left = ace.edit("left");
    editor_left.setTheme("ace/theme/xcode");
    editor_left.getSession().setMode("ace/mode/javascript");
    editor_left.setFontSize(14);
    editor_left.$blockScrolling = Infinity;

    var editor_right = ace.edit("right");
    editor_right.setTheme("ace/theme/xcode");
    editor_right.getSession().setMode("ace/mode/javascript");
    editor_right.setReadOnly(true);
    editor_right.renderer.setShowGutter(false); 
    editor_right.setHighlightActiveLine(false);
    editor_right.renderer.$cursorLayer.element.style.opacity = 0;
    editor_right.textInput.getElement().disabled = true;
    editor_right.commands.commmandKeyBinding = {};
    editor_right.setFontSize(14);
    editor_right.$blockScrolling = Infinity;

    $scope.running = false;
    $scope.lastRefresh = new Date().getTime();
    $scope.firstTime = true; // first time on page load?
    $scope.refreshInterval = 2000;
    $scope.animationDuration = 300;
    $scope.domain = 'http://localhost:8000/#/';
    $scope.defaultContent = '//hello \
    ';

    // get Parse data
    Parse.initialize("uY92Wyjl4MhYl4i9wBptpFIDqYSAh4A9wjSRLe29", "4D0HZli6Yw7u4gEdpV1XHpBoWhPWEiQVmzZ23gWV");
    // var TestObject = Parse.Object.extend("TestObject");
    // var testObject = new TestObject();
    // testObject.save({foo: "bar"}).then(function(object) {
    //   alert("yay! it worked");
    // });

    var parseSave = function() {
      console.log('parseSave called');
      var CodeObject = Parse.Object.extend("CodeObject");
      var codeObj = new CodeObject();
      // codeObj.set(code, R.join('\n', editor_left.session.getDocument().getAllLines()));
      console.log("content", R.join('\n', editor_left.session.getDocument().getAllLines()));
      codeObj.save({
        content: R.join('\n', editor_left.session.getDocument().getAllLines())
      }, 
      {
        success: function(obj) {
          console.log("parse success");
          // toast('New object created with objectId: ' + obj.id, 3000);
          window.prompt("Your link:", $scope.domain + obj.id);
        }, 
        error: function(obj, error) {
          console.log("parse error");
          toast('Failed to save: ' + error.message, 5000);
        }
      });
    };

    var parseLoad = function(id) {
      console.log("LOADDING", id);
      var CodeObject = Parse.Object.extend("CodeObject");
      var query = new Parse.Query(CodeObject);
      query.get(id, {
        success: function(obj) {
          toast('Loaded');
          console.log('LOADED CONTENT', obj.attributes.content);
          editor_left.setValue(obj.attributes.content);
          editor_left.selection.clearSelection();
          editor_left.gotoLine(0, 0, false);
        },
        error: function(obj, error) {
          toast('Failed to load: ' + error.message, 5000); 
          editor_left.setValue($scope.defaultContent);
          editor_left.selection.clearSelection();
          editor_left.gotoLine(0, 0, false);
        }
      });
    };

    $('#savebtn').click(function() {
      console.log('#savebtn clicked');
      parseSave();
    });

    var load = function(id) {
      $scope.running = true;
      $('#refreshbtn').addClass('disabled');
      $('#right').fadeOut('fast');
      $('#right').hide();
      $('#preloader_td').addClass("center");
      $('#preloader').fadeIn('fast');

      // call function
      setTimeout(function() {
        parseLoad(id);
        $('#preloader').fadeOut('fast');
        $('#preloader').hide();
        $('#preloader_td').removeClass("center");
        $('#right').fadeIn('fast');
        $('#refreshbtn').removeClass('disabled');
        $scope.running = false;
      }, $scope.animationDuration);
    };

    console.log("PATH:", $location.path());
    var path = $location.path().trim();
    if (path != '/') {
      if (path.charAt(0) == '/') {
        $scope.contentid = path.substr(1);
      } else {
        $scope.contentid = path;
      }
      load($scope.contentid);
    } else {
      editor_left.setValue($scope.defaultContent);
      editor_left.selection.clearSelection();
      editor_left.gotoLine(0, 0, false);
    }

    // preloader animation
    // $('#right').hide();
    $('#preloader').hide();

    // set refresh rate to max one refresh per $scope.refreshInterval
    var interval = function() {
      var now = new Date().getTime();
      if (((now - $scope.lastRefresh) < $scope.refreshInterval) && !$scope.firstTime) {
        setTimeout(refresh, $scope.refreshInterval - (now - $scope.lastRefresh));
      }

      $scope.firstTime = false;

      $scope.lastRefresh = now;
      refresh();
    };


    // wait for user to finish typing
    var timer = 0;
    var onKeydown = function(e) {
      $scope.running = true;
      $('#refreshbtn').addClass('disabled');
      $('#right').fadeOut('fast');
      $('#right').hide();
      $('#preloader_td').addClass("center");
      $('#preloader').fadeIn('fast');
    };
    $('#left').on('keydown', onKeydown);
    var onKeyup =  function(e){
      if ($scope.firstTime) {
        refresh();
        $scope.firstTime = false;
      } else {
        if (timer) {
          clearTimeout(timer);
        }
        timer = setTimeout(function() {
          debug(editor_left, editor_right);
          $('#preloader').fadeOut('fast');
          $('#preloader').hide();
          $('#preloader_td').removeClass("center");
          $('#right').fadeIn('fast');
          $('#refreshbtn').removeClass('disabled');
          $scope.running = false;
        }, 500); 
      }
    };
    $('#left').on('keyup', onKeyup);



    // refresh function and animation
    var refresh = function() {
      $scope.running = true;
      $('#refreshbtn').addClass('disabled');
      $('#right').fadeOut('fast');
      $('#right').hide();
      $('#preloader_td').addClass("center");
      $('#preloader').fadeIn('fast');

      // call function
      setTimeout(function() {
        debug(editor_left, editor_right);
        $('#preloader').fadeOut('fast');
        $('#preloader').hide();
        $('#preloader_td').removeClass("center");
        $('#right').fadeIn('fast');
        $('#refreshbtn').removeClass('disabled');
        $scope.running = false;
      }, $scope.animationDuration);
    };

    // refresh button and refresh on change
    $('#refreshbtn').on('click', refresh);
    // editor_left.on('change', interval);

    // auto refresh checkbox
    $('#autorefresh').click(function() {
      if ($(this).is(':checked')) {
        // $scope.autorefresh = true;
        editor_left.on('change', refresh);
      } else {
        // $scope.autorefresh = false;
        editor_left.removeListener('change', refresh);
      }
    });

    // radio buttons
    $('input[name=group1]').on('click', function() {
      var id = $(this).prop('id');
      console.log(id);
      if (id == 'fancy') {
        $scope.animationDuration = 50000;
      } else {
        $scope.animationDuration = 0;
      }
    });

    refresh(); // first time on page load
  });
}]);


app.controller('AboutCtrl', ['$scope', '$rootScope', function($scope, $rootScope) {
  $rootScope.root = {
    title: 'About'
  };
}]);
