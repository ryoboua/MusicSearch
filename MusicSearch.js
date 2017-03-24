/*  JavaScript Document                      */
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
  listenForFormSubmit();
  listenForArtistClick();
  listenForAlbumClick();
  listenSelectionSlideToggle();
  screenWidth()
  reset();
});

function listenForFormSubmit(){
  $('form').on('submit',handleSubmit);
}

function handleSubmit(e){
  e.preventDefault();

  var $formValues = $(this).serializeArray()
 	searchRequest = $formValues[0].value;
	resetHighlight()
 	$('.display_title').show()
	artistSearch(searchRequest);
	albumSearch(searchRequest);

}

function reset(){
	 $('.input_text').focus();
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

function listenSelectionSlideToggle(){
  $('.artist_wrap').on('click','.display_title',ArtistSlideToggle);
  $('.album_wrap').on('click','.display_title',AlbumSlideToggle);
}

function ArtistSlideToggle(){
	$('.artist').slideToggle();
}

function AlbumSlideToggle(){
	$('.album').slideToggle();
}

function artistSearch(artist){
	$.ajax({
		method: 'GET',
		url: APIPrefix + '?method=artist.search&artist=' + artist + '&limit=20&api_key=' + API_Key +'&format=json'
	})
	.done(function(data){
    // console.log(data);
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
		while(count < 4){
			mbid = data.results.artistmatches.artist[i].mbid;

			// console.log("Array:",mbidArray);

			if (mbid == ""){
				noIdCount++
				i++

			}

			else{
				name = data.results.artistmatches.artist[i].name;
				imageLink = data.results.artistmatches.artist[i].image[3]['#text'];
				mbid = data.results.artistmatches.artist[i].mbid;
        listeners = data.results.artistmatches.artist[i].listeners;
				artistList(name,imageLink,mbid,listeners);
				mbidArray.push(mbid);
				IdCount++;
				count++;
				i++;
			}

		if(i == 20) return
		inArray = mbidArray.indexOf(mbid);
		}
	})
	.error(function(error){
		console.log(error);
	})
}

function albumSearch(album){
	$.ajax({
		method: 'GET',
		url: APIPrefix + '?method=album.search&album=' + album + '&limit=20&api_key=' + API_Key +'&format=json'
	})
	.done(albumSearchRefine)
	.error(function(error){
		console.log(error);
	})
}

function albumSearchRefine(data){

  		var results = data.results.albummatches.album;
  		var name;
  		var imageLink;
  		var mbid;
  		var count = 0;
  		var i = 0;
  		var noIdCount =0;
  		var IdCount = 0;

  		while(count < 4){
  			mbid = data.results.albummatches.album[i].mbid;

  			if (mbid == ""){
  				noIdCount++
  				i++
  			}

  			else{
          // console.log(data);
  				name = data.results.albummatches.album[i].name;
  				imageLink = data.results.albummatches.album[i].image[2]['#text'];
  				mbid = data.results.albummatches.album[i].mbid;
          artist =  data.results.albummatches.album[i].artist;
  				albumList(name,imageLink,mbid,artist);
  				IdCount++;
  				count++;
  				i++;
  			}

  		if(i == 20) return
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
        console.log(mbid);
  			if (typeof mbid === 'undefined'){
  				i++;
          noIdCount++;
  			}

  			else{

      collectionofalbums.push({
            albumname: data.topalbums.album[i].name,
            artist: data.topalbums.album[i].artist.name,
            imageLink: data.topalbums.album[i].image[2]['#text'],
            mbid: data.topalbums.album[i].mbid
          });
      //console.log('Array with MBID',i);
      IdCount++;
  		count++;
  		i++;
  			}
      //  console.log('i',i);
      //  console.log('count', count);
  		if(i == 30) return topAlbumList(collectionofalbums);
  		}

    //  console.log('i',i);
    //  console.log('count', count);
      topAlbumList(collectionofalbums);
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

 //  var $artist = $('<p>').addClass('listeners').text(albums[0].artist).appendTo($information);
  }
   $topAlbumList.appendTo($artist_info_wrap);
}

function artistList (name, imageLink, mbid, listeners){

	var $img = $('<img>');
	var $name = $('<p>');
	var $artist = $('<li>')
  var $information = $('<div>');

  var listen = addCommas(listeners)

	$artist.addClass('artist');
	$artist.data("mbid",mbid);
	$artist.attr("mbid",mbid);
	$artist.appendTo($artist_list);
	$artist.hide()

	$img.appendTo($artist);
	$img.attr('src',imageLink);
  $img.addClass('image')

  $information.addClass('information').appendTo($artist);

	$name.appendTo($information);
	$name.addClass('artist_name')
	$name.text(name);

  var $listeners = $('<p>').addClass('listeners').text(listen + ' listeners').appendTo($information);
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
	})

  $.ajax({
    method: 'GET',
    url: APIPrefix + '?method=artist.gettopalbums&mbid=' + artist + '&limit=30&api_key=' + API_Key +'&format=json'
  })
  .done(function(data){
    console.log(data);
    albumCollectionSearchRefine(data);
  })
  .error(function (error){
    console.log(error);
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
	})
}

function listenForArtistClick(){
  $('.artist_list').on('click','.artist',handleArtist);
  $('.album_info_wrap').on('click','.album_title .artist_title',handleArtist);
}

function listenForAlbumClick(){
	$('.album_list').on('click','.album',handleAlbum);
  $('.artist_info_wrap').on('click','.top_album_list .album',handleAlbum)
}

function handleArtist(e){
	var selectedArtistmbid = $(this).attr('mbid');
  getArtistInfo(selectedArtistmbid);

}

function handleAlbum(e){

	var selectedAlbummbid = $(this).attr('mbid');
	getAlbumInfo(selectedAlbummbid);
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

  var summarysplit = albumsummary.split('<');
  $albumsummary = $('<p>').text(summarysplit[0]).addClass('bio');

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
  $albumsummary.appendTo($album_info_wrap);

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


	var $p = $('<p>')
                  .text(bio)
                  .addClass('bio')
                  .appendTo($artist_info_wrap);
// slipt on \n
}

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
    console.log(matchMedia)
    var mq = window.matchMedia("(min-width: 600px)");
    mq.addListener(WidthChange);
    WidthChange(mq);
  }

  // media query change
  function WidthChange(mq) {
    if (mq.matches) {
      // window width is at least 600px
      imageSize = 4;
      console.log(imageSize);
    } else {
      // window width is less than 600px
      imageSize = 2;
      console.log(imageSize);
    }

  }
}
