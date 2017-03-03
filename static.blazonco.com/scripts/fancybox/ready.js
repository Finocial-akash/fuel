jQuery(document).ready(function() {
	jQuery(".fancybox").fancybox();

	jQuery('.fancybox-media').fancybox({
		openEffect  : 'none',
		closeEffect : 'none',
		helpers : {
			media : {}
		}
	});
	
});