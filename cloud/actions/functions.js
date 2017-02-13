
Parse.Cloud.define('hello', function(req, res) {
  res.success('Hi');
});

Parse.Cloud.define('createEventComment', function(req, res) {
	var eventID = req.params.eventID;
	var authorID = req.params.authorID;
	var parentCommentID = req.params.parentCommentID;
	var comment = req.params.comment;
});
