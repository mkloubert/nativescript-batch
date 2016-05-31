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
import {Observable} from "data/observable";
import {ObservableArray} from "data/observable-array";
import TypeUtils = require("utils/types");

class Batch implements IBatch {
    private _items : ObservableArray<any>;
    private _name : string;
    private _object : Observable;
    private _operations : BatchOperation[] = [];
    private _result : any;
    private _value : any;
    
    constructor(firstAction : (ctx : IBatchOperationContext) => void) {
        this._items = new ObservableArray<any>();
        this._object = new Observable();
        
        this._operations
            .push(new BatchOperation(this, firstAction));
    }
    
    public addLogger(action : (ctx : IBatchLogContext) => void) : Batch {
        this.loggers
            .push(action);
        
        return this;
    }
    
    public after(afterAction : (ctx : IBatchOperationContext) => void) : Batch {
        this.afterAction = afterAction;
        return this;
    }
    
    public afterAction : (ctx : IBatchOperationContext) => void;
    
    public before(beforeAction : (ctx : IBatchOperationContext) => void) : Batch {
        this.beforeAction = beforeAction;
        return this;
    }
    
    public beforeAction : (ctx : IBatchOperationContext) => void;

    public get firstOperation() : BatchOperation {
        return this._operations[0];
    }
    
    public id : string;

    public loggers = [];
    
    public get items() : ObservableArray<any> {
        return this._items;
    }
    
    public name : string;
    
    public get object() : Observable {
        return this._object;
    }
    
    public setResult(value : any) : Batch {
        this._result = value;
        return this;
    }
    
    public setResultAndValue(value : any) : Batch {
        return this.setResult(value)
                   .setValue(value);
    }

    public setValue(value : any) : Batch {
        this._value = value;
        return this;
    }

    public start() : any {
        var result : any = this._result;
        var previousValue;
        var skipWhile : (ctx : IBatchOperationContext) => boolean;
        var value : any = this._value;
        for (var i = 0; i < this._operations.length; i++) {
            var ctx = new BatchOperationContext(this._operations, i,
                                                previousValue);
            ctx.result = result;
            ctx.value = value;
            
            if (!TypeUtils.isNullOrUndefined(skipWhile)) {
                if (skipWhile(ctx)) {
                    continue;
                }
            }
            
            skipWhile = undefined;
            
            var invokeCompletedAction = function() {
                ctx.setExecutionContext(BatchOperationExecutionContext.complete);
                
                if (ctx.invokeComplete && ctx.operation.completeAction) {
                    ctx.operation.completeAction(ctx);
                }
            };
            
            var handleErrorAction = true;
            try {
                // global "before" action
                if (ctx.invokeBefore && ctx.operation.beforeAction) {
                    ctx.setExecutionContext(BatchOperationExecutionContext.before);
                    ctx.operation.beforeAction(ctx);
                }
                
                // action to invoke
                if (ctx.invokeAction && ctx.operation.action) {
                    ctx.setExecutionContext(BatchOperationExecutionContext.execution);
                    ctx.operation.action(ctx);
                }

                // global "after" action
                if (ctx.invokeAfter && ctx.operation.afterAction) {
                    ctx.setExecutionContext(BatchOperationExecutionContext.after);
                    ctx.operation.afterAction(ctx);
                }
                
                // success action
                if (ctx.invokeSuccess && ctx.operation.successAction) {
                    handleErrorAction = false;
                    
                    ctx.setExecutionContext(BatchOperationExecutionContext.success);
                    ctx.operation.successAction(ctx);
                }
                
                invokeCompletedAction();
            }
            catch (e) {
                ctx.setError(e);
                ctx.setExecutionContext(BatchOperationExecutionContext.error);
                
                if (handleErrorAction && ctx.operation.errorAction) {
                    ctx.operation.errorAction(ctx);
                }
                else {
                    if (!ctx.operation.ignoreOperationErrors) {
                        throw e;
                    }
                }
                
                invokeCompletedAction();
            }
            
            previousValue = ctx.nextValue;
            value = ctx.value;
            result = ctx.result;
            
            skipWhile = ctx.skipWhilePredicate;
        }
        
        return result;
    }
}

