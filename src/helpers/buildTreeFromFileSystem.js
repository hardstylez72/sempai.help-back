const fs = require('fs');
const path = require('path');
const util = require('util');
const readdir = util.promisify(fs.readdir);
const lstat = util.promisify(fs.lstat);
const exists = util.promisify(fs.exists);

const CONTENT_PATH = '/media/bozdo/Новый том3/music';

const buildTree = async (path, options, userCallBack = null) => {
    if (!(await exists(path))) {
        throw new Error(`${path} is not path`);
    }

    const tree = {
        name: 'Content',
        parentPath: null,
        root: true,
    };
    let startDepth = 0;
    await buildPath(path, startDepth, tree, 0, options, userCallBack);

    return tree;
};

const buildPath = async (absPath, depth, tree, index, options, userCallBack) => {
    if (!tree.root) {
        tree = tree[index];
    }

    if (!(await lstat(absPath)).isDirectory()) {
        return Promise.reject(`${absPath} is not a folder`);
    }

    depth++;
    tree.children = (await readdir(absPath)).map(el => {
        return {
            name: el,
        };
    });

    if (tree.children.length === 0) {
        return;
    }

    for (let i = 0; i < tree.children.length; i++) {
        const cur = tree.children[i].name;
        const fullPath = path.join(absPath, cur);
        const isDir = (await lstat(fullPath)).isDirectory();
        let userData = null;

        if (userCallBack) {
            const data = {
                parentPath: absPath,
                fullPath: absPath + '/' + cur,
                isDirectory: isDir,
                name: cur,
                depth: depth,
            };

            userData = userCallBack(data);

            if (userData) {
                tree.children[i] = userData;
            } else {
                enrichment(absPath, isDir, cur, tree.children, i, depth);
            }
        } else {
            enrichment(absPath, isDir, cur, tree.children, i, depth);
        }

        if (!isDir) {
            continue;
        }

        await buildPath(fullPath, depth, tree.children, i, options, userCallBack);
    }
};

const enrichment = (path, isDirectory, cur, tree, index, depth) => {
    tree[index] = {
        isDirectory: isDirectory,
        name: cur,
        path: path + '/' + cur,
        parent: path,
        depth: depth,
    };
};

module.exports.buildTree = buildTree;
