/*
 *
 *	Exports the azure Manager Code
 *
 */
module.exports = function () {

    var azure = require('azure-storage');
    var util = require('util'), path = require('path');
    var functions = {};
    var stream = require('stream');
    //
    //Create a buquet credentials
    functions.createContainer = function (container, callbak) {
        var blobSvc = azure.createBlobService(process.env.AZURE_STORAGE_ACCOUNT, process.env.AZURE_STORAGE_ACCESS_KEY);
        blobSvc.createContainerIfNotExists(container, {publicAccessLevel: 'blob'}, function (error, result, response) {
            if (!error) {
                callbak(error, result);
            } else {
                callbak(null, {status: "Container Ready Exist"});
            }

        });
    };

    //
    //Put the Object in to a buquet
    functions.uploadObjectToContainer = function (container, objKey, buffer, imageFormat, callback) {
        var fileBuffer = new Buffer(buffer);
        var blobSvc = azure.createBlobService(process.env.AZURE_STORAGE_ACCOUNT, process.env.AZURE_STORAGE_ACCESS_KEY);

        blobSvc.createBlockBlobFromStream(
            container,
            objKey,
            new ReadableStreamBuffer(fileBuffer),
            fileBuffer.length,
            {contentTypeHeader: 'image/' + imageFormat},
            function (error, data) {
                if (!error) {
                    callback(data)
                }
                else {
                    console.log(error);
                    throw err;
                }
            });
    };

    //Readable buffer
    var ReadableStreamBuffer = function (fileBuffer) {

        var that = this;
        stream.Stream.call(this);

        var frequency = 50;
        var chunkSize = 1024;
        var size = fileBuffer.length;
        var position = 0;

        var buffer = new Buffer(fileBuffer.length);
        fileBuffer.copy(buffer);

        var sendData = function () {
            if (size === 0) {
                that.emit("end");
                return;
            }

            var amount = Math.min(chunkSize, size);
            var chunk = new Buffer(amount);
            buffer.copy(chunk, 0, position, position + amount);
            position += amount;
            size -= amount;

            that.emit("data", chunk);
        };

        this.size = function () {
            return size;
        };

        this.maxSize = function () {
            return buffer.length;
        };

        this.pause = function () {
            if (sendData) {
                clearInterval(sendData.interval);
                delete sendData.interval;
            }
        };

        this.resume = function () {
            if (sendData && !sendData.interval) {
                sendData.interval = setInterval(sendData, frequency);
            }
        };

        this.destroy = function () {
            that.emit("end");
            clearTimeout(sendData.interval);
            sendData = null;
            that.readable = false;
            that.emit("close");
        };

        this.resume();
    };

    util.inherits(ReadableStreamBuffer, stream.Stream);
    return functions;
};