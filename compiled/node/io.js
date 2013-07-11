// Generated by CoffeeScript 1.6.2
(function() {
  var adapters, async, bone, createIO;

  async = require('async');

  bone = {};

  bone.io = module.exports = function(source, options) {
    var adapter, _ref;

    adapter = (_ref = options.config) != null ? _ref.adapter : void 0;
    if (adapter == null) {
      adapter = 'socket.io';
    }
    return bone.io.adapters[adapter](source, options);
  };

  bone.io.defaults = {};

  bone.io.set = function(name, value) {
    return bone.io.defaults[name] = value;
  };

  adapters = bone.io.adapters = {};

  createIO = function(socket, options, type) {
    var io, name, route, source, _base, _base1, _base2, _fn, _fn1, _i, _len, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6;

    io = function(socket) {
      return createIO(socket, options);
    };
    io.socket = socket;
    io.sockets = options.config.server.sockets;
    io.source = options.source;
    if (typeof socket === 'string' || typeof socket === 'number') {
      type = 'room';
      io.socket = io.sockets["in"]("" + options.source + ":" + (socket.toString()));
    }
    source = options.source;
    io.error = options.error;
    io.options = options;
    io.inbound = options.inbound;
    if ((_ref = io.inbound) == null) {
      io.inbound = {};
    }
    io.outbound = options.outbound;
    if ((_ref1 = io.outbound) == null) {
      io.outbound = {};
    }
    if ((_ref2 = (_base = io.inbound).middleware) == null) {
      _base.middleware = [];
    }
    if ((_ref3 = (_base1 = io.outbound).middleware) == null) {
      _base1.middleware = [];
    }
    if ((_ref4 = (_base2 = io.outbound).shortcuts) == null) {
      _base2.shortcuts = [];
    }
    io.join = function(room) {
      return io.socket.join("" + source + ":" + room);
    };
    io.leave = function(room) {
      return io.socket.leave("" + source + ":" + room);
    };
    _ref5 = io.outbound.shortcuts;
    _fn = function(route) {
      return io[route] = function(data, context) {
        if (context != null) {
          data._messageId = context._messageId;
        }
        if (bone.log != null) {
          bone.log("Outbound: [" + source + ":" + route + "]");
        }
        return io.socket.emit("" + source + ":" + route, data);
      };
    };
    for (_i = 0, _len = _ref5.length; _i < _len; _i++) {
      route = _ref5[_i];
      _fn(route);
    }
    if (type === 'all' || type === 'room') {
      return io;
    }
    _ref6 = io.inbound;
    _fn1 = function(name, route) {
      return io.socket.on("" + source + ":" + name, function(data) {
        var context;

        if (bone.log != null) {
          bone.log("Inbound: [" + source + ":" + name + "]");
        }
        context = {
          cookies: socket.handshake.cookies,
          socket: socket,
          headers: socket.handshake.headers,
          handshake: socket.handshake,
          action: name,
          _messageId: data._messageId
        };
        delete data._messageId;
        return async.eachSeries(io.inbound.middleware, function(callback, next) {
          return callback(data, context, next);
        }, function(error) {
          if ((error != null) && (io.error != null)) {
            return io.error(error);
          }
          return route.apply(io, [data, context]);
        });
      });
    };
    for (name in _ref6) {
      route = _ref6[name];
      if (name === 'middleware') {
        continue;
      }
      _fn1(name, route);
    }
    return io;
  };

  adapters['socket.io'] = function(source, options) {
    var sockets, _ref;

    options.source = source;
    if (options.config == null) {
      options.config = bone.io.defaults.config;
    }
    if (((_ref = options.config) != null ? _ref.server : void 0) == null) {
      throw new Error('The Bone.io IO "socket.io" adapter needs a socket.io server!  You must at least provide {config: server: io} from socket.io.  Cheers!');
    }
    sockets = options.config.server.sockets;
    sockets.on('connection', function(socket) {
      return createIO(socket, options);
    });
    return createIO(sockets, options, 'all');
  };

}).call(this);
