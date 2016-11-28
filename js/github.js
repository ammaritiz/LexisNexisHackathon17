var Promise = require("bluebird");
var _ = require("underscore");
var request = require("request");
var querystring = require('querystring');
var token = "token " + process.env.GTOKEN;
var urlRoot = "https://github.ncsu.edu/api/v3";
var repoValue = "TriageBotTesting";
var ownerValue= "hqtu";

function getColloborators()
{
	var options = {
		url: urlRoot + '/repos/' + ownerValue + "/"+repoValue+"/collaborators",
		method: 'GET',
		headers: {
			"content-type": "application/json",
			"Authorization": token
		}
	};

	return new Promise(function (resolve, reject)
	{
		// Send a http request to url and specify a callback that will be called upon its return.
		request(options, function (error, response, body)
		{
			var repos = JSON.parse(body);
			resolve(repos);
		});
	});
}

function getIssues()
{

	var options = {
		url: urlRoot + "/repos/" + ownerValue +"/" + repoValue + "/issues?state=all",
		method: 'GET',
		headers: {
			"content-type": "application/json",
			"Authorization": token
		}
	};

	return new Promise(function (resolve, reject)
	{
		// Send a http request to url and specify a callback that will be called upon its return.
		request(options, function (error, response, body)
		{
			var obj = JSON.parse(body);
			resolve(obj);
		});
	});
}


function getClosedIssues()
{

	var options = {
		url: urlRoot + "/repos/" + ownerValue +"/" + repoValue + "/issues?state=closed",
		method: 'GET',
		headers: {
			"content-type": "application/json",
			"Authorization": token
		}
	};

	return new Promise(function (resolve, reject)
	{
		// Send a http request to url and specify a callback that will be called upon its return.
		request(options, function (error, response, body)
		{
			var obj = JSON.parse(body);
			resolve(obj);
		});
	});
}


function assignIssue(issue, assignee)
{

	var options = {
		url: urlRoot + "/repos/" + ownerValue +"/" + repoValue + "/issues/"+issue+"/assignees",
		method: 'POST',
		headers: {
			"content-type": "application/json",
			"Authorization": token
		},
		json: {
			"assignees" : [assignee]
		}
	};

	return new Promise(function (resolve, reject)
	{
		// Send a http request to url and specify a callback that will be called upon its return.
		request(options, function (error, response, body)
		{
			resolve(response);
		});
	});
}

function getAnIssue(number)
{
	var options = {
		url: urlRoot + "/repos/" + ownerValue +"/" + repoValue + "/issues/"+number,
		method: 'GET',
		headers: {
			"content-type": "application/json",
			"Authorization": token
		}
	};

	return new Promise(function (resolve, reject)
	{
		// Send a http request to url and specify a callback that will be called upon its return.
		request(options, function (error, response, body)
		{
			var obj = JSON.parse(body);
			resolve(obj);
		});
	});
}

exports.getColloborators = getColloborators;
exports.getClosedIssues = getClosedIssues;
exports.getIssues = getIssues;
exports.getAnIssue = getAnIssue;
exports.assignIssue = assignIssue;
