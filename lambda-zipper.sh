#!/bin/bash
if [ $# != 1 ] || [ ! -d $1 ]; then
    echo "Usage: bash lambda-zipper.sh <lambda-function-directory>"
fi

curr_dir=`pwd`
cd $1
zip -r9 ../lambda.zip * -x package*.json 
cd $curr_dir