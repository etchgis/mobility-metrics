const fs = require("fs");
const request = require("request");
const config = require("./../../config.json");

var provider = config.providers.bird;

function trips(stream, start, stop) {
  var opts = {
    url: provider.trips + "?start_time=" + start + "&end_time=" + stop,
    headers: {
      "Content-Type": "application/json",
      "APP-Version": "3.0.0",
      Authorization: "Bird " + provider.token
    }
  };

  scan(opts, (err) => {
    if (err)
      stream.destroy(err);
    else
      stream.end();
  });

  // recursive scan across
  function scan(opts, cb) {
    request.get(opts, (err, res, body) => {
      if (err) {
        cb(err);
        return;
      }

      var data = JSON.parse(body);

      // write any returned trips to stream
      data.data.trips.forEach(trip => {
        stream.write(trip);
      });

      // continue scan if another page is present
      if (data.links.next) {
        opts.url = data.links.next;
        scan(opts, cb);
      } else {
        cb();
      }
    });
  }
}

function changes(stream, start, stop) {
  var opts = {
    url: provider.status_changes + "?start_time=" + start + "&end_time=" + stop,
    headers: {
      "Content-Type": "application/json",
      "APP-Version": "3.0.0",
      Authorization: "Bird " + provider.token
    }
  };

  scan(opts, (err) => {
    if (err)
      stream.destroy(err);
    else
      stream.end();
  });

  // recursive scan across
  function scan(opts, cb) {
    request.get(opts, (err, res, body) => {
      if (err) {
        cb(err);
        return;
      }

      var data = JSON.parse(body);
      // write any returned changes to stream
      data.data.status_changes.forEach(change => {
        stream.write(change);
      });

      // continue scan if another page is present
      if (data.links.next) {
        opts.url = data.links.next;
        scan(opts, cb);
      } else {
        cb();
      }
    });
  }
}

module.exports.trips = trips;
module.exports.changes = changes;