class BatchLogContext implements IBatchLogContext {
    private _message : any;
    private _operation : BatchOperation;
    private _time : Date;
    
    constructor(operation : BatchOperation,
                time : Date, msg: any) {
        
        this._operation = operation;
        this._message = msg;
    }
    
    public get batch() : Batch {
        return this.operation.batch;
    }
    
    public get message() : any {
        return this._message;
    }
    
    public get operation() : BatchOperation {
        return this._operation;
    }
    
    public get time() : Date {
        return this._time;
    }
}

class BatchOperation implements IBatchOperation {
    private _batch : Batch;
    private _skipBefore : boolean = false;

    constructor(batch : Batch,
                action : (ctx : IBatchOperationContext) => void) {
                    
        this._batch = batch;
        this.action = action;
    }
    
    public action : (ctx : IBatchOperationContext) => void;
    
    public addLogger(action : (ctx : IBatchLogContext) => void) : BatchOperation {
        this._batch.addLogger(action);
        return this;
    }
    
    public after(afterAction : (ctx : IBatchOperationContext) => void) : BatchOperation {
        this._batch.afterAction = afterAction;
        return this;
    }
    
    public get afterAction() {
        return this._batch.afterAction;
    }
    
    public get batch() : Batch {
        return this._batch;
    }
    
    public get batchId() : string {
        return this.batch.id;
    }
    public set batchId(value : string) {
        this.batch.id = value;
    }
    
    public get batchName() : string {
        return this.batch.name;
    }
    public set batchName(value : string) {
        this.batch.name = value;
    }
    
    public before(beforeAction : (ctx : IBatchOperationContext) => void) : BatchOperation {
        this._batch.beforeAction = beforeAction;
        return this;
    }
    
    public get beforeAction() {
        return this._batch.beforeAction;
    }
    
    public complete(completedAction : (ctx : IBatchOperationContext) => void) : BatchOperation {
        this.completeAction = completedAction;
        return this;
    }
    
    public completeAction : (ctx : IBatchOperationContext) => void;
    
    public error(errAction : (ctx : IBatchOperationContext) => void) : BatchOperation {
        this.errorAction = errAction;
        return this;
    }
    
    public errorAction : (ctx : IBatchOperationContext) => void;

    public id : string;
    
    public ignoreErrors(flag? : boolean) : BatchOperation {
        this.ignoreOperationErrors = arguments.length < 1 ? true : flag;
        return this;
    }
    
    public ignoreOperationErrors : boolean = false;
    
    public log(msg) : BatchOperation {
        var ctx = new BatchLogContext(this,
                                      new Date(), msg);
        
        for (var i = 0; i < this.batch.loggers.length; i++) {
            try {
                var l = this.batch.loggers[i];
                l(ctx);
            }
            catch (e) {
                // ignore
            }
        }
        
        return this;
    }
    
    public get items() : ObservableArray<any> {
        return this.batch.items;
    }
    
    public name : string;
        
    public get object() : Observable {
        return this.batch.object;
    }
    
    public setBatchId(value : string) : BatchOperation {
        this.batch.id = value;
        return this;
    }
    
    public setBatchName(value : string) : BatchOperation {
        this.batch.name = value;
        return this;
    }
    
    public setId(value : string) : BatchOperation {
        this.id = value;
        return this;
    }
    
    public setName(value : string) : BatchOperation {
        this.name = value;
        return this;
    }
    
    public skipBefore(value? : boolean) : BatchOperation {
        this._skipBefore = arguments.length < 1 ? true : value;
        return this;
    }
    
    public start() {
        this.batch.start();
    }
    
    public success(successAction : (ctx : IBatchOperationContext) => void) : BatchOperation {
        this.successAction = successAction;
        return this;
    }
    
    public successAction : (ctx : IBatchOperationContext) => void;
    
    public then(action : (ctx : IBatchOperationContext) => void) : BatchOperation {
        return new BatchOperation(this._batch, action);
    }
}

class BatchOperationContext implements IBatchOperationContext {
    private _error : any;
    private _index : number;
    private _isLast : boolean;
    private _operation : BatchOperation;
    private _prevValue;
    private _executionContext : BatchOperationExecutionContext;
    
