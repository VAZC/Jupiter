var util = require('util');

var env = {
    api_key: 'CWB-24564629-A5A6-409B-A91D-7996423BF593',
    did_tenrain: 'O-A0002-001',
};
env.url_tenrain = util.format('http://opendata.cwb.gov.tw/member/opendataapi?dataid=%s&authorizationkey=%s', env.did_tenrain, env.api_key)

module.exports = env;
