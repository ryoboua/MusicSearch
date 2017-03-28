/*  JavaScript Document                      */
// API provided by last.fm

var searchRequest;
var APIPrefix = "http://ws.audioscrobbler.com/2.0/";
var API_Key = "1c23b546288836b5727e9ec3875c4003";
var $album_wrap = $('.album_wrap');
var $artist_wrap = $('.artist_wrap');
var $album_list = $('.album_list');
var $artist_list = $('.artist_list');
var $artist_info_wrap = $('.artist_info_wrap');
var $album_info_wrap = $('.album_info_wrap');
var imageSize;


$(document).ready(function(){
  $('.input_text').focus();
  listenForFormSubmit();
  listenForArtistClick();
  listenForAlbumClick();
  listenSelectionSlideToggle();
  listenforMusicSearchClick();
  screenWidth();
});

// Event listener functions
function listenSelectionSlideToggle(){
  $('.artist_wrap').on('click','.display_title',ArtistSlideToggle);
  $('.album_wrap').on('click','.display_title',AlbumSlideToggle);
}

function listenforMusicSearchClick(){
  $('.title').on('click', reset);
}

function listenForFormSubmit(){
  $('form').on('submit',handleSubmit);
}

function listenForArtistClick(){
  $('.artist_list').on('click','.artist',handleArtist);
  $('.album_info_wrap').on('click','.album_title .artist_title',handleArtist);
}

function listenForAlbumClick(){
  $('.album_list').on('click','.album',handleAlbum);
  $('.artist_info_wrap').on('click','.top_album_list .album',handleAlbum)
}

// The next 3 functions handle the users request and pass it along to the API functions
function handleSubmit(e){
  e.preventDefault();

  var $formValues = $(this).serializeArray()
 	searchRequest = $formValues[0].value;
	resetHighlight()
 // Do a check to see if text was entered in the input field before sending it off to the API function
  if(searchRequest !== ''){
    $('.display_title').show()
    artistSearch(searchRequest);
    albumSearch(searchRequest);
  }
  else{
    alert("You need to enter the name of an artist or album in the search bar");
    reset();
  }

}

function handleArtist(e){
  var selectedArtistmbid = $(this).attr('mbid');
  getArtistInfo(selectedArtistmbid);

}

function handleAlbum(e){

  var selectedAlbummbid = $(this).attr('mbid');
  getAlbumInfo(selectedAlbummbid);
}

// Reset functions
function reset(){
 $('.input_text').val('');
 $('.input_text').focus();
 $('.artist_list').empty();
 $('.album_list').empty();
 $album_wrap.show();
 $artist_wrap.show();
 $artist_info_wrap.empty();
 $album_info_wrap.empty();
}

function resetHighlight(){
	$('.input_text').focus();
	$('.input_text').select();
	$('.artist_list').empty();
	$('.album_list').empty();
	$album_wrap.show();
	$artist_wrap.show();
	$artist_info_wrap.empty();
	$album_info_wrap.empty();
}

// The next two function toggle the artist and album list
function ArtistSlideToggle(){
  $('.artist').slideToggle();
}

function AlbumSlideToggle(){
  $('.album').slideToggle();
}

// API GET functions
function artistSearch(artist){
  $.ajax({
    method: 'GET',
    url: APIPrefix + '?method=artist.search&artist=' + artist + '&limit=20&api_key=' + API_Key +'&format=json'
  })
  .done(function(data){
    var results = data.results.artistmatches.artist;
    var name;
    var imageLink;
    var mbid;
    var mbidArray = [];
    var inArray;
    var count = 0;
    var i = 0;
    var noIdCount =0;
    var IdCount = 0;
    var listeners = 0;

    //console.log(data);

    if(Object.keys(results).length === 0){
      alert("Unable to find information on artist requested ¯\_(ツ)_/¯")
    }
    else{
  // Out of all the results given back I only choose to display 4
  // By changing the number (4) in the WHILE condition one can change the amount displayed
  // This WHILE loop and IF function check to see if the artist has a mbid which is important to get more information on the artist
  // If the artist does not have a mbid then I do not add it to the artist list
      while(count < 4){
        mbid = data.results.artistmatches.artist[i].mbid;

        if (mbid == ""){
          noIdCount++
          i++
        }

        else{
          name = data.results.artistmatches.artist[i].name;
          imageLink = data.results.artistmatches.artist[i].image[imageSize]['#text'];
          mbid = data.results.artistmatches.artist[i].mbid;
          listeners = data.results.artistmatches.artist[i].listeners;
          artistList(name,imageLink,mbid,listeners);
          mbidArray.push(mbid);
          IdCount++;
          count++;
          i++;
        }

        if(i == 20) return
      }
    }
  })
  .error(function(error){
    alert(error.responseText + 'Please contact your network administrator');
    console.log(error);
  })
}

function albumSearch(album){
  $.ajax({
    method: 'GET',
    url: APIPrefix + '?method=album.search&album=' + album + '&limit=20&api_key=' + API_Key +'&format=json'
  })
  .done(function(data){
    //console.log(data);
    albumSearchRefine(data);
  })
  .error(function(error){
    console.log(error);
    alert(error.responseText + 'Please contact your network administrator');
  })
}

