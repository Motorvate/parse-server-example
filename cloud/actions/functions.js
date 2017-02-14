
Parse.Cloud.define('hello', function(req, res) {
  res.success('Hi');
});

Parse.Cloud.define('createEventComment', function(req, res) {
	console.log("user comment 1: " + req.params.comment);

	var queryPromises = [];
	var stringPromise = Parse.Promise.as(req.params.comment);
	queryPromises.push(stringPromise);

	var eventQuery = new Parse.Query("Event");
	var eventPromise = eventQuery.get(req.params.eventID);
	queryPromises.push(eventPromise);

	var userQuery = new Parse.Query("User");
	var userPromise = userQuery.get(req.params.authorID);
	queryPromises.push(userPromise);

	var parentCommentID = req.params.parentCommentID;
	if (parentCommentID != null) {
		var commentQuery = new Parse.Query("EventComment");
		var commentPromise = commentQuery.get(parentCommentID);
		queryPromises.push(commentPromise);		
	}

	Parse.Promise.when(queryPromises).then(function(results) {
	console.log("user comment 2: " + results[0]);

		var EventComment = Parse.Object.extend("EventComment");
		var newComment = new EventComment();
		newComment.comment = results[0];
		newComment.set("event", results[1]);
		newComment.set("author", results[2]);
		if (results.length == 4) {
			newComment.set("parentComment", results[3]);
		}
		return newComment.save();
	}, function(errors){
		res.error(errors);
	}).then(function(saveResult){
		res.success(saveResult);
	}, function(saveError){
		res.error(saveError);
	});
});
