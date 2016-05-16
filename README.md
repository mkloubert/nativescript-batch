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

### Batch operations

The `Batch.newBatch()` creates a batch operation object with the following structure:

#### Methods

| Name | Chainable | Description |
| ---- | --------- | ----------- |
| addLogger | X | Adds a logger for the callbacks. |
| after | X | Defines a global callback that is invoked AFTER a callback of a batch operation.  |
| before | X | Defines a global callback that is invoked BEFORE a callback of a batch operation. |
| complete | X | Sets the completed callback for the operation.  |
| error | X | Sets the error callback for the operation. |
| ignoreErrors | X | Errors will be ignored in that operation and NOT rethrown.  |
| setBatchId | X | Sets the ID of the underlying batch object.  |
| setBatchName | X | Sets the name of underlying batch object. |
| setId | X | Sets the ID of the operation. |
| setName | X | Sets the (display) name of the operation. |
| skipBefore | X | Skips the execution of the callback that was defined in `before()` method for that operation. |
| start |  | Starts the operation. |
| success | X | Sets the callback if the execution of the operation succeeded. |
| then | X | Defines the callback for the next batch operation and returns it. |

#### Properties

| Name  | Description  |
| ----- | ----------- |
| batchId | Gets the ID of the underlying batch. |
| batchName | Gets the (display) name of the underlying batch.  |
| id | Gets the ID of the current operation.  |
| items | Gets an `ObservableArray` object that can be used in data binding context.  |
| name | Gets the name of the current operation. |
| object | Gets an `Observable` object that can be used in data binding context.  |
