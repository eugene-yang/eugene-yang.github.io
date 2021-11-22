$(function(){
    // handling bibtex
    var $template = $('.publication .paper.template');
    var parser = new BibtexParser();
    // parser.setInput( $('#bibtex').html() );
    $.get('./pub.bib').done( data => {
        parser.setInput( data )
        parser.bibtex()
        var entries = Object.values( parser.getEntries() ).sort( (a,b) => { a['YEAR'] > b['YEAR'] } )
        entries.forEach( (entry) => {
            $clone = $template.clone().removeClass('template');
            entry['HREF'] = entry['URL']
            entry['JOURNAL'] = entry['JOURNAL'] || entry['BOOKTITLE'] || entry['ARCHIVEPREFIX']
            entry['JOURNAL'] = entry['JOURNAL'] && entry['JOURNAL'].replace("Proceedings of ", "")
            entry['TITLE'] = entry['TITLE'].replace('{', '').replace('}', '');
            
            ['title', 'journal', 'year', 'status'].forEach( (k) => {
                $clone.find( "."+k ).text( entry[ k.toUpperCase() ] )
            })
            $clone.find('.author').html(entry['AUTHOR'].replaceAll(" and", ",").replace("Eugene Yang", "<span class='self'>Eugene Yang</span>"))
            $clone.find('.pdf').attr('href', entry['HREF'])
            entry['HREF'] || $clone.find('.pdf').hide()
            $clone.find('.bib').data('raw', entry['BIBTEXRAW'])

            $clone.find('.tag').hide()
            entry['TAG'] && $clone.find('.tag').text( entry['TAG'] ).show()

            $clone.insertAfter( $template );
        } )
        
        for( var k in entries ){
            $clone = $
        }

        $('#bibtexmodal').on('show.bs.modal', function (event) {
            var raw = $(event.relatedTarget).data('raw');
            $(this).find('.raw').html( raw );
        })
    } )


});