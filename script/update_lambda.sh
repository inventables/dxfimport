#!/bin/bash

pushd lambda
rm -f lambda.zip
zip -r lambda *
popd

aws lambda update-function-code --function-name dxfimport --zip-file fileb://lambda/lambda.zip

