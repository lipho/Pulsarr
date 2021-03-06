"use strict";

var host = "";
var port = "";
var apikey = "";
var auth = false;
var user = "";
var password = "";
var moviePath = "";
var tooltips = [
		{title: "IP address or domain name of your Radarr server.", placement: "right", animation: true, delay: {show: 500, hide: 100}},
		{title: "Enable if your server requires basic http authentication.", placement: "right", animation: true, delay: {show: 500, hide: 100}},
		{title: "Port number that Radarr is accessible on. Radarr > Settings > General", placement: "right", animation: true, delay: {show: 500, hide: 100}},
		{title: "Radarr API Key. Radarr > Settings > General", placement: "right", animation: true, delay: {show: 500, hide: 100}},
		{title: "Path to root folder where movies will be saved. Leave blank to use Radarr default path.", placement: "right", animation: true, delay: {show: 500, hide: 100}},
];

$('#chkAuth').on('change', function () {
		$('#optAuth').toggleClass('hidden');
		auth = !auth;
});

$(document).ready(function(){
		restoreConfig();
		if (apikey === null) {
				$("#status").text("Before you can use Pulsarr, please enter the configuration from your Radarr server.");
		}
    var tool_list = $('[data-toggle="tooltip"]');
    for(var i = 0; i < tool_list.length; i++){
        tool_list.eq(i).tooltip(tooltips[i]);
    }
});

$('#save').click(function() {
    $("#popup").fadeTo("fast", 0.5);
    $("#spin").spin();
    $("#page *").prop('disabled', true);
    $("#save").toggleClass("unclickable");
    readInputs();
    var url = constructBaseUrl(host, port) + "/api/system/status";

    testApi(url).then(function(response) {
        saveConfig();
        $("#popup").stop(true).fadeTo('fast', 1);
        $("#spin").spin(false);
    }).catch(function(error) {
        $("#status").text(error);
        $("#page *").prop('disabled', false);
        $("#save").toggleClass("unclickable");
        $("#popup").stop(true).fadeTo('fast', 1);
        $("#spin").spin(false);
    });
});

function readInputs() {
    host = httpHost(document.getElementById('host').value.trim());
    port = document.getElementById('port').value.trim();
    apikey = document.getElementById('radarrapikey').value.trim();
    if (auth){
    		user = document.getElementById('user').value.trim();
    		password = document.getElementById('password').value.trim();
    }
		moviePath = document.getElementById('txtMoviePath').value.trim();
}

function constructBaseUrl(host, port) {
    if (port === "") {
        return httpHost(host);
    } else {
        return httpHost(host) + ":" + port;
    }
}

function testApi(url) {
    return new Promise(function(resolve, reject) {
        var http = new XMLHttpRequest();

        http.open("GET", url, true);
        if (auth) http.setRequestHeader("Authorization", "Basic " + btoa(user + ":" + password));
        http.setRequestHeader("X-Api-Key", apikey);

        http.onload = function() {
            if (this.status === 200) {
                resolve(http.statusText);
            } else {
							switch (http.status) {
								case 400:
									reject(Error("Failed to add movie! Please check it is not already in your collection."));
									break;
								case 401:
									reject("Unauthorised! Please check your API key or server authentication.");
									break;
								default:
									reject(Error("(" + http.status + ")" + http.statusText));
							}
            }
        };

        http.onerror = function() {
            reject(Error("Unable to communicate with server. Please check host/port."));
        };

        http.send();
    });
}

function httpHost(string) {
    var regex = new RegExp("https{0,1}:\/\/");

    if (regex.exec(string)) {
        return string;
    } else {
        return "http://" + string;
    }
}

function saveConfig() {
    localStorage.setItem("host", host);
    localStorage.setItem("port", port);
    localStorage.setItem("apikey", apikey);
    localStorage.setItem("auth", auth);
    localStorage.setItem("user", user);
    localStorage.setItem("password", password);
		localStorage.setItem("moviePath", moviePath);

    $("#status").text("Sucess! Configuration saved.");
    $("#page *").prop('disabled', false);
    $("#save").toggleClass("unclickable");
    setTimeout(function() {
        $("#status").text("");
        window.close();
    }, 1500);
}

function restoreConfig() {
    host = localStorage.getItem("host");
    port = localStorage.getItem("port");
    apikey = localStorage.getItem("apikey");
    auth = localStorage.getItem("auth") == "true";
    user = localStorage.getItem("user");
    password = localStorage.getItem("password");
		moviePath = localStorage.getItem("moviePath");

		$('#host').val(host);
		$('#port').val(port);
		$('#radarrapikey').val(apikey);

    $('#chkAuth').prop('checked', auth);
    if (auth) $('#optAuth').removeClass('hidden');
		$('#user').val(user);
		$('#password').val(password);
		$('#txtMoviePath').val(moviePath);
}
