function e(e) {
    return new Promise(function(t) {
        wx.downloadFile({
            url: e,
            success: function(e) {
                200 === e.statusCode && wx.saveFile({
                    tempFilePath: e.tempFilePath,
                    success: function(e) {
                        t(e.savedFilePath);
                    }
                });
            }
        });
    });
}

let t = [];

module.exports = {
    savedFileArray: t,
    downloadImaegFile: function(t, i) {
        return new Promise(function(n, r) {
            try {
                t[0].advertPicUrl && e(t[0].advertPicUrl).then(function(e) {
                    let r = {
                        advertPicUrl: t[0].advertPicUrl,
                        tempAdvertPicUrl: e
                    };
                    i.push(r), n(i);
                });
            } catch (e) {
                r("error");
            }
        });
    },
    getSavedFileList: function() {
        return new Promise(function(e, t) {
            try {
                wx.getSavedFileList({
                    success: function(t) {
                        e(t.fileList);
                    }
                });
            } catch (t) {
                console.log("getSavedFileList:", t), e(!1);
            }
        });
    },
    removeSavedFile: function() {
        try {
            wx.getSavedFileList({
                success: function(e) {
                    if (e.fileList.length > 0) for (let t = 0; t < e.fileList.length; t++) wx.removeSavedFile({
                        filePath: e.fileList[t].filePath,
                        complete: function(e) {}
                    });
                }
            });
        } catch (e) {
            console.log("removeSavedFile:", e);
        }
    }
};


let filters = {

  toFix: function (value) {

    return value.toFixed(2) // 此处2为保留两位小数，保留几位小数，这里写几

  }

}
module.exports = {

  toFix: filters.toFix, toNumber: filters.toNumber,

}