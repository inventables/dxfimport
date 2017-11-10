#!/bin/bash

aws lambda invoke --function-name dxfimport --payload '{ "url": "https://raw.githubusercontent.com/bjnortier/dxf/master/test/resources/circlesellipsesarcs.dxf" }' output.txt
cat output.txt
rm output.txt