    constructor(operations : BatchOperation[],
                index : number,
                prevValue : any) {
        
        this._operation = operations[index];
        this._index = index;
        
        this._isLast = index >= (operations.length - 1);
        this._prevValue = prevValue;
    }
    
    public get batch() : Batch {
        return this.operation.batch;
    }
    
    public get batchId() : string {
        return this.operation.batch.id;
    }

    public get batchName() : string {
        return this.operation.batch.name;
    }
    
    public get context() : string {
        var execCtx = this.executionContext;
        if (TypeUtils.isNullOrUndefined(execCtx)) {
            return undefined;
        }
        
        return BatchOperationExecutionContext[execCtx];
    }
    
    public get executionContext() : BatchOperationExecutionContext {
        return this._executionContext;
    }
    
    public get error() : any {
        return this._error;
    }
    
    public get id() : string {
        return this.operation.id;
    }
    
    public get index() : number {
        return this._index;
    }
    
    public invokeAction : boolean = true;
    
    public invokeAfter : boolean = true;
    
    public invokeBefore : boolean = true;
    
    public invokeComplete : boolean = true;
    
    public invokeSuccess : boolean = true;
    
    public get isBetween() : boolean {
        return 0 !== this._index &&
               !this._isLast;
    }
    
    public get isFirst() : boolean {
        return 0 === this._index;
    }
    
    public get isLast() : boolean {
        return this._isLast;
    }

    public get name() : string {
        return this.operation.name;
    }

    public nextValue : any;

    public get operation() : BatchOperation {
        return this._operation;
    }

    public get prevValue() : any {
        return this._prevValue;
    }
    
    public result : any;
    
    public setExecutionContext(value : BatchOperationExecutionContext) : BatchOperationContext {
        this._executionContext = value;
        return this;
    }
    
    public setError(error : any) : BatchOperationContext {
        this._error = error;
        return this;
    }
    
    public setResultAndValue(value : any) : BatchOperationContext {
        this.result = value;
        this.value = value;
        
        return this;
    }
    
    public skip(cnt? : number) : BatchOperationContext {    
        if (arguments.length < 1) {
            cnt = 1;
        }
            
        return this.skipWhile((ctx) => cnt-- > 0);
    }
    
    public skipAll(flag? : boolean) : BatchOperationContext {
        if (arguments.length < 1) {
            flag = true;
        }
        
        return this.skipWhile(() => flag);
    }

    public skipNext(flag? : boolean) : BatchOperationContext {
        this.skip(arguments.length < 1 ? 1
                                       : (flag ? 1 : 0));
        return this;
    }
    
    public skipWhile(predicate : (ctx : IBatchOperationContext) => boolean) : BatchOperationContext {
        this.skipWhilePredicate = predicate;
        return this;
    }
    
    public skipWhilePredicate : (ctx : IBatchOperationContext) => boolean;
    
    public value : any;
}

/**
 * List of batch operation execution types. 
 */
export enum BatchOperationExecutionContext {
    /**
     * Global "before" action.
     */
    before,
    
    /**
     * Operation action is executed.
     */
    execution,
    
    /**
     * Global "after" action.
     */
    after,
    
    /**
     * "Success" action is executed.
     */
    success,
    
    /**
     * "Error" action is executed.
     */
    error,
    
    /**
     * "Completed" action is executed.
     */
    complete
}


/**
 * Describes a batch.
 */
export interface IBatch {
    /**
     * Adds a logger.
     * 
     * @chainable
     * 
     * @param {Function} action The logger action.
     */
    addLogger(action : (ctx : IBatchLogContext) => void) : IBatch;
    
    /**
     * Gets or sets the ID of the batch.
     * 
     * @property
     */
    id : string;
    
    /**
     * Gets the batch wide (observable) array of items.
     * 
     * @property
     */
    items : ObservableArray<any>;
    
    /**
     * Gets the batch wide (observable) object.
     * 
     * @property
     */
    object : Observable;
    
    /**
     * Gets or sets the name of the batch.
     * 
     * @property
     */
    name : string;

