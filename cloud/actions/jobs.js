
Parse.Cloud.job("updateDatabaseWithEdmunds", function(request, status) {
	var promises = [];

	var modelQuery = new Parse.Query("Vehicle");
	promises.push(modelQuery.find());

	var manufactureQueyr = new Parse.Query("VehicleManufacture");
	promises.push(manufactureQueyr.find());

	Parse.Promise.when(promises).then(function(results){
		var vehicleArray = results[0];
		var vehicleManufactureArray = results[1];
		var deletePromises = [];

		deletePromises.push(Parse.Object.destroyAll(vehicleArray));
		deletePromises.push(Parse.Object.destroyAll(vehicleManufactureArray));

		return Parse.Promise.when(deletePromises);
	}, function(queryError){
		status.error("query error: " + queryError);
	}).then(function(){
		var apiKey = 'ca3msavvm8dpdrdwtersmjks';
		return Parse.Cloud.httpRequest({
			method: 'GET',
			url: 'https://api.edmunds.com/api/vehicle/v2/makes?fmt=json&api_key=' + apiKey,
		});
	}, function(deleteError){
		status.error("delete error: " + deleteError);
	}).then(function(httpResponse) {
		var savePromises = [];
		var makeArray = httpResponse.data.makes;
		for (var i=0; i<makeArray.length; i++) {
			var make = makeArray[i];

			var VehicleManufacture = Parse.Object.extend("VehicleManufacture");
			var newMake = new VehicleManufacture();
			newMake.set("manufactureName", make.name);
			newMake.set("niceManufactureName", make.niceName);
			newMake.set("edmundsID", make.id);
			savePromises.push(newMake.save());

			var modelsArray = make.models;
			for (var j=0; j<modelsArray.length; j++) {
				var	model = modelsArray[j];
				var Vehicle = Parse.Object.extend("Vehicle");
				var newVehicle = new Vehicle();
				newVehicle.set("manufacture", newMake);
				newVehicle.set("modelName", model.name);
				newVehicle.set("niceModelName", model.niceName);
				newVehicle.set("edmundsID", model.id);

				var yearArray = model.years;
				var yearNumArray = [];
				var yearIDArray = [];
				for (var k=0; k<yearArray.length; k++) {
					var yearModel = yearArray[k];
					yearNumArray.push(yearModel.year);
					yearIDArray.push(yearModel.id);
				}
				newVehicle.set("yearArray", yearNumArray);
				newVehicle.set("edmundsYearIDArray", yearIDArray);

				savePromises.push(newVehicle.save());
			}
		}
		return Parse.Promise.when(savePromises);
	}, function(httpError) {
		status.error("HTTP request failed with error " + httpError);
	}).then(function(saveResult){
		status.success("Database updated with Edmunds data");
	}, function(saveError){
		status.error("Save failed with error " + httpError);
	});
});
