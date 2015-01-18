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
    redirectTo: '/'
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

app.controller('HomeCtrl', ['$scope', '$rootScope', function($scope, $rootScope) {
  $rootScope.root = {
    title: 'Home'
  };

  // Github Latest Commit
  if ($('#lastUpdated').length) { // Checks if widget div exists (Index only)
    $.ajax({
      url: "https://api.github.com/repos/sonph/sonph.github.io/commits/master",
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

    $scope.running = false;

    // $('#right').hide();
    $('#preloader').hide();
    
    $('#refreshbtn').on('click', function() {
      $scope.running = true;
      $('#refreshbtn').addClass('disabled');
      $('#right').fadeOut('fast');
      $('#right').hide();
      $('#preloader_td').addClass("center");
      $('#preloader').fadeIn('fast');

      // call function
      debug(editor_left, editor_right);
    });
  });
}]);


app.controller('AboutCtrl', ['$scope', '$rootScope', function($scope, $rootScope) {
  $rootScope.root = {
    title: 'About'
  };
}]);
