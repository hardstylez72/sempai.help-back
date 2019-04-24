const sinon = require('sinon');
const A = require('./a'); //тут зависимость от б
const B = require('./b');
describe("Class A", () => {

    var InstanceOfA;

    beforeEach(() => {
        InstanceOfA = new A();
    });

    it('should call B', () => {
        sinon.stub(B.prototype, 'doSomething');
        let res = InstanceOfA.someFunction();

        sinon.assert.calledOnce(B.prototype.doSomething);
        res.should.equal('mock');
    });
});