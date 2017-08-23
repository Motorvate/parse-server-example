
Parse.Cloud.define('hello', function(req, res) {
  res.success('Hi');
});

Parse.Cloud.define('addNewShop', function(req, res) {
  var queryPromises = [];

  var getUserById = (new Parse.Query('User')).get;
  queryPromises.push(getUserById(req.params.userID));

  Parse.Promise.when(queryPromises).then(function(queryResults) {
    var owner = queryResults[0];
    var savePromises = [];

    // create new shop
    var Shop = Parse.Object.extend('Shop');
    var newShop = new Shop();
    newShop.set('owner', owner);
    newShop.set('name', req.params.name);
    newShop.set('phoneNumber', req.params.phoneNumber);

    savePromises.push(newShop.save());

    return Parse.Promise.when(savePromises);
  }, function(queryError) {
  }).then(function(savedObjects) {
    res.success(savedObjects[0]);
  }, function(saveError) {
    res.error(saveError);
  });
});


Parse.Cloud.define('updateShopInfo', function(req, res) {
  var queryPromises = [];

  var getUserById = (new Parse.Query('User')).get;
  queryPromises.push(getUserById(req.params.userID));

  var getShopById = (new Parse.Query('Shop')).get;
  queryPromises.push(getShopById(req.params.shopID));

  Parse.Promise.when(queryPromises).then(function(queryResults) {
    var user = queryResults[0];
    var shop = queryResults[1];
    var savePromises = [];

    // only allow owner user to edit a shop
    if (user.equals(shop.owner)) {
      var shopFields = [
        'address',
        'friOperationTime',
        'instagramUserId',
        'monOperationTime',
        'name',
        'phoneNumber',
        'satOperationTime',
        'shopDescription',
        'shopImageURLs',
        'shopMainIMageURL',
        'sunOperationTime',
        'thuOperationTime',
        'tueOperationTime',
        'wedOperationTime',
      ];

      var updatedShopFields = shopFields.filter(function(fieldName) {
        return req.params[fieldName]
      });
      updatedShopFields.forEach(function(fieldName) {
        shop.set(fieldName, req.params[fieldName]);
      });

      savePromises.push(shop.save());
    }

    return savePromises;
  }, function(queryError) {
  }).then(function(savedObjects) {
    res.success(savedObjects[0]);
  }, function(saveError) {
    res.error(saveError);
  });
});


Parse.Cloud.define('getRecentShopIGPhotos', function(req, res) {
  var queryPromises = [];

  var getShopById = (new Parse.Query('Shop')).get;
  query1Promises.push(getShopById(req.params.shopID));


  Parse.Promise.when(query1Promises).then(function(query1Results) {
    query2Promises = [];

    // tbdefined - instagram.getRecentPhotosForUser function
    // https://www.instagram.com/developer/endpoints/users/
    query2Promises.push(instagram.getRecentPhotosForUser(shop.instagramUserId))

    Parse.Promise.when(query2Promises).then(function(query2Results) {
      var igResponse = query2Results[0];
      res.succeed(igResponse);
      /** {
       *    "data": [
       *      {
       *        "comments"...,
       *        "caption"...,
       *        "likes"...,
       *        "link": "http://instagr.am/p/BWrVZ/",
       *        ...
       *      },
       *      {...},
       *      {...},
       *      {...},
       *      ...
       *    ]
       */
    });
  });
});


Parse.Cloud.define('updateMarketItemInfo', function(req, res) {
  var queryPromises = [];

  var getUserById = (new Parse.Query('User')).get;
  queryPromises.push(getUserById(req.params.userID));

  var getMarketItemById = (new Parse.Query('MarketItem')).get;
  queryPromises.push(getMarketItemById(req.params.marketItemID));

  Parse.Promise.when(queryPromises).then(function(queryResults) {
    var user = queryResults[0];
    var marketItem = queryResults[1];
    var savePromises = [];

    // only allow owner user to edit a marketItem
    if (user.equals(marketItem.owner)) {
      var marketItemFields = [
        'marketItemDescription',
        'userId',
      ];

      var updatedMarketItemFields = marketItemFields.filter(function(fieldName) {
        return req.params[fieldName]
      });
      updatedMarketItemFields.forEach(function(fieldName) {
        marketItem.set(fieldName, req.params[fieldName]);
      });

      savePromises.push(marketItem.save());
    }

    return savePromises;
  }, function(queryError) {
  }).then(function(savedObjects) {
    res.success(savedObjects[0]);
  }, function(saveError) {
    res.error(saveError);
  });
});


