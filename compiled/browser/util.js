// Generated by CoffeeScript 1.6.2
(function() {
  bone.async = {};

  bone.async.eachSeries = function(arr, iterator, callback) {
    var completed, iterate;

    callback = callback || function() {};
    if (!arr.length) {
      return callback();
    }
    completed = 0;
    iterate = function() {
      return iterator(arr[completed], function(err) {
        if (err) {
          callback(err);
          return callback = function() {};
        } else {
          completed += 1;
          if (completed >= arr.length) {
            return callback(null);
          } else {
            return iterate();
          }
        }
      });
    };
    return iterate();
  };

}).call(this);
