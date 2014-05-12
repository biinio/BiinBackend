//Update bootstrap menu selection
var url = window.location;
// Will only work if string in href matches with location
$('ul.nav a[href="'+ url +'"]').parent().addClass('active');

// Will also work for relative and absolute hrefs
$('ul.nav a').filter(function() {
	if(!this.hasAttribute('data-toggle'))
    	return this.href == url;
}).parent().addClass('active');

//Navigation Tabs
$('body','a[data-toggle="tab"]').on('click touch',function (e) {
  e.preventDefault();
  $(this).tab('show');
});
