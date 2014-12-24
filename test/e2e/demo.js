'use strict';

describe('Demo page', function () {

  var ptor = protractor.getInstance();

  beforeEach(function () {
    browser.get('http://localhost:3000');
  });

  it('should be able to play music', function () {

    browser.waitForAngular();

    element(by.css('button.ks-music-control')).click();

    browser.executeAsyncScript(function(callback) {
    })

  });
});
