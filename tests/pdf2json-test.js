/**
 * Created by suyog on 4/18/16.
 */
var assert = require('chai').assert;


describe("pdf2json", function () {
    var pdf = require('./src/helpers/pdf2json');
    pdf.convert("test.pdf");
});
