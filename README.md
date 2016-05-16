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
| start |  | Starts the operation. The result of that method can be defined in an execution context of a callback. |
| success | X | Sets the callback if the execution of the operation succeeded. |
| then |  | Defines the callback for the next batch operation and returns it. |

#### Properties

| Name  | Description  |
| ----- | ----------- |
| batchId | Gets the ID of the underlying batch. |
| batchName | Gets the (display) name of the underlying batch.  |
| id | Gets the ID of the current operation.  |
| items | Gets an `ObservableArray` object that can be used in data binding context.  |
| name | Gets the name of the current operation. |
| object | Gets an `Observable` object that can be used in data binding context.  |

### Callbacks

Each callback has the following signature:

```javascript
function (ctx) {
}
```

The `ctx` has the following structure:

#### Methods

| Name | Chainable | Description |
| ---- | --------- | ----------- |
| log | X | Writes a log message. |
| skipNext | X | Skips the execution of the next operation. |

#### Properties

| Name | Description |
| ---- | ----------- |
| batchId | Gets the ID of the underlying batch. |
| batchName | Gets the (display) name of the underlying batch. |
| id | Gets the ID of the current operation. |
| index | Gets the zero based index of the current operation. |
| invokeAction | Gets or sets if operation callback should be invoked or not. |
| invokeAfter | Gets or sets if global "after" callback should be invoked or not. |
| invokeCompleted | Gets or sets if completed callback should be invoked in that operation or not. |
| isBetween | Gets if the current operation is between the first and the last one or not. |
| isFirst | Gets if the current operation is the first one or not. |
| isLast | Gets if the current operation is the last one or not. |
| items | Gets an `ObservableArray` object that can be used in data binding context.  |
| name | Gets the (display) name of the current operation. |
| nextValue | Gets or sets the value for the next operation. That value will be written to `prevValue` in the next operation and `nextValue` is resetted at the same place. |
| object | Gets an `Observable` object that can be used in data binding context.  |
| prevValue | Gets the value from the previous operation. |
| result | Gets or sets the result value for all operation. |
| value | Gets or sets the value for that and all upcoming operations. |