function getArtistInfo(artist) {

  $artist_info_wrap.empty();
  $album_info_wrap.empty();

	$.ajax({
		method: 'GET',
		url: APIPrefix + '?method=artist.getinfo&mbid=' + artist + '&api_key=' + API_Key +'&format=json'
	})
	.done(function(data){
		var name = data.artist.name;
		var imageLink = data.artist.image[imageSize]['#text'];
		var bio = data.artist.bio.summary;
		var biosplit = bio.split('<');
		showArtistInfo(name,imageLink,biosplit[0]);
	})
	.error(function(error){
		console.log(error);
    alert(error.responseText + 'Please contact your network administrator');
	})

  $.ajax({
    method: 'GET',
    url: APIPrefix + '?method=artist.gettopalbums&mbid=' + artist + '&limit=30&api_key=' + API_Key +'&format=json'
  })
  .done(function(data){
    albumCollectionSearchRefine(data);
  })
  .error(function (error){
    console.log(error);
    alert(error.responseText + 'Please contact your network administrator');

  })

}

function getAlbumInfo(album){
  $artist_info_wrap.empty();
  $album_info_wrap.empty();

	$.ajax({
		method: 'GET',
		url: APIPrefix + '?method=album.getinfo&mbid=' + album + '&api_key=' + API_Key +'&format=json'
	})
	.done(function(data){
    console.log(data);
		var albumName = data.album.name;
		var artistName = data.album.artist;
    var albumimagelink = data.album.image[imageSize]['#text'];
    var albumsummary;
    var playcount = data.album.playcount;
		var tracklistinfo = data.album.tracks.track;
    var mbid = data.album.tracks.track[0].artist.mbid;

    if(typeof data.album.wiki !== 'undefined'){
      albumsummary = data.album.wiki.summary;
    } else {
      albumsummary = "No album summary found"
    }
    showAlbumInfo(albumName,artistName,albumimagelink,albumsummary,tracklistinfo,mbid);

	})
	.error(function(error){
		console.log(error);
    alert(error.responseText + 'Please contact your network administrator');
	})
}

// The next two functions process the album data provide from the API_Key
// Some albums don't have mbid which have to be removed
function albumSearchRefine(data){

  		var results = data.results.albummatches.album;
  		var name;
  		var imageLink;
  		var mbid;
  		var count = 0;
  		var i = 0;
  		var noIdCount =0;
  		var IdCount = 0;
      if(Object.keys(results).length === 0){
        alert("Unable to find information on album requested ¯\\_(ツ)_/¯")
      } else{

        while(count < 4){
          mbid = data.results.albummatches.album[i].mbid;

          if (mbid == ""){
            noIdCount++
            i++
          }

          else{
            // console.log(data);
            name = data.results.albummatches.album[i].name;
            imageLink = data.results.albummatches.album[i].image[imageSize]['#text'];
            mbid = data.results.albummatches.album[i].mbid;
            artist =  data.results.albummatches.album[i].artist;
            albumList(name,imageLink,mbid,artist);
            IdCount++;
            count++;
            i++;
          }
  // if i gets to 20 and count is still not at 4 I exit the loop
  // It also means that most of the results did not have mbids
          if(i == 20) return
        }
      }

}

function albumCollectionSearchRefine(data){
  		var mbid;
  		var count = 0;
  		var i = 0;
      var collectionofalbums =[];
      var noIdCount = 0;
      var IdCount = 0;

  		while(count < 4){
  			mbid = data.topalbums.album[i].mbid;
  			if (typeof mbid === 'undefined'){
  				i++;
          noIdCount++;
  			}

  			else{

      collectionofalbums.push({
            albumname: data.topalbums.album[i].name,
            artist: data.topalbums.album[i].artist.name,
            imageLink: data.topalbums.album[i].image[imageSize]['#text'],
            mbid: data.topalbums.album[i].mbid
          });
      IdCount++;
  		count++;
  		i++;
  			}
    // if i gets to 30 and count is still not at 4 I exit the loop
   // And pass the collectionofalbums to topAlbumList
  		if(i == 30) return topAlbumList(collectionofalbums);
  		}
      topAlbumList(collectionofalbums);
}

// The next 4 function append their respect information (function name) to the HTML file
function artistList (name, imageLink, mbid, listeners){

  var $artist = $('<li>')
                .addClass('artist')
                .attr("mbid",mbid)
                .appendTo($artist_list)
                .hide();

  var $img = $('<img>')
              .attr('src',imageLink)
              .addClass('image')
              .appendTo($artist);

  var $information = $('<div>')
                      .addClass('information')
                      .appendTo($artist);

  var $name = $('<p>')
              .text(name)
              .addClass('artist_name')
              .appendTo($information);

  var listen = addCommas(listeners);

  var $listeners = $('<p>')
                      .addClass('listeners')
                      .text(listen + ' listeners')
                      .appendTo($information);
}

