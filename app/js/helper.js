function count(){
	ImageList.getImageCount().then(function(data){
		console.log(data.toNumber());
	});
}


function _base64ToArrayBuffer(base64) {
    var binary_string =  window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array( len );
    for (var i = 0; i < len; i++)        {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

function addImage(image_el, caption, lat, long, tags){

    return new Promise(function (resolve, reject) {
        lat = new web3.BigNumber(lat);
        lat = lat.mul(1e5).round();
        long = new web3.BigNumber(long);
        long = long.mul(1e5).round();

        var arr = _base64ToArrayBuffer(image_el.src.split(',')[1]);
        var buffer = EmbarkJS.Storage.ipfsConnection.Buffer.from(arr);
        EmbarkJS.Storage.ipfsConnection.add(buffer, function (err, result) {
            console.log(result);
            if (err) {
                reject(err);
            } else {
				Controller.addImage(result[0].path, caption, lat, long, tags, {gas: 1000000}).then(function(data){
				    data.hash = result[0].path;
					resolve(data);
				}, function(err){
					reject(err);
				});
            }
        });

    });
}



function getImagesWithLatLong(lat, long, rad){
    lat = Math.round(lat*1e5);
    long = Math.round(long*1e5);
    rad = Math.round(rad*1e5);

    var p =  new Promise(function (resolve, reject) {
        ImageList.getImagesWithLatLong(rad, lat, long).then(function (data){
            ImageList.getImagesWithLatLong(rad, lat, long, data[1]).then(function(data){
                p.data = allToNumber(data[0]);
                resolve(p.data);
            }, function(err){
                reject(err);
            })
        }, function(err){
            reject(err);
        })
    });

    return p;
}

function loadImage(img_div, hash){
    img_div.src = getUrl(hash);
}


getUrl = function(hash) {
    return 'http://localhost:8080/ipfs/' + hash;
};




function getMyImages(){
    return new Promise(function(resolve, reject){
        UserList.getImages().then(function(data){
            resolve(allToNumber(data));
        }, function(err){
            reject(err);
        });
    });
}

function getImage(index){
	return new Promise(function(resolve, reject){
        ImageList.getImage(index).then(function(data) {
            data[0] = getUrl(data[0]);
            resolve(data);
        }, function(err){
            reject(err);
        });
    });
}

function allToNumber(list){
	var x = [];
	for (var i in list){
		if (list.hasOwnProperty(i)) {
			x.push(list[i].toNumber());
		}
	}
	return x;
}
