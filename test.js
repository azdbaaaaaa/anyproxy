var jsonpath = require('jsonpath');
var cities = [
  { name: "London", "population": 8615246 },
  { name: "Berlin", "population": 3517424 },
  { name: "Madrid", "population": 3165235 },
  { name: "Rome",   "population": 2870528 }
];

dict = { name: "Berlin", "population": 3517424 };

// var r = jsonpath.query(cities, '$..population[?(@.population>=0)]');
var r = jsonpath.paths(cities, '$..*', 99)
for (var i = 0; i < r.length; i++) {
	// console.log(r2[i]);
	var pathExpression = jsonpath.stringify(r[i])
	var result = jsonpath.query(cities, pathExpression);
	console.log(result);
};

// console.log(r);
// console.log(r2);
// console.log(r);


// for (var key in dict){
// 	console.log(key);
// 	console.log(dict[key]);
// }

// var URL = require('url');

// var url ='http://mobile.mmbang.com/api18/redpoint/mobile/fetch?api_version=4.2.0&app_client_id=1&channel=AppStore&device=iPhone7%2C1&device_id=e08d97cf9955eb823836fb00a755a7fe60fa31e6&idfa=00000000-0000-0000-0000-000000000000&openudid=e08d97cf9955eb823836fb00a755a7fe60fa31e6&os_version=10.0.1&resolution=1242%2A2208&screen_size=xx&sid=3097120823&sign=f58d22e3138b83482b3d596e3341169b&silent=1&skey=84852678&time=1479438472.120667'
// var p = URL.parse(url);
// var path = p.hostname + p.pathname;
// console.log(path.replace(/\/$/,""));

