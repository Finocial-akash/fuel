if(!window.Blazonco)
{
	Blazonco = { 
		Client: {},
		falsy: function(val) {
			// 'false', '0', 0, and false
			return (val === 'false' || val === '0' || !val);
		}
	};
}
else if(!window.Blazonco.Client)
{
	Blazonco.Client = {};
}

Blazonco.Client.Forms = {

	init: function()
	{
		//detect calendar scripts
		var calendarScript, calendarSetupScript, calendarLangScript, calendarCSS;
		if(!window.Calendar)
		{
			calendarScript = document.createElement('script');
			calendarScript.setAttribute('src', '../static.blazonco.com/scripts/forms/calendar/calendar_stripped.js');
			calendarScript.setAttribute('type', 'text/javascript');

			calendarSetupScript = document.createElement('script');
			calendarSetupScript.setAttribute('src', '../static.blazonco.com/scripts/forms/calendar/calendar-setup_stripped.js');
			calendarSetupScript.setAttribute('type', 'text/javascript');

			calendarLangScript = document.createElement('script');
			calendarLangScript.setAttribute('src', '../static.blazonco.com/scripts/forms/calendar/lang/calendar-en.js');
			calendarLangScript.setAttribute('type', 'text/javascript');

			calendarCSS = document.createElement('link');
			calendarCSS.setAttribute('rel', 'stylesheet');
			calendarCSS.setAttribute('type', 'text/css');
			calendarCSS.setAttribute('href', '../static.blazonco.com/stylesheets/forms/calendar/calendar-blue2.css');

		}

		var forms = YAHOO.util.Selector.query('form.user-form');
		for(var formIndex = 0; formIndex < forms.length; formIndex++) {
		(function (form) {
			//var fieldsets = YAHOO.util.Selector.query('form.user-form fieldset');
			var fieldsets = YAHOO.util.Selector.query('fieldset', form);
			for(var f = 0; f < fieldsets.length; f++)
			{
				var fieldset = fieldsets[f];
				var controls = YAHOO.util.Selector.query('input,select,textarea', fieldset);
				YAHOO.util.Event.on(controls, 'focus', Blazonco.Client.Forms.onFocusField);
				YAHOO.util.Event.on(controls, 'blur', Blazonco.Client.Forms.onBlurField);

				if(fieldset.getAttribute('rel') && fieldset.getAttribute('rel').match(/depends/))
					Blazonco.Client.Forms.Dependencies.init();
				
				//handle special behaviors for various field types
				var classes = fieldset.className.split(/\s+/g);
				var mainClass = classes[0];
				switch(mainClass)
				{
					case 'rating-entry':
						Blazonco.Client.Forms.Rating.init();
						break;
					case 'date-entry':
						//setup calendar
						
						var dynamicPos = false;
						for(var c = 0; c < classes.length; c++)
						{
							if(classes[c] == 'dynamic-pos')
							{
								dynamicPos = true;
								break;
							}
						}
						
						if(!window.Calendar)
						{
							var head = document.getElementsByTagName('head')[0];
							head.appendChild(calendarScript);
							head.appendChild(calendarSetupScript);
							head.appendChild(calendarLangScript);
							head.appendChild(calendarCSS);
							Blazonco.Client.Forms._calendarLoaded = 0;
							var loader = function(id, dynamicPos)
							{
								return function()
								{
									Blazonco.Client.Forms._calendarLoaded += 1;
									if(Blazonco.Client.Forms._calendarLoaded >= 2)
									{
										var input = document.getElementById(id);
										
										var position = YAHOO.util.Dom.getXY(id + '-calendar-button');
										position[1] += 16;
										
										var opts = {
											inputField: id,
											ifFormat: '%Y-%m-%d %H:%M',
											showsOthers: true,
											button: id + '-calendar-button',
											position: dynamicPos? null : position,
											cache: true
										};

										if(input.className.match(/with-time/))
											opts.showsTime = true;

										Calendar.setup(opts);
									}
								}
							}(controls[0].id, dynamicPos);

							if(calendarScript.addEventListener)
							{
								calendarScript.addEventListener('load', loader, false);
								calendarSetupScript.addEventListener('load', loader, false);
								calendarLangScript.addEventListener('load', loader, false);
							}
							else
							{
								calendarScript.onreadystatechange = calendarLangScript.onreadystatechange = calendarSetupScript.onreadystatechange = function(loader)
								{
									return function()
									{
										if(this.readyState == 'complete' || this.readyState == 'loaded')
											loader();
									}
								}(loader);
							}
						}
						else
						{
							var position = YAHOO.util.Dom.getXY(controls[0].id + '-calendar-button');
							position[1] += 16;
							var options = {
								inputField: controls[0].id,
								button: controls[0].id + '-calendar-button',
								cache: true,
								position: dynamicPos? null : position,
								showsOthers: true
							}
							if(controls[0].className.match(/with-time/))
								options.showsTime = true;
							
							options.ifFormat = Blazonco.Client.Forms._ifFormat || '%m/%d/%Y';
							Calendar.setup(options);
						}
						
						break;
					case 'file-upload':
						(function (fieldset) {
							YAHOO.util.Event.addListener(form, 'submit', function(e) {
								if(form.finishedUploads) return; //let it go, man
								
								
								
								var bucketUrl, uploadName, tags = fieldset.getElementsByTagName('input'), l = tags.length, i;
								
								for(i = 0; i < l; i++) {
									if(tags[i].name == 'bucketUrl') bucketUrl = tags[i].value;
									else if(tags[i].name == 'uploadName') uploadName = tags[i].value;
								}
								
								if(!bucketUrl || !uploadName) return;
								
								YAHOO.util.Event.stopEvent(e);	//do file upload first
								
								//put in a thingie to show that we're uploading
								var placeholder = document.createElement('div');
								placeholder.className = 'uploader-uploading';
								placeholder.innerHTML = 'Uploading file...';
								form.insertBefore(placeholder, fieldset);
								
								//pull out fieldset
								form.removeChild(fieldset);
								
								//create a new dummy form
								var dummyForm = document.createElement('form');
								dummyForm.setAttribute('action', bucketUrl);
								dummyForm.setAttribute('method', 'post');
								dummyForm.setAttribute('enctype', 'multipart/form-data');
								dummyForm.appendChild(fieldset);
								
								//make the redirector
								var redirector = document.createElement('input'),
									formName = ( form.parentNode.className != 'void' ) ? form.parentNode.id : form.parentNode.parentNode.id;
								redirector.setAttribute('name', 'redirect');
								redirector.setAttribute('type', 'hidden');
								redirector.setAttribute('value', document.location.protocol + '//' + document.location.host + '/form/finishUpload?uploadName=' + uploadName + '&formName=' + formName);
								dummyForm.insertBefore(redirector, fieldset);
								
								//create iframe
								var iframe = document.createElement('iframe');
								iframe.id = iframe.name = form.parentNode.id + '-' + uploadName + '-uploader';
								dummyForm.target = iframe.id;
								
								form.fileUploads = form.fileUploads || {};
								form.fileUploads[uploadName] = { iframe: iframe, form: dummyForm };
								
								window.waitingOnUploads = window.waitingOnUploads || {};
								window.waitingOnUploads[form.parentNode.id] = true;
								
								//get everything into the document
								document.body.appendChild(dummyForm);
								document.body.appendChild(iframe);
								
								//submit the form
								dummyForm.submit();
								
								window.finishFormUpload = function(formName, uploadName, fileName, url) {
									var form = document.getElementById(formName).getElementsByTagName('form')[0],
										iframe = form.fileUploads[uploadName].iframe, dummyForm = form.fileUploads[uploadName].form, finished = true;
										
									iframe.parentNode.removeChild(iframe);
									dummyForm.parentNode.removeChild(dummyForm);
									
									delete form.fileUploads[uploadName];
									
									//create an element with the URL and submit that
									var input = document.createElement('input');
									input.setAttribute('type', 'hidden');
									input.setAttribute('name', uploadName);
									input.setAttribute('value', url);
									
									form.appendChild(input);
									
									for(upload in form.fileUploads) {
										if(form.fileUploads.hasOwnProperty(upload)) {
											if(form.fileUploads[upload]) {
												finished = false;
												break;
											}
										}
									}
									
									if(finished) {
										form.finishedUploads = true;
										form.submit();
									}
								};
								
							});
						}(fieldset));
						
						break;
				}
			}
			
			}(forms[formIndex]));
		}
	},

	onFocusField: function()
	{
		var el = this;
		while(el && el.tagName.toLowerCase() != 'fieldset')
		{
			if(el.tagName.toLowerCase() == 'label')
				YAHOO.util.Dom.addClass(el, 'focused');
			el = el.parentNode;
		}

		if(el)
			YAHOO.util.Dom.addClass(el, 'focused');
	},

	onBlurField: function()
	{
		var el = this;
		while(el && el.tagName.toLowerCase() != 'fieldset')
		{
			if(el.tagName.toLowerCase() == 'label')
				YAHOO.util.Dom.removeClass(el, 'focused');
			el = el.parentNode;
		}

		if(el)
			YAHOO.util.Dom.removeClass(el, 'focused');
	},
	
	setFieldsDisabled: function(fieldset, disabled, exclude)
	{
		if(typeof fieldset == "string")
		{
			fieldset = YAHOO.util.Dom.get(fieldset);
		}
		
		exclude = exclude || {};
		
		//Bug in YUI 2.8
		//var controls = YAHOO.util.Selector.query('input,select,textarea', fieldset);
		var controls = [],
			inputs = fieldset.getElementsByTagName('input'),
			selects = fieldset.getElementsByTagName('select'),
			textareas = fieldset.getElementsByTagName('textarea'), node, l;
		
		l = inputs.length;
		for(node = 0; node < l; node++)
		{
			controls.push(inputs[node]);
		}
		
		l = selects.length;
		for(node = 0; node < l; node++)
		{
			controls.push(selects[node]);
		}
		
		l = textareas.length;
		for(node = 0; node < l; node++)
		{
			controls.push(textareas[node]);
		}
		
		for(var i = 0; i < controls.length; i++)
		{
			if(exclude[controls[i].id] || exclude[controls[i].name])
			{
				continue;
			}
			
			controls[i].disabled = disabled;
			if(disabled)
			{
				YAHOO.util.Dom.addClass(controls[i].parentNode, 'disabled');
			}
			else
			{
				YAHOO.util.Dom.removeClass(controls[i].parentNode, 'disabled');
			}
		}
	}
};

