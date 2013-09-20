/**!
 * fetchtweets.js by Fetch! (http://github.com/fetch/fetchtweets.js)
 * Was originally based on jtwt.js by Harbor (http://jtwt.hrbor.com)
 */

(function($){

  $.fn.extend({

    fetchtweets: function(options) {
      // Merge defaults with options
      var options = $.extend({}, $.fn.fetchtweets.defaults, options);

      return this.each(function() {
        return $(this).data('fetchtweets', new FetchTweets(this, options));
      });
    }
  });

  $.fn.fetchtweets.defaults = {
    username : 'fetch',
    query: '',
    count : 4,
    key: null,
    image_size: 48,
    convert_links: true,
    endpoint: 'api.fetchtweets.com',
    loader_text: 'Tweets worden geladen...',
    no_result: 'Geen recente tweets gevonden',
    show_user: true,
    show_date: true
  };

  var browser = function() {
    var ua = navigator.userAgent;
    return {
      ie: ua.match(/MSIE\s([^;]*)/)
    };
  }();

  var FetchTweets = function(el, options){
    this.el = el;
    this.$el = $(this.el);
    this.options = options;
    this.render();
    this.fetch();
  };

  $.extend(FetchTweets.prototype, {

    render: function(){
      this.$container = $('<ul class="fetchtweets ft"></ul>');
      this.$loader = $('<li class="ft-loader ft-tweet">' + this.options.loader_text + '</li>');
      this.$noresults = $('<li class="ft-noresult ft-tweet">' + this.options.no_result + '</li>');

      this.$container.append(this.$loader);
      this.$el.append(this.$container);

      this.$loader.fadeIn('slow');
    },

    fetch: function(){
      var params = {count: this.options.count, key: this.options.key}, endpoint
        , scheme = /https?:/.test(window.location.protocol) ? window.location.protocol : 'http:';

      // Check if there is a search query given, if not fetch user tweets
      if(this.options.query) {
        endpoint = scheme + '//' + this.options.endpoint + '/1.1/search/tweets.json';
        params.q = this.options.query;
        this.normalizeResults = function(data){ return data.statuses; };
      } else {
        endpoint = scheme + '//' + this.options.endpoint + '/1.1/statuses/user_timeline.json';
        params.screen_name = this.options.username;
      }

      // Fetch the tweets from the API
      $.ajax({
        url: endpoint,
        data: params,
        dataType: 'jsonp',
        success: $.proxy(this.processResults, this)
      });
    },

    normalizeResults: function(data){ return data; },

    processResults: function(data){
      var results = this.normalizeResults(data);

      if(results.length) {
        this.$loader.hide();
        // Loop through results and append them to the parent
        var i = 0, item;
        for(; i < results.length; i++) {
          item = results[i];
          tweet = this.renderTweet(item);
          this.$container.append(tweet);
        }
      } else {
        // If there are no tweets, display the "no results" container
        this.$loader.fadeOut('fast', function() {
          this.$container.append(this.$noresults);
          this.$noresults.fadeIn();
        });
      }
    },

    convertLinks: function(text){
      text = text.replace(/(http\:\/\/[A-Za-z0-9\/\.\?\=\-]*)/g,'<a href="$1">$1</a>');
      text = text.replace(/@([A-Za-z0-9\/_]*)/g,'<a href="http://twitter.com/$1">@$1</a>');
      text = text.replace(/#([A-Za-z0-9\/\.]*)/g,'<a href="http://twitter.com/search?q=$1">#$1</a>');
      return text;
    },

    formatDate: function(dateString) {
      var date = new Date(dateString);
      if (browser.ie) {
        date = Date.parse(dateString.replace(/( \+)/, ' UTC$1'));
      }
      var client_date = new Date();

      var day = date.getDate()
        , month = date.getMonth() + 1
        , year = date.getFullYear();

      var diff = Math.floor((client_date - date) / 1000);
      if (diff <= 1) {return "zojuist";}
      if (diff < 20) {return diff + " seconden geleden";}
      if (diff < 40) {return "halve minuut geleden";}
      if (diff < 60) {return "minder dan een minuut geleden";}
      if (diff <= 90) {return "een minuut geleden";}
      if (diff <= 3540) {return Math.round(diff / 60) + " minuten geleden";}
      if (diff <= 5400) {return "1 uur geleden";}
      if (diff <= 86400) {return Math.round(diff / 3600) + " uur geleden";}
      if (diff <= 129600) {return "1 dag geleden";}
      if (diff < 604800) {return Math.round(diff / 86400) + " dagen geleden";}
      if (diff <= 777600) {return "1 week geleden";}
      return "op " + (day + "-" + month + "-" + year);
    },

    renderTweet: function(item){
      var tweet = '<li class="ft-tweet">';

      if (this.options.image_size) {
        tweet += '<div class="ft-picture">';
        tweet += '<a href="http://twitter.com/' + item.user.screen_name + '">';
        tweet += '<img width="' + this.options.image_size +'" height="' + this.options.image_size + '" src="' + item.user.profile_image_url + '" />';
        tweet += '</a>';
        tweet += '</div>';
      }

      tweet += '<div class="ft-content">';
      if(this.options.show_user){
        tweet += '<p class="ft-tweet-user"><a href="http://twitter.com/' + item.user.screen_name + '">' + item.user.name + ':</a></p>';
      }

      var tweettext = item.text
        , tweetdate = this.formatDate(item.created_at);

      if (this.options.convert_links) {
        tweettext = this.convertLinks(tweettext);
      }

      tweet += '<p class="ft-tweet-text">' + tweettext + '</p>';
      if(this.options.show_date){
        tweet += '<a href="http://twitter.com/' + item.user.screen_name + '/statuses/' + item.id_str + '" class="ft-date">' + tweetdate + '</a>';
      }
      tweet += '</div>';
      tweet += '</li>';
      return tweet;
   }
  });

})(jQuery);
