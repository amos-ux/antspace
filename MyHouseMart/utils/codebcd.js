module.exports = {
    codeBcdOutIso: function(r) {
        for (let t = [], e = 0; e < r.length - 1; e += 2) t.push(parseInt(r.substr(e, 2), 16));
        return String.fromCharCode.apply(null, t);
    }
};