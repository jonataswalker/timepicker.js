var vars = config.vars;

var time = {
  hour: 12,
  minute: 15
};

casper.test.setUp(function() {
  casper.start(config.url, function() {
    casper.viewport(1024, 768);
  });
});

casper.test.tearDown(function(done) {
  casper.run(done);
});

casper.test.begin('opens on focus', 1, function(test) {
  casper.thenEvaluate(function() {
    var input_focused = document.getElementById('time'),
        timepicker = new TimePicker(input_focused);
    
    input_focused.focus();
  });
  
  casper.wait(100);
  
  casper.then(function() {
    test.assertVisible('.' + vars.namespace + vars.container_class);
  });
  
  test.done();
});

casper.test.begin('opens on link', 1, function(test) {
  var link_id = 'link';
  casper.thenEvaluate(function(link_id) {
    var timepicker = new TimePicker(link_id);
  }, link_id);
  
  casper.thenClick('#' + link_id);
  
  casper.wait(100);
  
  casper.then(function() {
    test.assertVisible('.' + vars.namespace + vars.container_class);
  });
  
  test.done();
});

casper.test.begin('using programatically', 2, function(test) {
  var link_id = 'link';
  
  casper.thenEvaluate(function(link_id) {
    window.timepicker = new TimePicker(link_id);
    timepicker.show();
  }, link_id);
  
  casper.wait(150);
  
  casper.then(function() {
    test.assertVisible('.' + vars.namespace + vars.container_class);
  });
  
  casper.thenEvaluate(function() {
    window.timepicker.hide();
  });
  
  casper.wait(500);
  
  casper.then(function() {
    test.assertNotVisible('.' + vars.namespace + vars.container_class);
  });
  
  test.done();
});

casper.test.begin('sets time properly', 1, function(test) {
  casper.thenEvaluate(function() {
    var input_focused = document.getElementById('time'),
        timepicker = new TimePicker(input_focused);

    window.time_chosen = {
      hour: 0,
      minute: 0
    };
    
    timepicker.on('change', function(evt) {
      var value = (evt.hour || '00') + ':' + (evt.minute || '00');
      evt.element.value = value;
      
      window.time_chosen = {
        hour: evt.hour,
        minute: evt.minute
      };
    });
    
    input_focused.focus();
  });
  
  casper.waitUntilVisible('.' + vars.namespace + vars.container_class, function() {
    this.click('['+ vars.attr.hour +'="'+ time.hour +'"]');
    this.click('['+ vars.attr.minute +'="'+ time.minute +'"]');
  });
  
  casper.waitFor(function() {
    return this.evaluate(function(time) {
      return +window.time_chosen.hour === +time.hour && 
                  +window.time_chosen.minute === +time.minute;
    }, time);
  }, function() {
    test.pass('Ok, time is set properly');
  }, function() {
    test.fail('Couldn\'t listen for new time!');
  });
  
  test.done();
});