function albumList (name,imageLink,mbid,artist){

  var $img = $('<img>');
  var $name = $('<p>');
  var $album = $('<li>')
  var $information = $('<div>');

  $album.addClass('album');
  $album.data("mbid",mbid);
  $album.attr("mbid",mbid);
  $album.appendTo($album_list);
  $album.hide();

  $img.appendTo($album);
  $img.addClass('image')
  $img.attr('src',imageLink);

  $information.addClass('information').appendTo($album);

  $name.appendTo($information);
  $name.addClass('album_name')
  $name.text(name);

  var $artist = $('<p>').addClass('listeners').text(artist).appendTo($information);

}

function showAlbumInfo(albumName,artistName,albumimagelink,albumsummary,tracklistinfo,mbid){


  $artist_wrap.hide();
	$album_wrap.hide();

  var $info_header = $('<div>').addClass('info_header');

  $albumimage = $('<img>').attr('src',albumimagelink).addClass('image_album_info');
  $albumName = $('<h2>')
                .text(albumName)
                .addClass('display_title')
                .show();

  $artistName = $('<h3>')
                .text(artistName)
                .addClass('artist_title')
                .data("mbid",mbid)
              	.attr("mbid",mbid);


  $albumimage.appendTo($info_header);
  var $album_title = $('<div>').addClass('album_title').appendTo($info_header);
  $artistName.appendTo($album_title);
  $albumName.appendTo($album_title);
  $info_header.appendTo($album_info_wrap);

  var $tracklist_title = $('<h2>')
                          .text('Tracklist')
                          .addClass('display_title')
                          .appendTo($album_info_wrap)
                          .show();

  var albumlength = Object.keys(tracklistinfo).length;
  var $tracklist = $('<ul>').addClass('tracklist');

  for(i=0; i<albumlength;i++){
    var $trackname = $('<li>')
                              .text((i+1) +'. '+ tracklistinfo[i].name)
                              .addClass('track')
                              .appendTo($tracklist);
  };

  $tracklist.appendTo($album_info_wrap);

  var $albumsummarytitle = $('<h2>')
                            .text('Bio')
                            .addClass('bio_title')
                            .appendTo($album_info_wrap)
                            .show();


  var summary1 = albumsummary.split('<');
  var summary2 = summary1[0].split('\n');
      for(i=0;i<summary2.length;i++){
        if(summary2[i] !== '')

        $albumsummary = $('<p>')
        .text(summary2[i])
        .addClass('bio')
        .appendTo($album_info_wrap);

        }
}

function showArtistInfo(name,imageLink,bio){


	$artist_wrap.hide();
	$album_wrap.hide();
  var $info_header = $('<div>')
                      .addClass('info_header')
                      .appendTo($artist_info_wrap);

  var $artistimage = $('<img>')
                      .addClass('image_artist_info')
                      .attr('src',imageLink)
                      .appendTo($info_header);

	var $h2 = $('<h2>')
                    .text(name)
                    .addClass('display_title_artist')
	                  .appendTo($info_header)
	                  .show();


  var $artistsummarytitle = $('<h2>')
                                    .text('Bio')
                                    .addClass('display_title')
                                    .appendTo($artist_info_wrap)
                                    .show();

  var bio2 = bio.split('\n');
    for(i=0; i<bio2.length; i++){
      if(bio2[i] !== '')
        var $p = $('<p>')
        .text(bio2[i])
        .addClass('bio')
        .appendTo($artist_info_wrap);
      }
}

function topAlbumList (albums){

  var $h2 = $('<h2>')
              .text('Albums')
              .addClass('display_title_album')
	            .appendTo($artist_info_wrap)
	            .show();

  var $topAlbumList = $('<ul>').addClass('top_album_list');

  for(i=0; i < albums.length; i++){

    var $img = $('<img>');
    var $name = $('<p>');
    var $album = $('<li>')
    var $information = $('<div>');

    $album.addClass('album');
    $album.attr("mbid",albums[i].mbid);
    $album.appendTo($topAlbumList);

    $img.appendTo($album);
    $img.addClass('image')
    $img.attr('src',albums[i].imageLink);

    $information.addClass('information').appendTo($album);

    $name.appendTo($information);
    $name.addClass('album_name')
    $name.text(albums[i].albumname);

  }
   $topAlbumList.appendTo($artist_info_wrap);
}
// The function was found online to add commas to long integers
function addCommas(nStr)
  {
  	nStr += '';
  	x = nStr.split('.');
  	x1 = x[0];
  	x2 = x.length > 1 ? '.' + x[1] : '';
  	var rgx = /(\d+)(\d{3})/;
  	while (rgx.test(x1)) {
  		x1 = x1.replace(rgx, '$1' + ',' + '$2');
  	}
  	return x1 + x2;
  }

  function screenWidth(){

  // media query event handler
  if (matchMedia) {
    var mq = window.matchMedia("(min-width: 600px)");
    mq.addListener(WidthChange);
    WidthChange(mq);
  }

  // media query change
  function WidthChange(mq) {
    if (mq.matches) {
      // window width is at least 600px
      imageSize = 3;
    } else {
      // window width is less than 600px
      imageSize = 2;
    }

  }
}
