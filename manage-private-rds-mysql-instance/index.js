const mysql = require('mysql2');
const AWS = require('aws-sdk');
const fs = require('fs');

const rds = new AWS.RDS();
const rdsRegion = process.env.RDS_REGION || 'ap-south-1';
const rdsDBEndpoint = process.env.RDS_MYSQL_ENDPONT;
const dbPort = 3306;

function getRDSIAMToken(dbUsername) {
    var signer = new AWS.RDS.Signer();
    return signer.getAuthToken({
        region: rdsRegion,
        port: dbPort,
        hostname: rdsDBEndpoint,
        username: dbUsername
    });
}

function executeQuery(username, password, dbname, query, callback) {
    const rdsPassword = password || getRDSIAMToken(username);
    const connection = mysql.createConnection({
        host: rdsDBEndpoint,
        port: dbPort,
        user: username,
        password: rdsPassword,
        database: dbname,
        ssl: {
            "ca": fs.readFileSync(__dirname + "/rds-combined-ca-bundle.pem")
        },
        authSwitchHandler: function (data, cb) { // modifies the authentication handler
            if (data.pluginName === 'mysql_clear_password') {
                cb(null, Buffer.from(rdsPassword + '\0'));
            }
        }
    });

    connection.connect();

    connection.query(query, (error, results) => {
        if (error) {
            callback(error);
        } else {
            callback(undefined, JSON.stringify(results, null, 2));
        }
        connection.end();
    });

}

exports.handler = (event, context, callback) => {
    if (!event.username) {
        return callback('username is required');
    }
    if (!event.query) {
        return callback('query is required');
    }
    if (!event.dbname && !process.env.RDS_MYSQL_DBNAME) {
        return callback('dbname is required');
    }
    if (!rdsDBEndpoint) {
        return callback('environment variable RDS_MYSQL_ENDPONT is required');
    }
    executeQuery(event.username, event.password, event.dbname || process.env.RDS_MYSQL_DBNAME, event.query, callback);
};