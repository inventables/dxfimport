# Install

Create a new easel app `/app/new`. The file in `easel/app.js` should be copy/pasted in to the editor. The other two files `aws.js` and `lambda.js` should be attached as dependencies.

# Lambda

This repository is already set up to track an installed lambda app. Any deploys will modify the production app.

You can deploy the lambda app by first cloning `https://github.com/inventables/lambda-tools` and then running:

```bash
$ path/to/lambdapp/apptool deploy --root=path/to/source

# Example if both directories are in the same `src/` being called from `src/dxfimport`
$ ../lambda-tools/apptool deploy --root=.
```
