[![npm](https://img.shields.io/npm/v/nativescript-batch.svg)](https://www.npmjs.com/package/nativescript-batch)
[![npm](https://img.shields.io/npm/dt/nativescript-batch.svg?label=npm%20downloads)](https://www.npmjs.com/package/nativescript-batch)

# NativeScript Batch

A [NativeScript](https://nativescript.org/) module for implementing batch operations.

## License

[MIT license](https://raw.githubusercontent.com/mkloubert/nativescript-applist/master/LICENSE)

## Platforms

* Android
* iOS

## Installation

Run

```bash
tns plugin add nativescript-batch
```

inside your app project to install the module.

## Demo

For quick start have a look at the [demo/app/main-view-model.js](https://github.com/mkloubert/nativescript-batch/blob/master/demo/app/main-view-model.js) file of the [demo app](https://github.com/mkloubert/nativescript-batch/tree/master/demo) to learn how it works.

Otherwise ...

## Example

```bash
var Batch = require("nativescript-batch");

var startBatch = function() {
    Batch.newBatch(function(ctx) {
                       ctx.log("Running 1st operation...");
                   }).complete(function(ctx) {
                                   ctx.log("1st operation completed.");
                               })
                     .success(function(ctx) {
                                  ctx.log("1st operation succeeded.");
                              })
                     .error(function(ctx) {
                                ctx.log("ERROR in operation " + (ctx.index + 1) + ": " + ctx.error);
                            })
         .then(function(ctx) {
                   ctx.log("Running second operation...");
               }).complete(function(ctx) {
                               ctx.log("Second operation completed.");
                           })
                 .success(function(ctx) {
                              ctx.log("Second operation succeeded.");
                          })
                 .error(function(ctx) {
                            ctx.log("ERROR in operation " + (ctx.index + 1) + ": " + ctx.error);
                        })
         .start();
};
exports.startBatch = startBatch;
```

The `Batch.newBatch()` creates a batch operation object with the following structure:

### Methods

| Name  | Description  |
| ----- | ----------- |
| addLogger |  |
| after |  |
| before |  |
| complete |  |
| error |  |
| ignoreErrors |  |
| setBatchId |  |
| setBatchName |  |
| setId |  |
| setName |  |
| skipBefore |  |
| start |  |
| success |  |
| then |  |