    /**
     * Sets the initial result value.
     * 
     * @chainable
     * 
     * @param any value The value.
     */
    setResult(value : any) : IBatch;

    /**
     * Sets the initial result and execution value.
     * 
     * @chainable
     * 
     * @param any value The value.
     */
    setResultAndValue(value : any) : IBatch;

    /**
     * Sets the initial execution value.
     * 
     * @chainable
     * 
     * @param any value The value.
     */
    setValue(value : any) : IBatch;

    /**
     * Starts all operations.
     * 
     * @return any The result of the last / of all operations.
     */
    start() : any;
}

/**
 * Describes a batch log context.
 */
export interface IBatchLogContext {
    /**
     * Gets the underlying batch.
     * 
     * @property
     */
    batch? : IBatch;
    
    /**
     * Gets the log message (value).
     */
    message : any;
    
    /**
     * Gets the underlying batch operation.
     * 
     * @property
     */
    operation? : IBatchOperation;
    
    /**
     * Gets the timestamp.
     */
    time : Date;
}

/**
 * Describes a logger.
 */
export interface IBatchLogger {
    /**
     * Logs a message.
     * 
     * @chainable
     * 
     * @param any msg The message to log.
     */
    log(msg) : IBatchLogger;
}

/**
 * Describes a batch operation.
 */
export interface IBatchOperation extends IBatchLogger {
    /**
     * Adds a logger.
     * 
     * @chainable
     * 
     * @param {Function} action The logger action.
     */
    addLogger(action : (ctx : IBatchLogContext) => void) : IBatchOperation;
    
    /**
     * Gets or sets the ID of the underlying batch.
     * 
     * @property
     */
    batchId : string;
    
    /**
     * Gets or sets the name of the underlying batch.
     * 
     * @property
     */
    batchName : string;
    
    /**
     * Gets the underlying batch.
     * 
     * @property
     */
    batch : IBatch;
    
    /**
     * Defines the "completed" action.
     * 
     * @chainable
     * 
     * @param {Function} completedAction The "completed" action.
     */
    complete(completedAction : (ctx : IBatchOperationContext) => void) : IBatchOperation;
    
    /**
     * Defines the "error" action.
     * 
     * @chainable
     * 
     * @param {Function} errorAction The "error" action.
     */
    error(errorAction : (ctx : IBatchOperationContext) => void) : IBatchOperation;
    
    /**
     * Gets or sets the ID of the operation.
     * 
     * @property
     */
    id : string;

    /**
     * Ignores error of that operation.
     * 
     * @chainable
     * 
     * @param {Boolean} [flag] The flag to set. Default: (true)
     */
    ignoreErrors(flag? : boolean) : IBatchOperation;

    /**
     * Gets the batch wide (observable) array of items.
     * 
     * @property
     */
    items : ObservableArray<any>;
    
    /**
     * Gets the batch wide (observable) object.
     * 
     * @property
     */
    object : Observable;
    
    /**
     * Gets or sets the name of the operation.
     * 
     * @property
     */
    name : string;
    
    /**
     * Sets the ID of the underlying batch.
     * 
     * @param {String} id The new ID.
     * 
     * @chainable
     */
    setBatchId(id : string) : IBatchOperation;
    
    /**
     * Sets the name of the underlying batch.
     * 
     * @param {String} name The new name.
     * 
     * @chainable
     */
    setBatchName(name : string) : IBatchOperation;
    
    /**
     * Sets the ID of the operation.
     * 
     * @param {String} id The new ID.
     * 
     * @chainable
     */
    setId(id : string) : IBatchOperation;
    
    /**
     * Sets the name of the operation.
     * 
     * @param {String} name The new name.
     * 
     * @chainable
     */
    setName(name : string) : IBatchOperation;
    
    /**
     * Starts all operations.
     * 
     * @return any The result of the last / of all operations.
     */
    start() : any;
    
    /**
     * Defines the "success" action.
     * 
     * @chainable
     * 
     * @param {Function} successAction The "success" action.
     */
    success(successAction : (ctx : IBatchOperationContext) => void) : IBatchOperation;
    
