/*global Buffer: false, clearInterval: false, clearTimeout: false, console: false, global: false, exports:false, module: false, process: false, querystring: false, require: false, setInterval: false, setTimeout: false, util: false, __filename: false, __dirname: false */

function DocsModule(settings) {
  this.settings = settings;
  this.routes = [
    [/^doc link ([a-z_]+)(#([a-zA-Z]+))?( (v[0-9]+\.[0-9]+\.[0-9]+))?/, this.onLink]
  ];
}

exports.Module = DocsModule;

DocsModule.prototype.onLink = function(from, command, args, callback) {
  var v = args[5] || 'latest',
      anchor = (args[3]) ? ('#' + args[1] + '.' + args[3]) : '';
  callback('http://nodejs.org/docs/' + v + '/api/' + args[1] + '.html' + anchor);
};
