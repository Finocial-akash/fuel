/**
 *
 *  Javascript file for multiple page forms
 *  This is loaded automatically
 *  Just ensure that Individual Pages are
 *  utilized in the section headings of the forms
 *  that you create in admin
 *  
 */
YAHOO.util.Event.onDOMReady(init_pages);
                            
function init_pages()
{
    var form = YAHOO.util.Dom.getElementsByClassName('user-form');
    var form_elements = [];
    var form_pages = [];
    var current_pages = [];
    
    // get the children of the form
    for(forms_index = 0; forms_index < form.length; forms_index++)
    {
		form_elements[forms_index] = form[forms_index].children;
		var form_length = form_elements[forms_index].length, index;
		var page_count = 1;
		form_pages[forms_index] = [];
		var individual_page = [];
		var track_pages = false;
		current_pages[forms_index] = 1;
		form_pages[forms_index].push(individual_page);
		
		for(index = 0; index < form_length; index++)
		{
			var current_element = form_elements[forms_index][index];
			var regular_page = false;
			
			if(YAHOO.util.Dom.hasClass(current_element, 'section-page') && index != 1)
			{                    
				page_count++;
				individual_page = [];
				form_pages[forms_index].push(individual_page);
				track_pages = true;
			}
			else if(YAHOO.util.Dom.hasClass(current_element, 'section-page'))
			// if the first item is a new page section
			{
				track_pages = true;
			}
			else if(YAHOO.util.Dom.hasClass(current_element, 'buttons'))
			{
				
				if(page_count > 1)
				{
					//page_count++;
					//form_pages[forms_index].push(individual_page);
					track_pages = false;
					var children = current_element.children;
					var submit_btn = children[0];
					
					var submit_id = 'submit_' + forms_index;
					YAHOO.util.Dom.setAttribute(submit_btn, 'id', submit_id);
					var prev_btn = document.createElement('input');
					prev_btn.setAttribute('name', 'previous');
					prev_btn.setAttribute('value', 'Previous Page');
					var prev_id = 'prev_btn_'+forms_index;
					prev_btn.setAttribute('id', prev_id);
					prev_btn.setAttribute('type', 'button');
					var next_btn = document.createElement('input');
					next_btn.setAttribute('name', 'next');
					next_btn.setAttribute('value', 'Next Page');
					var next_id = 'next_btn_'+forms_index;
					next_btn.setAttribute('id', next_id);
					next_btn.setAttribute('type', 'button');
					
					current_element.insertBefore(next_btn, children[0]);
					current_element.insertBefore(prev_btn, children[0]);
					
					YAHOO.util.Dom.setStyle(prev_btn, 'display', 'none');
					YAHOO.util.Dom.setStyle(submit_btn, 'display', 'none');
							
					YAHOO.util.Event.addListener(next_id, 'click', next_page, next_id, true);
					YAHOO.util.Event.addListener(prev_id, 'click', prev_page, prev_id, true);
					
				}
			}
			else
			{
				regular_page = true;
			}
			   
			if(track_pages && (page_count > 1))
			{
				YAHOO.util.Dom.setStyle(current_element, 'display', 'none');
				individual_page.push(current_element);
			}
			else if(track_pages || regular_page)
			{
				individual_page.push(current_element);
			}
			
		}
    }
    
    function prev_page(event, node)
    {
        if(current_pages[curr_index] > 1)
        {
                var submit_id = 'submit_' + curr_index;
                var next_id = 'next_btn_' + curr_index;
                var prev_id = 'prev_btn_' + curr_index;
                var submit_btn = document.getElementById(submit_id);
                var next_btn = document.getElementById(next_id);
                var prev_btn = document.getElementById(prev_id);
                
                var i = 0;
                var elements = form_pages[curr_index][(current_pages[curr_index]-1)];
                
                for(i = 0; i < elements.length; i++)
                {
                    var element = elements[i];
                    YAHOO.util.Dom.setStyle(element, 'display', 'none');
                }
                
                if(current_pages[curr_index] == form_pages[curr_index].length)
                {
                    YAHOO.util.Dom.setStyle(next_btn, 'display', '');
                    YAHOO.util.Dom.setStyle(submit_btn, 'display', 'none');
                }
                
                current_pages[curr_index]--;
                
                var elements = form_pages[curr_index][(current_pages[curr_index]-1)];
                for(i = 0; i < elements.length; i++)
                {
                    var element = elements[i];
                    YAHOO.util.Dom.setStyle(element, 'display', '');
                }
                
                if(current_pages[curr_index] == 1)
                {
                    YAHOO.util.Dom.setStyle(prev_btn, 'display', 'none');
                }
                
        }
    }
    
    function next_page(event, node)
    {
        curr_index = node.charAt(node.length-1);
        if(current_pages[curr_index] < form_pages[curr_index].length)
        {
                var submit_id = 'submit_' + curr_index;
                var next_id = 'next_btn_' + curr_index;
                var prev_id = 'prev_btn_' + curr_index;
                var submit_btn = document.getElementById(submit_id);
                var next_btn = document.getElementById(next_id);
                var prev_btn = document.getElementById(prev_id);
                
                var elements = form_pages[curr_index][(current_pages[curr_index]-1)];
                
                for(i = 0; i < elements.length; i++)
                {
                    var element = elements[i];
                    YAHOO.util.Dom.setStyle(element, 'display', 'none');
                }
                
                if(current_pages[curr_index] == 1)
                {
                    YAHOO.util.Dom.setStyle(prev_btn, 'display', '');
                }
                
                current_pages[curr_index]++;
                
                var elements = form_pages[curr_index][(current_pages[curr_index]-1)];
                for(i = 0; i < elements.length; i++)
                {
                var element = elements[i];
                 YAHOO.util.Dom.setStyle(element, 'display', '');
                }
                
                if(current_pages[curr_index] == form_pages[curr_index].length)
                {
                    YAHOO.util.Dom.setStyle(next_btn, 'display', 'none');
                    YAHOO.util.Dom.setStyle(submit_btn, 'display', '');
                }
        }
    }    
}