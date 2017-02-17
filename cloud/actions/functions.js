
Parse.Cloud.define('hello', function(req, res) {
  res.success('Hi');
});

Parse.Cloud.define('createEventComment', function(req, res) {
	var commentString = req.params.comment;
	var queryPromises = [];

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

	var outerEventId = null;
	var outerComment = null;
	Parse.Promise.when(queryPromises).then(function(results) {
		outerEventId = results[0].objectId;
		var EventComment = Parse.Object.extend("EventComment");
		var newComment = new EventComment();
		newComment.set("comment", commentString);
		newComment.set("event", results[0]);
		newComment.set("author", results[1]);
		if (results.length == 3) {
			newComment.set("parentComment", results[2]);
		}
		return newComment.save();
	}, function(errors) {
		res.error(errors);
	}).then(function(savedComment) {
		outerComment = savedComment;

		console.log(outerEventId);
		var query = new Parse.Query(Parse.Installation);
		query.containsAll('channels', [outerEventId]);
		return Parse.Push.send({
			where: query,
			data: { alert: "The Giants won against the Mets 2-3." }
			}, { useMasterKey: true }
		);


		// channels: [outerEvent.objectId],
		// where: {},
// 		return Parse.Push.send({
// 			channels: [outerEventId],
// 			data: { alert: "The Giants won against the Mets 2-3." }
// 			}, { useMasterKey: true }
// 		);
	}, function(saveError) {
		res.error(saveError);
	}).then(function(){
		res.success(outerComment);
	}, function(pushError){
		res.error(pushError);
	});
});