    /**
     * Defines the next operation.
     * 
     * @chainable
     * 
     * @param {Function} action The logic of the next operation.
     */
    then(action : (ctx : IBatchOperationContext) => void) : IBatchOperation;
}

/**
 * Describes a context of a batch operation.
 */
export interface IBatchOperationContext {
    /**
     * Gets the underlying batch.
     * 
     * @property
     */
    batch : IBatch;
    
    /**
     * Gets the ID of the underlying batch.
     * 
     * @property
     */
    batchId : string;
    
    /**
     * Gets the name of the underlying batch.
     * 
     * @property
     */
    batchName : string;
    
    /**
     * Gets the name of the execution context.
     * 
     * @property
     */
    context : string;
    
    /**
     * Gets the current execution context.
     * 
     * @property
     */
    executionContext? : BatchOperationExecutionContext;
    
    /**
     * Gets the thrown error.
     * 
     * @property
     */
    error? : any;
    
    /**
     * Gets the ID of the underlying operation.
     * 
     * @property
     */
    id : string;
    
    /**
     * Gets the zero based index.
     * 
     * @property
     */
    index : number;
    
    /**
     * Defines if action should be invoked or not.
     */
    invokeAction : boolean;
    
    /**
     * Defines if global "after" action should be invoked or not.
     */
    invokeAfter : boolean;
    
    /**
     * Defines if global "before" action should be invoked or not.
     */
    invokeBefore : boolean;
    
    /**
     * Defines if "completed" action should be invoked or not.
     */
    invokeComplete : boolean;
    
    /**
     * Defines if "success" action should be invoked or not.
     */
    invokeSuccess : boolean;
    
    /**
     * Gets if the operation is NOT the first AND NOT the last one.
     * 
     * @property
     */
    isBetween : boolean;
    
    /**
     * Gets if that operation is the FIRST one.
     * 
     * @property
     */
    isFirst : boolean;
    
    /**
     * Gets if that operation is the LAST one.
     * 
     * @property
     */
    isLast : boolean;
    
    /**
     * Gets the name of the underlying operation.
     * 
     * @property
     */
    name : string;
        
    /**
     * Gets or sets the value for the next operation.
     * 
     * @property
     */
    nextValue : any;
    
    /**
     * Gets the underlying operation.
     * 
     * @property
     */
    operation : IBatchOperation;    
    
    /**
     * Gets the value from the previous operation.
     * 
     * @property
     */
    prevValue : any;
    
    /**
     * Gets or sets the result for all operations.
     * 
     * @property
     */
    result : any;
    
    /**
     * Sets the values for 'result' any 'value' properties.
     * 
     * @chainable
     * 
     * @param any value The value to set.
     */
    setResultAndValue(value : any) : IBatchOperationContext;
    
    /**
     * Sets the number of operations to skip.
     * 
     * @chainable
     * 
     * @param {Number} cnt The number of operations to skip. Default: 1
     */
    skip(cnt? : number) : IBatchOperationContext;
    
    /**
     * Skips all upcoming operations.
     * 
     * @chainable
     * 
     * @param {Boolean} [flag] Skip all upcoming operations or not. Default: (true)
     */
    skipAll(flag? : boolean) : IBatchOperationContext;
    
    /**
     * Defines if next operation should be skipped or not.
     * 
     * @chainable
     * 
     * @param {Boolean} [flag] Skip next operation or not. Default: (true)
     */
    skipNext(flag? : boolean) : IBatchOperationContext;
    
    /**
     * Skips all upcoming operations that matches a predicate.
     * 
     * @chainable
     * 
     * @param {Function} predicate The predicate to use.
     */
    skipWhile(predicate : (ctx : IBatchOperationContext) => boolean) : IBatchOperationContext;
    
    /**
     * Gets or sets the value for that and all upcoming operations.
     */
    value : any;
}

/**
 * Creates a new batch.
 * 
 * @function newBatch
 * 
 * @return {IBatchOperation} The first operation of the created batch.
 */
export function newBatch(firstAction : (ctx : IBatchOperationContext) => void) : IBatchOperation {
    return new Batch(firstAction).firstOperation;
}