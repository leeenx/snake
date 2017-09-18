/*
	author: leeenx
	date: 2017.09.08
	@ 获取不带描边的boudary
*/

{
    let dirty = Symbol("dirty"); 
    let getContentBox = function() {
        if(this[dirty] == this.dirty) return ; 
        this[dirty] = this.dirty; // 表示已经更新
        let cp = this.clone(); 
        let graphicsData = cp.graphicsData; 
        for(let graphics of graphicsData) {
            graphics.lineWidth = 0; 
        } 
        this._cwidth = cp.width; 
        this._cheight = cp.height; 
    }
    Object.defineProperties(PIXI.Graphics.prototype, {
        "_cwidth": {writable: true, value: 0}, 
        "_cheight": {writable: true, value: 0}, 
        "cwidth": {
            get: function() {
                getContentBox.call(this); 
                return this._cwidth; 
            }
        }, 
        "cheight": {
            get: function() {
                getContentBox.call(this); 
                return this._cheight; 
            }
        }
    }); 
}