
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

	var outerComment = null;
	var outerEvent = null;
	var outerAuthor = null;
	Parse.Promise.when(queryPromises).then(function(results) {
		outerEvent = results[0];
		outerAuthor = results[1];

		var EventComment = Parse.Object.extend("EventComment");
		var newComment = new EventComment();
		newComment.set("comment", commentString);
		newComment.set("event", outerEvent);
		newComment.set("author", outerAuthor);
		if (results.length == 3) {
			newComment.set("parentComment", results[2]);
		}

		return newComment.save();
	}, function(queryError){
		res.error(queryError);
	}).then(function(savedComment){
		outerComment = savedComment;
		var promises = [];

		var eventIDsWatching = outerAuthor.get("eventIDsWatching");
		if (eventIDsWatching == null) {
			eventIDsWatching = [];
		}
		if (eventIDsWatching.indexOf(outerEvent.id) == -1) {
			eventIDsWatching.push(outerEvent.id);
			outerAuthor.set("eventIDsWatching", eventIDsWatching);
			promises.push(outerAuthor.save(null, { useMasterKey: true }));
		}

		// where: {},
		var pushPromise = Parse.Push.send({
							channels: [outerEvent.id], 
							data: { alert: "A new comment from a RSVPed event: " + outerEvent.get("name") }
							}, { useMasterKey: true }
		);
		promises.push(pushPromise);
		return Parse.Promise.when(promises);
	}, function(saveError){
		res.error(saveError);
	}).then(function(saveAndPushResult){
		res.success(outerComment);
	}, function(pushError){
		res.error(pushError);
	});
});

Parse.Cloud.define('createShopReview', function(req, res) {
	var queryPromises = [];

	var shopQuery = new Parse.Query("Shop");
	var shopPromise = shopQuery.get(req.params.shopID);
	queryPromises.push(shopPromise);

	var userQuery = new Parse.Query("User");
	var userPromise = userQuery.get(req.params.authorID);
	queryPromises.push(userPromise);

	var parentReviewID = req.params.parentReviewID;
	if (parentReviewID != null) {
		var parentReviewQuery = new Parse.Query("ShopReview");
		var parentReviewPromise = parentReviewQuery.get(parentReviewID);
		queryPromises.push(parentReviewPromise);		
	}

	var outerReview = null;
	var outerShop = null;
	var outerAuthor = null;
	Parse.Promise.when(queryPromises).then(function(results){
		outerShop = results[0];
		outerAuthor = results[1];

		var ShopReview = Parse.Object.extend("ShopReview");
		var newReview = new ShopReview();
		newReview.set("shop", outerShop);
		newReview.set("author", outerAuthor);
		newReview.set("review", req.params.review);
		newReview.set("reviewScore", req.params.score);
		if (parentReviewID != null) {
			newReview.set("parentReview", results[2]);
		}
		return newReview.save();
	}, function(queryError){
		res.error(queryError);
	}).then(function(savedReview){
		outerReview = savedReview;
		var promises = [];

		var shopIDsWatching = outerAuthor.get("shopIDsWatching");
		if (shopIDsWatching == null) {
			shopIDsWatching = [];
		}
		if (shopIDsWatching.indexOf(outerShop.id) == -1) {
			shopIDsWatching.push(outerShop.id);
			outerAuthor.set("shopIDsWatching", shopIDsWatching);
			promises.push(outerAuthor.save(null, { useMasterKey: true }));
		}

		var notificationMessage = "A new review of your favorite shop: " + outerShop.get("name")
		return Parse.Push.send({
						channels: [outerShop.id],
						data: { alert: notificationMessage }
					}, { useMasterKey: true }
		);
	}, function(saveError){
		res.error(saveError);
	}).then(function(){
		res.success(outerReview);
	}, function(pushError){
		res.error(pushError);
	});
});
