// The MIT License (MIT)
// 
// Copyright (c) Marcel Joachim Kloubert <marcel.kloubert@gmx.net>
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

var app = require("application");
var Observable = require("data/observable").Observable;
var ObservableArray = require("data/observable-array").ObservableArray;


// addOperation()
var addOperation;
addOperation = function(batchOperation, action) {
    var newOperation = {};
    
    // execute action
    newOperation.__AF19949B = function(ctx) {
        if (action) {
            action(ctx);
        }
    };
    
    // action that is executed
    // BEFORE each action
    newOperation.before = function(beforeExecAction) {
        batchOperation.__433B5D6FF = beforeExecAction;
        return this;
    };
    
    // action that is executed
    // AFTER each action
    newOperation.after = function(afterExecAction) {
        batchOperation.__096E312C4DA4 = afterExecAction;
        return this;
    };
    
    // success action
    newOperation.success = function(successAction) {
        this.__9027517002 = successAction;
        return this;
    };
    
    // error action
    newOperation.error = function(errAction) {
        this.__FB3C2A741E = errAction;
        return this;    
    };

    // completed action
    newOperation.complete = function(completedAction) {
        this.__99A17600D8 = completedAction;
        return this;
    };
    
    // next operation
    newOperation.then = function(nextAction) {
        return addOperation(batchOperation, nextAction);  
    };
    
    // start batch operation
    newOperation.start = function() {
        startBatch(batchOperation);
    };

    // ignore errors
    newOperation.ignoreErrors = function() {
        this.error(function() {});
        return this;
    };
    
    // add logger
    newOperation.addLogger = function(loggerAction) {
        batchOperation.__D5F414D3
                      .push(loggerAction);
                      
        return this;
    };

    // id
    Object.defineProperty(newOperation, 'id', {
        get: function() { return newOperation.__0E6B715FF; }
    });
    newOperation.setId = function(newId) {
        this.__0E6B715FF = newId;
        return this;
    };
    
    // name
    Object.defineProperty(newOperation, 'name', {
        get: function() { return newOperation.__E460818F; }
    });
    newOperation.setName = function(newName) {
        this.__E460818F = newName;
        return this;
    };
    
    // object
    Object.defineProperty(newOperation, 'object', {
        get: function() { return batchOperation.__00C3B3EA; }
    });
    
    // items
    Object.defineProperty(newOperation, 'items', {
        get: function() { return batchOperation.__CD706B14754E4D27; }
    });
    
    // batch id
    Object.defineProperty(newOperation, 'batchId', {
        get: function() { return batchOperation.id; }
    });
    newOperation.setBatchId = function(newBatchId) {
        batchOperation.id = newBatchId;
        return this;
    };
    
    // batch name
    Object.defineProperty(newOperation, 'batchName', {
        get: function() { return batchOperation.name; }
    });
    newOperation.setBatchName = function(newBatchName) {
        batchOperation.name = newBatchName;
        return this;
    };
    
    // skip global before action
    newOperation.__A48144C34330A5A7 = false;
    newOperation.skipBefore = function() {
        newOperation.__A48144C34330A5A7 = true;
        return this;
    };
    
    batchOperation.__C40DB2DE
                  .push(newOperation);
                  
    return newOperation;
};

// newBatch()
var newBatch = function(firstAction) {
    var batchOperation = {};
    
    // operations
    batchOperation.__C40DB2DE = [];
    
    // log operation
    batchOperation.__D5F414D3 = [];

    // observable objects
    batchOperation.__00C3B3EA = new Observable();
    batchOperation.__CD706B14754E4D27 = new ObservableArray();
    
    // ID
    var id;
    Object.defineProperty(batchOperation, 'id', {
        get: function() { return id; },
        
        set: function(i) { id = i; }
    });
    
    // name
    var name;
    Object.defineProperty(batchOperation, 'name', {
        get: function() { return name; },
        
        set: function(n) { name = n; }
    });
    
    return addOperation(batchOperation, firstAction);
};
exports.newBatch = newBatch;