Blazonco.Client.Forms.Dependencies = {
	init: function() {		
		if($$)
			this.setUp();
	},
	setUp: function(){
		this.elems = $$('form *[rel*="depends"]');
		this.elems.each(function(el, index) {
			var dependsOn = el.getAttribute('rel').match(/depends\[([^\]]*)\]/)[1];
			var dependsElem = $(dependsOn);
			el.addClassName('dependency');

			var observeFn = function() {
				switch (dependsElem.type) {
					case 'checkbox':
						var value = dependsElem.checked;
						break;
					case 'default':
						var value = dependsElem.value;
						break;
				}
				if(Blazonco.falsy(value)) {
					el.hide();
				} else {
					el.show();
				}
			}
			dependsElem.observe('click',observeFn);
			dependsElem.observe('blur',observeFn);
			//run once at start also
			observeFn();
		});
	}
}
Blazonco.Client.Forms.Rating = {
	entryFields: [],
	init: function() {
		var ratingEntries = YAHOO.util.Selector.query('.rating-entry',document.body);
		for(var r = 0; r < ratingEntries.length; r++) {
			this.entryFields[r] = {};
			var root = this.entryFields[r].root = ratingEntries[r];
			var inputs = YAHOO.util.Selector.query('input',root);
			this.entryFields[r].ratingLabels = YAHOO.util.Selector.query('label.rating',root);
			
			for(var i = 0; i < inputs; i++) {
				if(inputs[i].checked) 
					this.entryFields[r].selectedStar = inputs[i];
			}
			YAHOO.util.Event.on(this.entryFields[r].ratingLabels, 'mouseover', Blazonco.Client.Forms.Rating.starsOn);
			YAHOO.util.Event.on(root, 'mouseout', Blazonco.Client.Forms.Rating.starsOff);
			YAHOO.util.Event.on(this.entryFields[r].ratingLabels, 'click', Blazonco.Client.Forms.Rating.clickStar);
		}
	},
	starsOn: function() {
		Blazonco.Client.Forms.Rating.resetStars();
		for(var f = 0; f < Blazonco.Client.Forms.Rating.entryFields.length; f++) {
			var ratingLabels = Blazonco.Client.Forms.Rating.entryFields[f].ratingLabels;
			if(this.parentNode != Blazonco.Client.Forms.Rating.entryFields[f].root) continue;
			for(var i = 0; i < ratingLabels.length; i++) {
				YAHOO.util.Dom.addClass(ratingLabels[i], 'on');
				if(ratingLabels[i] == this) {
					return;
				}
			}
		}
	},
	starsOff: function(event) {
		var target = (event.srcElement) ? event.srcElement : event.target;
		var relatedTarget = (event.relatedTarget) ? event.relatedTarget : event.toElement;
		if(this != target || YAHOO.util.Dom.isAncestor(target,this) || YAHOO.util.Dom.isAncestor(this,relatedTarget) ) return;
		//console.log('setStars?');
		Blazonco.Client.Forms.Rating.setStars();
	},
	clickStar: function(event) {		
		for(var f = 0; f < Blazonco.Client.Forms.Rating.entryFields.length; f++) {		
			if(Blazonco.Client.Forms.Rating.entryFields[f].root == this.parentNode) {
				Blazonco.Client.Forms.Rating.entryFields[f].selectedStar = (event.srcElement) ? event.srcElement : event.target;
			}
		}
		//Blazonco.Client.Forms.Rating.selectedStar = (event.srcElement) ? event.srcElement : event.target;
		if(event.srcElement) {
			// I will kill you when I find you, Microsoft employees...
			event.srcElement.parentNode.firstChild.click();
		}
	},
	resetStars: function() {
		for(var f = 0; f < Blazonco.Client.Forms.Rating.entryFields.length; f++) {
			var ratingLabels = Blazonco.Client.Forms.Rating.entryFields[f].ratingLabels;
			var ratingInputs = YAHOO.util.Selector.query('.rating input',Blazonco.Client.Forms.Rating.entryFields[f].root);
			for(var i = 0; i < ratingLabels.length; i++) {
				YAHOO.util.Dom.removeClass(ratingLabels[i], 'on');
			}
		}
	},
	setStars: function() {
		Blazonco.Client.Forms.Rating.resetStars();
		for(var f = 0; f < Blazonco.Client.Forms.Rating.entryFields.length; f++) {
			var ratingLabels = Blazonco.Client.Forms.Rating.entryFields[f].ratingLabels;
			var ratingInputs = YAHOO.util.Selector.query('.rating input',Blazonco.Client.Forms.Rating.entryFields[f].root);
			if(Blazonco.Client.Forms.Rating.entryFields[f].selectedStar == null) return;
			for(var i = 0; i < ratingInputs.length; i++) {
				YAHOO.util.Dom.addClass(ratingLabels[i], 'on');
				if(ratingInputs[i].checked)
					return;
			}
		}
	}

}

YAHOO.util.Event.onDOMReady(Blazonco.Client.Forms.init);

