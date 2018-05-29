#!/bin/bash

# This only updates an existing lambda function so before running this first create the function.

for i in "$@"
do
case $i in
    -d=*|--directory=*)
    directory="${i#*=}"
    shift # past argument=value
    ;;
    -p=*|--profile=*)
    profile="${i#*=}"
    shift # past argument=value
    ;;
    -f=*|--function=*)
    function="${i#*=}"
    shift # past argument=value
    ;;
    -r=*|--region=*)
    region="${i#*=}"
    shift # past argument=value
    ;;
    *)
    # unknown option
    ;;
esac
done

if [ -z "$profile" ]
then
    profile="default"
fi

if [ -z "$function" ]
then
    echo "Pass Lambda function name using --lambda-function-name=<lambda-function-name> or -f=<lambda-function-name>"
    exit -1
fi

if [ -z "$directory" ]
then
    echo "Pass Lambda function directory using --lambda-function-directory=<lambda-function-directory> or -d=<lambda-function-directory>"
    exit -1
fi

if [ -z "$region" ]
then
    echo "Pass Lambda function region using --region=<lambda-function-region> or -r=<lambda-function-region>"
    exit -1
fi

echo "Running with profile=$profile"
bash lambda-zipper.sh $directory
aws lambda --region $region update-function-code --zip-file fileb://lambda.zip  --function-name $function --profile $profile
rm lambda.zip
