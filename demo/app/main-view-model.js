var Observable = require("data/observable").Observable;
var Batch = require("nativescript-batch");


function createViewModel() {
    try {
        var batch;
        
        var successAction = function(ctx) {
            ctx.log('[SUCCESS :: ' + ctx.id + '] ' + ctx.name);
        };
        
        var completedAction = function(ctx) {
            ctx.log('[COMPLETE :: ' + ctx.id + '] ' + ctx.name);
        };
        
        // 1
        var step1 = batch = Batch.newBatch(function(ctx) {
            ctx.items.length = 0;
            
            ctx.value = new Date();
            
            ctx.log('[' + ctx.id + '] ' + ctx.name + ' >> value: ' + ctx.value);
            ctx.log('[' + ctx.id + '] ' + ctx.name + ' >> prevValue: ' + ctx.prevValue);
            
            ctx.nextValue = 5979;
            
            ctx.items.push(ctx.id + " :: " + ctx.value);
        }).success(successAction)
          .complete(completedAction)
          .skipBefore()
          .setId("step-1")
          .setName("Step 1");
        
        // 2
        var step2 = batch = step1.then(function(ctx) {
            ctx.nextValue = 23979;
            
            ctx.items.push(ctx.id + " :: " + ctx.value);
            
            ctx.skipNext();
        }).success(successAction)
          .complete(completedAction)
          .setId("step-2")
          .setName("Step 2");
        
        // 3
        var step3 = batch = step2.then(function(ctx) {
            ctx.nextValue = "PZ";
            
            ctx.items.push(ctx.id + " :: " + ctx.value);
        }).success(successAction)
          .complete(completedAction)
          .setId("step-3")
          .setName("Step 3");

        // 4
        var step4 = batch = step3.then(function(ctx) {
            ctx.items.push(ctx.id + " :: " + ctx.value);
            
            ctx.invokeAfter = false;
        }).success(successAction)
          .complete(completedAction)
          .setId("step-4")
          .setName("Step 4");
          
        // 5
        var step5 = batch = step4.then(function(ctx) {
            ctx.log('[BEFORE __ ' + ctx.id + '] ' + ctx.name + ' >> value: ' + ctx.value);
            
            throw "Error in step 5";
            
            ctx.log('[AFTER __ ' + ctx.id + '] ' + ctx.name + ' >> value: ' + ctx.value);
            
            ctx.items.push(ctx.id + " :: " + ctx.value);
        }).error(function(ctx) {
                     ctx.log('!!!ERROR!!! [' + ctx.id + '] ' + ctx.name + ': ' + ctx.error);
                 })
          .success(successAction)
          .complete(completedAction)
          .setId("step-5")
          .setName("Step 5");
       
       // 6   
       var step6 = batch = step5.then(function(ctx) {
            ctx.log('[BEFORE __ ' + ctx.id + '] ' + ctx.name + ' >> value: ' + ctx.value);
            
            throw "Error in step 6";
            
            ctx.log('[AFTER __ ' + ctx.id + '] ' + ctx.name + ' >> value: ' + ctx.value);
            
            ctx.items.push(ctx.id + " :: " + ctx.value);
        }).ignoreErrors()
          .success(successAction)
          .complete(completedAction)
          .setId("step-6")
          .setName("Step 6");
          
        batch.addLogger(function(ctx) {
            console.log('batch: ' + ctx.message);
        }).setBatchId("my-batch")
          .setBatchName("My batch")
          .before(function(ctx) {
                      ctx.log("---------- BEFORE [" + ctx.batchId + "; " + ctx.batchName + "] ----------");
                      
                      ctx.log('[' + ctx.id + '] ' + ctx.name + ' >> isFirst: ' + ctx.isFirst)
                         .log('[' + ctx.id + '] ' + ctx.name + ' >> isBetween: ' + ctx.isBetween)
                         .log('[' + ctx.id + '] ' + ctx.name + ' >> isLast: ' + ctx.isLast)
                         .log("")
                         .log('[' + ctx.id + '] ' + ctx.name + ' >> value: ' + ctx.value)
                         .log('[' + ctx.id + '] ' + ctx.name + ' >> prevValue: ' + ctx.prevValue)
                  })
          .after(function(ctx) {
                     ctx.log("---------- AFTER ----------")
                        .log("");
                 });
        
        var viewModel = new Observable();
        
        viewModel.startBatch = function() {
            try {
                console.log('startBatch: starting ...');
                
                batch.start();
                
                console.log('startBatch: finished');
            }
            catch (e) {
                console.log('[ERROR] startBatch: ' + e);
            }
        };
        
        viewModel.set("batchItems", batch.items);

        return viewModel;
    }
    catch (e) {
        console.log('[ERROR] createViewModel: ' + e);
    }
}
exports.createViewModel = createViewModel;
