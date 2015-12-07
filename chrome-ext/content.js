$(document).ready(function(){
	language = window.navigator.userLanguage || window.navigator.language;
	/*
		Wattpad always change DOM informations,
		so catch this event and apply action function to body property
	*/
	$('body').bind('DOMNodeInserted', function(event) {
		$("body").trigger('bodychanged');
		autosize($("#comments textarea"));
		autosize($('.message-replies textarea'));
		autosize($('#commentform textarea'));
	});
});

$("body").bind('bodychanged',function(event){
	/*
		Before all, enable user to select text on pages and story
		We want to use this fonctionnality evrywhere, so we don't set it to specific page.
	*/
	// Start enable user selection
	$('.panel-reading').each(function(){
			$(this).css('-webkit-user-select', 'text')
			.css('-moz-user-select', 'text')
			.css('-ms-user-select', 'text')
			.css('-k-html-user-select', 'text')
			.css('user-select', 'text');
		});
	//End enable user selection

	/*
		ROUTE : route-storyReading
		Description : This page is the reading story page (which dislay all WattPad Fictions)
	*/
	if($('body').hasClass('route-storyReading') && $('#cdwem_comment_tools').length==0)
		comment_controller();
	else if(!$('body').hasClass('route-storyReading'))
		clean_comment_events();
});

function comment_controller()
{
	/*
		Prepare to inject 2 element on page
	*/
	var csHTML = '<div id="cdwem_comment_tools" class="callout vertical scrolling" ><span class="fa fa-comment fa-wp-orange" aria-hidden="true" style="font-size:30px;"></span><div class="hidden_part"></div></div>';
	$('body').prepend(csHTML);
	var cs = $('#cdwem_comment_tools');
	var csh = $('#cdwem_comment_tools .hidden_part');
	/*
		Prepare translated content and inject on main infobox
	*/
	var t = cs.translate({lang: language, t: dict});
	var csCONTENT = '<div class="container_head"><h4>'+t.get("Comment's help")+'<span class="fa fa-right fa-wp-grey " aria-hidden="true" style="font-size:12px;"></span></h4></div>'+
	'<textarea></textarea>'+

	'<button id="cdwem_select_all" class="btn">'+t.get('Select all')+'</button>'+
	'<button id="cdwem_unselect" class="btn">'+t.get('Unselect')+'</button><hr />'+
	t.get('Total characters:')+'<span id="cdwem_text_count"> 0</span> - '+t.get('selected:')+
	' <span id="cdwem_select_count"> 0</span></div>';

	cs.children('div.hidden_part').html(csCONTENT);

	//Insert comment button
	var mbHTML = '<button id="cdwem_comment_button" class="btn ">'+t.get('Comment')+'</button>';
	$("body").prepend(mbHTML);
	mb = $('#cdwem_comment_button');
	mb.hide();

	var txtc = $('#cdwem_text_count');
	var stxtc = $('#cdwem_select_count');
	/*
		Then cache comment textarea
	*/
	var cta = $('#cdwem_comment_tools textarea');
	/*
		Start cosmectics function for well placed comment element in page
		WattPad already use on scroll event so we compose with it... (not for the best)
	*/
	replace_on_top(cs, $("#media-container"));
	replace_on_left(cs, $("header.panel"));

	/*
		Starts Events
	*/
	/*
		Listen mouseup and check if page has selection.
		Display button after selection (on mouse position)
	*/

	$(document).bind("mouseup", function(e) {
		e.preventDefault();
		if(csh.css('display') != 'none'){
			if(document.getSelection().toString()!="" && !cs.is(":hover") && !cta.is(":focus"))
				mb.css("top", e.pageY).css("left",e.pageX).show();
			else
				mb.hide();
		}
    });
	/*
		Windows events for cosmetic placing of comment element
	*/
	$(window).on('scroll', function(){
		//chose element to anchor displaing
		replace_on_top(cs, $("#media-container"));
	});
	$(window).on('resize', function(){
		replace_on_left(cs, $("header.panel"))
	});


	/*
		Comment section mouseup :
		Juste listen when mouseup and display comment textara selection lenght on #cdwem_select_count
	*/
    cs.on('mouseup', function(e){
    	stxtc.html(cta.getSelection().length);
    })
	/*
		Comment textara editing :
		- change text count lenght on #cdwem_text_count
		- change select count on #cdwem_select_count
	*/
    cta.on("change keyup paste", function(e){
		adaptiveheight($(this));
		txtc.html($(this).val().length);
		stxtc.html($(this).getSelection().length);
    });

    /*

	 	Comment button who's display on selected text.
	 	Add separator after all selection
	 	adapt comment area height to content
	 	update char count
	 	unselect text on page

    */
	mb.bind("click", function(e) {
		var text = cta.val();
		text+=(text!="")?"\n--\n":"";
		cta.val(text+'" '+document.getSelection().toString()+' "');
		adaptiveheight(cta);
		txtc.html(cta.val().length);
		document.getSelection().empty();
		cta[0].focus();
		cta[0].selectionStart = cta.val().length;
		$(this).hide();
	});
    /*
		Select and unselect button action
		Do i really must describe this ?
    */
    $("#cdwem_select_all").on('click', function(e){
    	stxtc.html(cta.val().length);
    	cta.select();
    });
    $("#cdwem_unselect").on('click', function(e){
    	stxtc.html("0");
    	cta.getSelection().empty();
    });

    /*
    	Activate or desactivate functionality (just toggle displaying)
    	If comment-on-select button is displaying (may not, but it can be a glitch) remove it
    */
	$("#cdwem_comment_tools .fa-comment").on('click', function(e){
		csh.toggle();
		if(csh.css('display') == 'none')
			$('#cdwem_comment_button').hide();
	});
}
/*
	Just clean passage on page change
*/
function clean_comment_events() {
	if($('#cdwem_comment_tools').length > 0)
	{
		$('#cdwem_comment_tools').remove();
	}
	if($('#cdwem_comment_button').length > 0)
	{
		$('#cdwem_comment_button').remove();
	}
	$(document).bind("mouseup", function(e) {
		e.stopPropagation();
	});
	$(window).on('resize', function(e){
		e.stopPropagation();
	});
}

/*

	Utils and cometics functions

*/
var replace_on_left = function(e, a) {
	var anchor = $(a);
	e.css('left', a.offset().left+a.outerWidth(false)+15);
}
var replace_on_top = function(e, a) {
	if($(document).scrollTop()==0){
		e.css('margin-top', $(a).offset().top+$(a).height()-75);
	} else {
		e.css('position', 'fixed');
		e.css('margin-top', 10);
	}
}

function adaptiveheight(a) {
    var margin = $(window).height()- parseInt($(a).height()) -500;
    if(margin > 0){
	    $(a).height(0);
	    var scrollval = $(a)[0].scrollHeight;
	    $(a).height(scrollval);
	}
}