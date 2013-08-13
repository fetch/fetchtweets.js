/**!
 * fetchtweets.js by Fetch! (http://github.com/fetch/fetchtweets.js)
 * based on jtwt.js by Harbor (http://jtwt.hrbor.com)
 */

(function($){

  $.fn.extend({

    fetchtweets: function(options) {

      // Declare defaults
      var defaults = {
        username : 'fetch',
        query: '',
        count : 4,
        image_size: 48,
        convert_links: true,
        loader_text: 'Tweets worden geladen...',
        no_result: 'Geen recente tweets gevonden'
      };

      // Merge defaults with options
      var options = $.extend({}, defaults, options);

      // customized parseTwitterDate. Base by http://stackoverflow.com/users/367154/brady - Special thanks to @mikloshenrich
      var parseTwitterDate = function(tdate) {
        var system_date = new Date(tdate.replace(/^\w+ (\w+) (\d+) ([\d:]+) \+0000 (\d+)$/, "$1 $2 $4 $3 UTC"));
        var user_date = new Date();

        var d = new Date();
        var curr_date = d.getDate();
        var curr_month = d.getMonth() + 1;
        var curr_year = d.getFullYear();

        var diff = Math.floor((user_date - system_date) / 1000);
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
        return "op " + (curr_date + "-" + curr_month + "-" + curr_year);
      };

      return this.each(function() {

        var $this = $(this)
          , $container = $('<ul class="fetchtweets"></ul>')
          , $loader = $('<li class="fetchtweets-loader fetchtweets-tweet" style="display:none;">' + options.loader_text + '</li>')
          , $noresults = $('<li class="fetchtweets-noresult fetchtweets-tweet" style="display:none;">' + options.no_result + '</li>');

        $this.append($container);

        $container.append($loader);
        $loader.fadeIn('slow');

        // Check if there is a search query given, if not fetch user tweets
        var params = {count: options.count}, endpoint, normalize;
        if(options.query) {
          endpoint = '//fetchtweets.herokuapp.com/api.twitter.com/1.1/search/tweets.json';
          params.q = options.query;
          normalize = function(data){ return data.statuses; };
        } else {
          endpoint = '//fetchtweets.herokuapp.com/api.twitter.com/1.1/statuses/user_timeline.json';
          params.screen_name = options.username;
          normalize = function(data){ return data; };
        }

        // Fetch the tweets from the API
        $.getJSON(endpoint + '?callback=?', params, function(data){
          var results = normalize(data);

          if(results.length) {
            $loader.hide();
            // Loop through results and append them to the parent
            var i = 0;
            for(; i < options.count && i < results.length; i++) {
              var item = results[i];

              jtweet = '<li class="fetchtweets-tweet">';

              if (options.image_size) {
                jtweet += '<div class="fetchtweets-picture">';
                jtweet += '<a href="http://twitter.com/' + item.from_user + '">';
                jtweet += '<img width="' + options.image_size +'" height="' + options.image_size + '" src="' + item.profile_image_url + '" />';
                jtweet += '</a>';
                jtweet += '</div>';
              }

              var tweettext = item.text
                , tweetdate = parseTwitterDate(item.created_at);

              if (options.convert_links) {
                tweettext = tweettext.replace(/(http\:\/\/[A-Za-z0-9\/\.\?\=\-]*)/g,'<a href="$1">$1</a>');
                tweettext = tweettext.replace(/@([A-Za-z0-9\/_]*)/g,'<a href="http://twitter.com/$1">@$1</a>');
                tweettext = tweettext.replace(/#([A-Za-z0-9\/\.]*)/g,'<a href="http://twitter.com/search?q=$1">#$1</a>');
              }

              jtweet += '<p class="fetchtweets-tweet-text">' + tweettext + '</p>';
              jtweet += '<a href="http://twitter.com/' + item.from_user + '/statuses/' + item.id_str + '" class="fetchtweets-date">' + tweetdate + '</a>';

              jtweet += '</li>';

              $container.append(jtweet);
            }
          } else {

            // If there are no tweets, display the "no results" container
            $loader.fadeOut('fast', function() {
              $container.append($noresults);
              $noresults.fadeIn('slow');
            });
          }
        });
      });
    }
  });
})(jQuery);