// startBatch()
function startBatch(batchOperation) {
    var previousValue;
    var nextValue;
    var value;
    var skipNextOperation = false;
    for (var i = 0; i < batchOperation.__C40DB2DE.length; i++) {
        if (skipNextOperation) {
            skipNextOperation = false;
            continue;
        }
        
        var currentOperation = batchOperation.__C40DB2DE[i];

        var execCtx = {};
        
        // log()
        execCtx.log = function(msg) {
            for (var ii = 0; ii < batchOperation.__D5F414D3.length; ii++) {
                try {
                    var logAction = batchOperation.__D5F414D3[ii];
                    if (logAction) {
                        logAction({
                            message: msg    
                        });
                    }
                }
                catch (le) {
                    // ignore
                }
            }
            
            return this;
        };
        
        // skipNext()
        execCtx.skipNext = function() {
            skipNextOperation = true;
            return this;    
        };
        
        // index
        Object.defineProperty(execCtx, 'index', {
            get: function() { return i; }
        });
        
        // operation ID
        Object.defineProperty(execCtx, 'id', {
            get: function() { return currentOperation.id; }
        });
        
        // operation name
        Object.defineProperty(execCtx, 'name', {
            get: function() { return currentOperation.name; }
        });
        
        // batch ID
        Object.defineProperty(execCtx, 'batchId', {
            get: function() { return batchOperation.id; }
        });
        
        // batch name
        Object.defineProperty(execCtx, 'batchName', {
            get: function() { return batchOperation.name; }
        });
        
        // isFirst
        Object.defineProperty(execCtx, 'isFirst', {
            get: function() { return i === 0; }
        });
        
        // isLast
        Object.defineProperty(execCtx, 'isLast', {
            get: function() { return (i + 1) === batchOperation.__C40DB2DE.length; }
        });
        
        // isBetween
        Object.defineProperty(execCtx, 'isBetween', {
            get: function() { return !execCtx.isFirst && !execCtx.isLast; }
        });
        
        // prevValue
        Object.defineProperty(execCtx, 'prevValue', {
            get: function() { return previousValue; }
        });
        
        // nextValue
        Object.defineProperty(execCtx, 'nextValue', {
            get: function() { return nextValue; },
            
            set: function(nv) { nextValue = nv; }
        });
        
        // value
        Object.defineProperty(execCtx, 'value', {
            get: function() { return value; },
            
            set: function(v) { value = v; }
        });
        
        // object
        Object.defineProperty(execCtx, 'object', {
            get: function() { return batchOperation.__00C3B3EA; }
        });
        
        // items
        Object.defineProperty(execCtx, 'items', {
            get: function() { return batchOperation.__CD706B14754E4D27; }
        });
        
        // invokeSuccess
        var invokeSuccess = true;
        Object.defineProperty(execCtx, 'invokeSuccess', {
            get: function() { return invokeSuccess; },
            
            set: function(nisv) { invokeSuccess = nisv; }
        });
        
        // invokeCompleted
        var invokeCompleted = true;
        Object.defineProperty(execCtx, 'invokeCompleted', {
            get: function() { return invokeCompleted; },
            
            set: function(nicv) { invokeCompleted = nicv; }
        });
        
        // invokeAction
        var invokeAction = true;
        Object.defineProperty(execCtx, 'invokeAction', {
            get: function() { return invokeAction; },
            
            set: function(niav) { invokeAction = niav; }
        });
        
        // invokeAfter
        var invokeAfter = true;
        Object.defineProperty(execCtx, 'invokeAfter', {
            get: function() { return invokeAfter; },
            
            set: function(niafv) { invokeAfter = niafv; }
        });
        
        var context;
        Object.defineProperty(execCtx, 'context', {
            get: function() { return context; }
        });
        
        var invokeCompletedAction = function() {
            if (!invokeCompleted) {
                return;
            }
            
            context = "completed";
            
            if (currentOperation.__99A17600D8) {
                currentOperation.__99A17600D8(execCtx);
            }    
        };

        var handleErrorAction = true;
        try {
            // global BEFORE execute
            if (batchOperation.__433B5D6FF && !currentOperation.__A48144C34330A5A7) {
                context = "before";
                
                batchOperation.__433B5D6FF(execCtx);
            }
            
            // action to execute
            if (currentOperation.__AF19949B && invokeAction) {
                context = "execution";
                
                currentOperation.__AF19949B(execCtx);    
            }
            
            // global AFTER execute
            if (batchOperation.__096E312C4DA4 && invokeAfter) {
                context = "after";
                
                batchOperation.__096E312C4DA4(execCtx);
            }
            
            // success
            if (currentOperation.__9027517002 && invokeSuccess) {
                handleErrorAction = false;
                context = "success";
                
                currentOperation.__9027517002(execCtx);
            }
            
            invokeCompletedAction();
        }
        catch (e) {
            // error
            Object.defineProperty(execCtx, 'error', {
                get: function() { return e; }
            });
            
            if (currentOperation.__FB3C2A741E && handleErrorAction) {
                currentOperation.__FB3C2A741E(execCtx);
            }
            else {
                // rethrow because no action has been execution
                throw e;
            }
            
            invokeCompletedAction();
        }
        
        previousValue = nextValue;
        nextValue = undefined;
    }
}
