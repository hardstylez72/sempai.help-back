const B = require('./b');

class A {
    someFunction() {
        let dependency = new B();
        return dependency.doSomething();
    }
}

module.exports =  A;
