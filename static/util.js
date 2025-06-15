let U = 
{
	query: (str) => document.querySelector(str),

	css:
	{
		h: `
		padding: 3px;
		background-color: #888;
		color: #eee;
		font-weight: bold;
		font-family: monospace;
		font-size: 14px;
		`,
	}
};

/*
	at index: 0, return last element in list
	at index: .length - 1, return first element of the list
*/
Array.prototype.gl = function(index) 
{
	if(index < 0 || index > this.length - 1)
		console.error(`gl index ${index} out of bounds from [0, ${this,length - 1}]`);

	return this[this.length - 1 - index];
};