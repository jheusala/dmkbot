/*global Buffer: false, clearInterval: false, clearTimeout: false, console: false, global: false, exports:false, module: false, process: false, querystring: false, require: false, setInterval: false, setTimeout: false, __filename: false, __dirname: false */

var https = require("https"),
    util = require("util");

// Return the ISO 8601 format 
// Ref: https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Date#Example.3a_ISO_8601_formatted_dates
function ISODateString(d){
  var pad = function(n) { return n < 10 ? '0' + n : n; };
  return d.getUTCFullYear() + '-' +
         pad(d.getUTCMonth() + 1) + '-' +
         pad(d.getUTCDate()) + 'T' +
         pad(d.getUTCHours()) + ':' +
         pad(d.getUTCMinutes()) + ':' +
         pad(d.getUTCSeconds()) + 'Z';
}

function GithubModule(settings) {
  var self = this;

  this.settings = settings;
  this.reported = {};
  settings.repos.forEach(function (repo) {
    self.reported[repo] = {};
  });

  this.format = (settings.colors ?
    ("\x02%s:\x02 \x0303%s\x03: %s - %s") :
    ("%s: %s: %s - %s"));

  this.enabled = true;

  this.intervals = [[ function(cb) {
    self.settings.repos.forEach(function (repo) {
      self.getForRepo(repo, cb);
    });
  }, this.settings.interval]];
}

exports.Module = GithubModule;

GithubModule.prototype.getForRepo = function (repo, cb) {
  var obj = this,
      d = new Date(),
      options = {
        host: "api.github.com",
        path: '/repos/' + repo +  '/issues?since=' + ISODateString(d)
      },
      issue;

  if(this.settings.auth) {
    options.headers = {};
    options.headers['Authorization'] = this.settings.auth;
    //options.auth = this.settings.auth;
  }

  https.get(options, function(res) {
    var data = "";
    res.on('data', function(chunk) {
      data = data + chunk;
    });
    res.on('end', function() {
      try {
        data = JSON.parse(data);
      } catch(e) {
         console.error('Failed to parse data from Github: ' + e);
         return;
      }
      for (var i = 0; i < data.length; i+=1) {
        issue = data[i];
        if (!(issue.number in obj.reported) ||
            obj.reported[issue.number].updated_at !== issue.updated_at) {
          console.log('Reporting issue ' + issue.number.toString());
          obj.reported[issue.number] = issue;
          cb(util.format(obj.format,
                         repo,
                         issue.user.login,
                         issue.title,
                         issue.html_url
                        ));
        }
        else {
          console.warn('Issue ' + issue.number.toString() + ' already reported.');
        }
      }
    });
  });
};