Parse.Cloud.define('addNewMarketItem', function(req, res) {
  var queryPromises = [];

  var getUserById = (new Parse.Query('User')).get;
  queryPromises.push(getUserById(req.params.userID));

  Parse.Promise.when(queryPromises).then(function(queryResults) {
    var owner = queryResults[0];
    var savePromises = [];

    // create new marketItem
    var MarketItem = Parse.Object.extend('MarketItem');
    var newMarketItem = new MarketItem();
    newMarketItem.set('ownerID', owner);
    newMarketItem.set('phoneNumber', req.params.phoneNumber);

    savePromises.push(newMarketItem.save());

    return Parse.Promise.when(savePromises);
  }, function(queryError) {
  }).then(function(savedObjects) {
    res.success(savedObjects[0]);
  }, function(saveError) {
    res.error(saveError);
  });
});


Parse.Cloud.define('addNewUserVehicle', function(req, res) {
	var queryPromises = [];

	var userQuery = new Parse.Query("User");
	queryPromises.push(userQuery.get(req.params.ownerID));

	var vehicleModelQuery = new Parse.Query("VehicleModel");
	vehicleModelQuery.equalTo("manufacture", req.params.manufacture);
	vehicleModelQuery.equalTo("model", req.params.model);
	vehicleModelQuery.equalTo("year", req.params.year);
	queryPromises.push(vehicleModelQuery.count());

	Parse.Promise.when(queryPromises).then(function(queryResults){
		var owner = queryResults[0];
		var isNewModel = queryResults[1] > 0;

		if (isNewModel) {
      // is there code missing here?
		} else {
      // is there code missing here?
		}
	},function(queryError){
		res.error(queryError);
	});
});


