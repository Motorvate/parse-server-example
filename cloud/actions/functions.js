
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

	var outerEvent = null;
	var outerAuthor = null;
	Parse.Promise.when(queryPromises).then(function(results) {
		outerEvent = results[0];
		outerAuthor = results[1];

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
		// update installation to receive push notification
		var author = savedComment.author;
		var installationQuery = new Parse.Query("Installation");
		installationQuery.equalTo("userID", outerAuthor.objectId);
		return installationQuery.find();

		/*
		var successFunc = function(installations) {
			var savePromises = [];
			var count;
            for(count = 0; count < installations.length; count++) {
            	var installation = installations[count];
            	var channels = installation.channels;
            	if (channels == null) {
            		channels = [];
            	}
            	if (channels.indexOf(savedComment.event.objectId) == -1) {
					channels.push(savedComment.event.objectId);
					installation.channels = channels;
					savePromises.push(installation.save());
            	}
            }

			if (savePromises.length > 0) {
				Parse.Promise.when(savePromises).then(function(savedInstallations) {
					res.success(savedComment);
				}, function(error) {
					res.error({error: "2"});
					//res.error(error);
				});
			} else {
				res.success(savedComment);
			}
		};
		var errorFunc = function(queryError) {
			res.error({error: "3"});
			//res.error(queryError);
		};
		return installationQuery.find({success: successFunc, error: errorFunc});
		*/
	}, function(saveError) {
		res.error(saveError);
	}).then(function(installations){
		res.success(installations);
		//res.success(savedComment);
	}, function(error){
		res.error(error);
	});
});
