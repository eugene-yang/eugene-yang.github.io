const AUTHOR_WEBSITES = {
    'Sean MacAvaney': 'https://macavaney.us/',
    'Katina Russell': 'https://katinarussell.github.io/',
    'Hao-Ren Yao': 'https://sites.google.com/georgetown.edu/howard-yao',
    'Ophir Frieder': 'https://people.cs.georgetown.edu/~ophir/',
    'David D. Lewis': 'https://www.linkedin.com/in/daviddlewis/',
    'Nazli Goharian': 'https://people.cs.georgetown.edu/~nazli/'
}

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
            entry['TITLE'] = entry['TITLE'].replace('{', '').replace('}', '')

            entry['AUTHOR'] = entry['AUTHOR'].split(" and ").map(
                name => AUTHOR_WEBSITES[name] !== undefined ? `<a href='${AUTHOR_WEBSITES[name]}'>${name}</a>`:name
            ).join(", ").replace("Eugene Yang", "<span class='self'>Eugene Yang</span>");
            
            ['author', 'title', 'journal', 'year', 'status'].forEach( (k) => {
                $clone.find( "."+k ).html( entry[ k.toUpperCase() ] )
            })
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