Parse.Cloud.define('rsvpEvent', function(req, res) {
	var queryPromises = [];

	var eventQuery = new Parse.Query("Event");
	var eventPromise = eventQuery.get(req.params.eventID);
	queryPromises.push(eventPromise);

	var userQuery = new Parse.Query("User");
	var userPromise = userQuery.get(req.params.userID);
	queryPromises.push(userPromise);

	var installationQuery = new Parse.Query("_Installation");
	var installationPromise = installationQuery.get(req.params.installationID, { useMasterKey: true });
	queryPromises.push(installationPromise);

	Parse.Promise.when(queryPromises).then(function(queryResults){
		var event = queryResults[0];
		var user = queryResults[1];
		var installation = queryResults[2];
		var savePromises = [];

		// create new attendance
		var EventAttendance = Parse.Object.extend("EventAttendance");
		var newEventAttendance = new EventAttendance();
		newEventAttendance.set("event", event);
		newEventAttendance.set("attendee", user);
		savePromises.push(newEventAttendance.save());

		// update user's watching list
		var userPromise = Utility.addEventToUserWatchingList(user, event);
		if (userPromise != null) {
			savePromises.push(userPromise);
		}

		// add event to installation channels if needed
		var channelPromise = Utility.updateChannelInInstallation(installation, event.id);
		if (channelPromise != null) {
			savePromises.push(channelPromise);
		}

		return Parse.Promise.when(savePromises);
	}, function(queryError){
		res.error(queryError);
	}).then(function(savedObjects){
		res.success(savedObjects[0]);
	}, function(saveError){
		res.error(saveError);
	});
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

	var installationQuery = new Parse.Query("_Installation");
	var installationPromise = installationQuery.get(req.params.installationID, { useMasterKey: true });
	queryPromises.push(installationPromise);

	var parentCommentID = req.params.parentCommentID;
	if (parentCommentID != null) {
		var commentQuery = new Parse.Query("EventComment");
		var commentPromise = commentQuery.get(parentCommentID);
		queryPromises.push(commentPromise);		
	}

	var outerComment = null;
	var outerEvent = null;
	var outerAuthor = null;
	Parse.Promise.when(queryPromises).then(function(searchResults) {
		outerEvent = searchResults[0];
		outerAuthor = searchResults[1];
		var savePromises = [];

		var channelPromise = Utility.updateChannelInInstallation(searchResults[2], outerEvent.id);
		if (channelPromise != null) {
			savePromises.push(channelPromise);
		}

		var EventComment = Parse.Object.extend("EventComment");
		var newComment = new EventComment();
		newComment.set("comment", commentString);
		newComment.set("event", outerEvent);
		newComment.set("author", outerAuthor);
		if (searchResults.length == 4) {
			newComment.set("parentComment", searchResults[3]);
		}
		savePromises.push(newComment.save());

		return Parse.Promise.when(savePromises);
	}, function(queryError){
		res.error(queryError);
	}).then(function(saveResults){
		outerComment = saveResults[1];
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


Parse.Cloud.define('addShopToFavorite', function(req, res) {
	var queryPromises = [];

	var shopQuery = new Parse.Query("Shop");
	var shopPromise = shopQuery.get(req.params.shopID);
	queryPromises.push(shopPromise);

	var userQuery = new Parse.Query("User");
	var userPromise = userQuery.get(req.params.userID);
	queryPromises.push(userPromise);

	var installationQuery = new Parse.Query("_Installation");
	var installationPromise = installationQuery.get(req.params.installationID, { useMasterKey: true });
	queryPromises.push(installationPromise);

	Parse.Promise.when(queryPromises).then(function(searchResults){
		var shop = searchResults[0];
		var user = searchResults[1];
		var installation = searchResults[2];
		var savePromises = [];

		// create new shop favorite object
		var ShopFavorite = Parse.Object.extend("ShopFavorite");
		var favorite = new ShopFavorite();
		favorite.set("shop", shop);
		favorite.set("user", user);
		savePromises.push(favorite.save());

		// update the watching shop array for this user
		var userPromise = Utility.addShopToUserWatchingList(user, shop);
		if (userPromise != null) {
			savePromises.push(userPromise);
		}

		// update installation channels for this user to get notifications from this shop
		var channelPromise = Utility.updateChannelInInstallation(installation, shop.id);
		if (channelPromise != null) {
			savePromises.push(channelPromise);
		}

		return Parse.Promise.when(savePromises);
	}, function(searchError){
		res.error(searchError);
	}).then(function(saveResults){
		res.success(saveResults[0]);
	}, function(saveError){
		res.error(saveError);
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

	var installationQuery = new Parse.Query("_Installation");
	var installationPromise = installationQuery.get(req.params.installationID, { useMasterKey: true });
	queryPromises.push(installationPromise);

	var parentReviewID = req.params.parentReviewID;
	if (parentReviewID != null) {
		var parentReviewQuery = new Parse.Query("ShopReview");
		var parentReviewPromise = parentReviewQuery.get(parentReviewID);
		queryPromises.push(parentReviewPromise);		
	}

	var outerReview = null;
	var outerShop = null;
	var outerAuthor = null;
	Parse.Promise.when(queryPromises).then(function(searchResults){
		outerShop = searchResults[0];
		outerAuthor = searchResults[1];
		var installation = searchResults[2];
		var promises = [];

		var ShopReview = Parse.Object.extend("ShopReview");
		var newReview = new ShopReview();
		newReview.set("shop", outerShop);
		newReview.set("author", outerAuthor);
		newReview.set("review", req.params.review);
		newReview.set("reviewScore", req.params.score);
		if (parentReviewID != null) {
			newReview.set("parentReview", searchResults[3]);
		}
		promises.push(newReview.save());

		var addShopPromise = Utility.addShopToUserWatchingList(outerAuthor, outerShop);
		if (addShopPromise != null) {
			promises.push(addShopPromise);
		}

		var channelPromise = Utility.updateChannelInInstallation(installation, outerShop.id);
		if (channelPromise != null) {
			promises.push(channelPromise);
		}

		return Parse.Promise.when(promises);
	}, function(queryError){
		res.error(queryError);
	}).then(function(results){
		outerReview = results[0];

		var notificationMessage = "A new review of your favorite shop: " + outerShop.get("name")
		return Parse.Push.send({
				channels: [outerShop.id],
				data: { alert: notificationMessage }
			}, { useMasterKey: true }
		);
	}, function(saveError){
		res.error(saveError);
	}).then(function(){
		var reviewQuery = new Parse.Query("ShopReview");
		reviewQuery.equalTo("shop", outerShop);
		return reviewQuery.find();
	}, function(pushError){
		res.error(pushError);
	}).then(function(reviewQueryResult){
		var totalScore = 0.0;
		for (var i=0; i<reviewQueryResult.length; i++) {
			var review = reviewQueryResult[i];
			totalScore = totalScore + review.get("reviewScore");
		}
		outerShop.set("reviewScore", totalScore / reviewQueryResult.length);
		return outerShop.save();
	}, function(reviewQueryError){
		res.error(reviewQueryError);
	}).then(function(savedShop){
		res.success(outerReview);
	}, function(shopSaveError){
		res.error(shopSaveError);
	});
});


class Utility {
	static updateChannelInInstallation(installation, channel) {
		var channels = installation.get("channels");
		if (channels == null) {
			channels = [];
		}
		if (channels.indexOf(channel) == -1) {
			channels.push(channel);
			installation.set("channels", channels);
			return installation.save(null, { useMasterKey: true });
		} else {
			return null;
		}
	}

	static addEventToUserWatchingList(user, event) {
		var eventIDsWatching = user.get("eventIDsWatching");
		if (eventIDsWatching == null) {
			eventIDsWatching = [];
		}
		if (eventIDsWatching.indexOf(event.id) == -1) {
			eventIDsWatching.push(event.id);
			user.set("eventIDsWatching", eventIDsWatching);
			return user.save(null, { useMasterKey: true });
		} else {
			return null;
		}
	}

	static addShopToUserWatchingList(user, shop) {
		var shopIDsWatching = user.get("shopIDsWatching");
		if (shopIDsWatching == null) {
			shopIDsWatching = [];
		}
		if (shopIDsWatching.indexOf(shop.id) == -1) {
			shopIDsWatching.push(shop.id);
			user.set("shopIDsWatching", shopIDsWatching);
			return user.save(null, { useMasterKey: true });
		} else {
			return null;
		}
	}
}
