$(function(){
    // handling bibtex
    var $template = $('.publication .paper.template');
    var parser = new BibtexParser();
    parser.setInput( $('#bibtex').html() );
    parser.bibtex()
    var entries = Object.values( parser.getEntries() ).sort( (a,b) => { a['YEAR'] > b['YEAR'] } )
    entries.forEach( (entry) => {
        $clone = $template.clone().removeClass('template');
        entry['TITLE'] = entry['TITLE'].replace('{', '').replace('}', '');
        
        ['author', 'title', 'journal', 'year', 'status'].forEach( (k) => {
            $clone.find( "."+k ).text( entry[ k.toUpperCase() ] )
        })
        $clone.find('.pdf').attr('href', entry['HREF'])
        entry['HREF'] || $clone.find('.pdf').hide()
        $clone.find('.bib').data('raw', entry['BIBTEXRAW'])

        $clone.insertAfter( $template );
    } )
    
    for( var k in entries ){
        $clone = $
    }

    $('#bibtexmodal').on('show.bs.modal', function (event) {
        var raw = $(event.relatedTarget).data('raw');
        $(this).find('.raw').html( raw );
    })

});