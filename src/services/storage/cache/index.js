
const set = async ({ key, value, lifeTimeMS = 10000 }, ctx) => {
    const { redis } = ctx;

    await redis.set(key, JSON.stringify(value), lifeTimeMS);
};

const get = async (key, ctx) => {
    const { redis } = ctx;
    let value = null;
    const JSONValue = await redis
        .get(key)
        .then(async params => params)


    if (JSONValue) {
        value = JSON.parse(JSONValue);
    }

    return value;
};

module.exports = {
    set,
    get,
};
