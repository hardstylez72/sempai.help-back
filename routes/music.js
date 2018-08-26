var express = require('express');
var router = express.Router();
const dirTree = require('directory-tree');
const _ = require('lodash');

const tree1 = dirTree('/media/hardstylez72/Новый том/music/');

// const getWideDash = count => {
// 	let result = '|';
// 	for (let index = 0; index < count; index++) {
// 		result += '__';
// 	}
// 	return result;
// };

// const getNextTrack = (baseFolderStruct, trackName) => {
//     if (trackName == null) {
//         return;
//     }

//     let baseNode = baseFolderStruct;
//     let isPlayingTrackFound = false;
//     let isNextTrackFound = false;
//     let nextTrack = '';

//     (async () => {
//         await(function searchInTree(node) {
//             if (isNextTrackFound) {
//                 return;
//             }
//             if (node.children) {
//                 for (let index = 0; index < node.children.length; index++) {
//                     let el = node.children[index];
//                     if (isNextTrackFound) {
//                         break;
//                     }
//                     if (
//                         isPlayingTrackFound &&
//                         el.type === 'file' &&
//                         (el.extension === '.flac' || el.extension === '.mp3')
//                     ) {
//                         isNextTrackFound = true;
//                         nextTrack = el;
//                         return Promise.resolve(el);
                        
//                     }
//                     if (el.name === trackName) {
//                         isPlayingTrackFound = true;
//                     }
//                     searchInTree(el);
//                 }
//             }
//         })(baseNode);
        
//     })()
//         return Promise.resolve(nextTrack);
// }

// function getStruct(trackName, cb) {
// 	if (trackName == null) {
// 		return;
// 	}
// 	let baseNode = tree1;
// 	let isPlayingTrackFound = false;
// 	let isNextTrackFound = false;

// 	return (function searchInTree(node, wideLvl) {
// 		if (isNextTrackFound) {
// 			return;
// 		}
// 		wideLvl++;
// 		if (node.children) {
// 			for (let index = 0; index < node.children.length; index++) {
//                 el = node.children[index];
//                 if (el.type === 'file' &&
//                     (el.extension === '.flac' || el.extension === '.mp3')) {
//                         el.next = wideLvl; 
//                         getNextTrack(node, el.name).then(next => {
//                             el.next = wideLvl; 
//                             console.log(getWideDash(wideLvl) + ' ' + el.name + 'next    ' + el.next);
//                         });
//                     }
				
//                 searchInTree(el, wideLvl);
// 				}
// 		}
// 	})(baseNode, 0);
// }
//   const nexttrack = getStruct('$WAGGOT - V. III - 05 mr. wonderful.flac', (path) => {

// });
// setTimeout(() => {
//     console.log(tree1);
// },1000)
// // console.log('dwf');

//Функция возвращает записи
router.post('/', async (req, res) => {
	try {
        const tree = dirTree('/media/hardstylez72/Новый том/music/');
        tree.toggled = true;
		res.send(JSON.stringify({sucsess: '1', data: tree}));
	} catch (err) {
		console.log(err);
		res.send(JSON.stringify({sucsess: '0'}));
	}
});

module.exports = router;

