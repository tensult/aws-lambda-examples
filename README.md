# aws-lambda-examples

## Manage Private RDS MySQL instance
In order to access the RDS MySQL DB instance which doesn't have public access and residing in VPC, usually we do this by launching an EC2 instance in public subnet with internet access and SSH to that instance and then connect to DB instance. This requires to attach a public IP to the instance, which is easy but often not very secure so we need to use IP white-listing using security groups or NACLs. Another the option is connecting RDS using VPN connection using VGW, this requires quite a bit of setup and also costly. We can avoid all that by using this lambda function, we can manage RDS MySQL instance in private subnet.

We can run lambda in private subnets using the security groups which have access to MySQL instance, this can be run using AWS console so no need to worry about exposing to outside world. Now RDS MySQL instances support IAM based authentication so we don't need to hard code DB credentials anywhere in the Lambda function.

### Setup
#### Preparation
* Follow the [AWS RDS IAM Authentication](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.IAMDBAuth.html) documentation to setup IAM based authentication for RDS,IAM roles and DB users etc.
* AWS says this process work with CLI and JAVA SDK, don't worry about it we made it working for NodeJS also.
* Follow the [AWS Lambda RDS Access](https://docs.aws.amazon.com/lambda/latest/dg/vpc-rds.html) documentation to setup a lambda function to access RDS residing in VPC.
#### Update Lambda function code
```
bash update-lambda-code.sh -p=<aws-profile-name> -r=<aws-region> -f=<lambda-function-name> -d=manage-private-rds-mysql-instance 
```
#### DB IAM Account setup (passwordless)
* This is a recommended for using with Lambda as we don't have to worry for exposing passwords.
* First we need to enable RDS DB IAM [Authentication](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.IAMDBAuth.Enabling.html).
* [Create](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.IAMDBAuth.DBAccounts.html) IAM DB account.
* Add [IAM policy](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.IAMDBAuth.IAMPolicy.html) to Lambda role.

### Usage using console
We will be using Lambda Test feature, if you are not familiar with this please go through the [documentation](https://medium.com/@reginald.johnson/testing-aws-lambda-functions-the-easy-way-41cf1ed8c090)
#### Using with regular DB username and password
You can use following sample input:
```json
{
  "username": "tensultdbuser",
  "password": "password",
  "dbname": "testdb",
  "query": "show tables"
}
```
#### Using with DB Endpoint param
You can use following sample input:
```json
{
  "username": "tensultdbuser",
  "password": "password",
  "endpoint": "<rds-endpoint>",
  "dbname": "testdb",
  "query": "show tables"
}
```
#### Using with IAM account
You can use following sample input:
```json
{
  "username": "tensultiamuser",
  "dbname": "testdb",
  "query": "show tables"
}
```
### Usage using AWS CLI
```
aws lambda invoke \
--invocation-type RequestResponse \
--function-name <lambda-function-name> \
--region region \
--log-type Tail \
--payload '{"username": "lambda", "dbname": "testdb", "query": "Select * from Persons"}' \
--profile <aws-profile-name> \
outputfile.txt 
```