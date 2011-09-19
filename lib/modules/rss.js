/*global Buffer: false, clearInterval: false, clearTimeout: false, console: false, global: false, exports:false, module: false, process: false, querystring: false, require: false, setInterval: false, setTimeout: false, __filename: false, __dirname: false */

/* 
 * RSS Feed Reader Module
 * Copyright 2011 Jaakko-Heikki Heusala <jheusala@iki.fi>
 */

var rssee = require('rssee'),
    util = require('util');

function RSSReaderModule(settings) {
  try {
    var mod = this,
        queue = [],
        f,
        feed_opts,
        rss;
    mod.settings = settings || {};
    mod.routes = [];
    mod.interval = null;
    if(!mod.settings.interval) {
      mod.settings.interval = 15*1000;
    }
    mod.feeds = {};
    function queue_push(a) {
      try {
        if(settings.debug) {
          util.log('[rss] Received new article, adding it to the queue.');
        }
        queue.push(a);
      } catch(e) {
        console.error('Error: ' + e);
        if(settings.debug && e.stack) {
          console.log('stack:\n' + e.stack);
        }
      }
    }
    for(f in mod.settings.feeds) {
      if(mod.settings.feeds.hasOwnProperty(f)) {
        feed_opts = mod.settings.feeds[f];
        if(!feed_opts.interval) {
          feed_opts.interval = mod.settings.interval;
        }
        rss = rssee.create({'interval': feed_opts.interval/1000 });
        mod.feeds[f] = rss;
        rss.on('article', queue_push);
        if(settings.debug) {
          util.log('[rss] Watching now ' + f + ' with url="' + feed_opts.url + '", interval=' + feed_opts.interval + '.');
        }
        rss.start(feed_opts.url);
      }
    }
    mod.intervals = [[ function(cb) {
      try {
        if(settings.debug) {
          util.log('[rss] Queue has ' + queue.length + ' items.'+ ((queue.length!==0) ? ' Loading it now.' : '') );
        }
        var a, title, link;
        do {
          a = queue.shift();
          if(a) {
            title = a.title || 'Untitled';
            link = a.link || '[no link]';
            cb('[rss] ' + title + ' - ' + link);
          }
        } while(a);
      } catch(e) {
        console.error('Error: ' + e);
        if(settings.debug && e.stack) {
          console.log('stack:\n' + e.stack);
        }
      }
    }, mod.settings.interval]];
  } catch(e) {
    console.error('Error: ' + e);
    if(settings.debug && e.stack) {
      console.log('stack:\n' + e.stack);
    }
  }
}

exports.Module = RSSReaderModule;
