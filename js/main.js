const AUTHOR_WEBSITES = {
    'Saron Samuel': 'https://saronsamuel.com/',
    'Andrew Yates': 'https://andrewyates.net/',
    'Benjamin Van Durme': 'https://www.cs.jhu.edu/~vandurme/',
    'Sean MacAvaney': 'https://macavaney.us/',
    'Katina Russell': 'https://katinarussell.github.io/',
    'Hao-Ren Yao': 'https://sites.google.com/georgetown.edu/howard-yao',
    'Ophir Frieder': 'https://people.cs.georgetown.edu/~ophir/',
    'David D. Lewis': 'https://www.linkedin.com/in/daviddlewis/',
    'Nazli Goharian': 'https://people.cs.georgetown.edu/~nazli/',
    'Suraj Nair': 'https://srnair.netlify.app/'
}

const VENUE_PATTERNS = [
    { key: 'SIGIR',   re: /SIGIR/ },
    { key: 'ECIR',    re: /ECIR/ },
    { key: 'TREC',    re: /TREC|Text REtrieval Conference/ },
    { key: 'CVPR',    re: /CVPR/ },
    { key: 'ICML',    re: /ICML|International Conference on Machine Learning/ },
    { key: 'ICLR',    re: /ICLR|International Conference on Learning Representations/ },
    { key: 'COLM',    re: /COLM|Conference on Language Modeling/ },
    { key: 'NAACL',   re: /NAACL/ },
    { key: 'ACL',   re: /ACL/ },
    // { key: 'CIKM',    re: /CIKM/ },
    // { key: 'DocEng',  re: /DocEng/ },
    { key: 'ICAIL',   re: /ICAIL/ },
    // { key: 'DESIRES', re: /DESIRES/ },
    // { key: 'SODA',    re: /SODA/ },
    // { key: 'SemEval', re: /SemEval/ },
    // { key: 'arXiv',   re: /arXiv/ },
];

function detectVenue(str) {
    if (!str) return 'Other';
    for (const { key, re } of VENUE_PATTERNS) {
        if (re.test(str)) return key;
    }
    return 'Other';
}

let activeYear = null;
let activeVenue = null;
let entries = [];

function updateVenueCounts() {
    if (!entries.length) return;
    const counts = {};
    entries.forEach(e => {
        if (!activeYear || e['YEAR'] == activeYear) {
            counts[e._venue] = (counts[e._venue] || 0) + 1;
        }
    });
    $('.filter-btn[data-filter-type="venue"]').each(function() {
        const v = $(this).data('filter-val');
        const n = counts[v] || 0;
        $(this).text(`${v} (${n})`).toggle(n > 0);
    });
}

function applyFilters() {
    $('.filter-btn[data-filter-type="year"]').each(function() {
        $(this).toggleClass('active', $(this).data('filter-val') == activeYear);
    });
    $('.filter-btn[data-filter-type="venue"]').each(function() {
        $(this).toggleClass('active', $(this).data('filter-val') == activeVenue);
    });
    $('.paper[data-year]').each(function() {
        const yearMatch  = !activeYear  || $(this).data('year')  == activeYear;
        const venueMatch = !activeVenue || $(this).data('venue') == activeVenue;
        $(this).toggle(yearMatch && venueMatch);
    });
    updateVenueCounts();
}

$(function(){
    var $template = $('.publication .paper.template');
    var parser = new BibtexParser();
    $.get('./pub.bib').done( data => {
        parser.setInput( data )
        parser.bibtex()
        entries = Object.values( parser.getEntries() ).sort( (a,b) => { a['YEAR'] > b['YEAR'] } )
        entries.forEach( (entry) => {
            $clone = $template.clone().removeClass('template');
            entry['HREF'] = entry['URL']

            const rawVenueStr = entry['JOURNAL'] || entry['BOOKTITLE'] || entry['ARCHIVEPREFIX'] || '';
            const venue = detectVenue(rawVenueStr);
            entry._venue = venue;

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

            $clone.attr('data-year', entry['YEAR'])
            $clone.attr('data-venue', venue)

            $clone.insertAfter( $template );
        } )

        // Build filter UI
        const years  = [...new Set(entries.map(e => e['YEAR']))].filter(Boolean).sort((a,b) => b - a);
        const venueCounts = {};
        entries.forEach(e => { venueCounts[e._venue] = (venueCounts[e._venue] || 0) + 1; });
        const venues = Object.keys(venueCounts).filter(Boolean).sort((a, b) => {
            if (a === 'Other') return 1;
            if (b === 'Other') return -1;
            return venueCounts[b] - venueCounts[a];
        });

        function makeBtn(type, val, label) {
            return $('<button>').addClass('filter-btn')
                .attr('data-filter-type', type)
                .attr('data-filter-val', val)
                .text(label || val);
        }

        years.forEach(y  => makeBtn('year',  y).appendTo('#year-filters-desktop'));
        venues.forEach(v => makeBtn('venue', v, `${v} (${venueCounts[v]})`).appendTo('#venue-filters-desktop'));

        const $mf = $('#mobile-filters');
        $('<span>').addClass('filter-label').text('Year').appendTo($mf);
        years.forEach(y  => makeBtn('year',  y).appendTo($mf));
        $('<span>').addClass('filter-separator').appendTo($mf);
        $('<span>').addClass('filter-label').text('Venue').appendTo($mf);
        venues.forEach(v => makeBtn('venue', v, `${v} (${venueCounts[v]})`).appendTo($mf));

        $(document).on('click', '.filter-btn', function() {
            const type = $(this).data('filter-type');
            const val  = $(this).data('filter-val');
            if (type === 'year') {
                activeYear  = (activeYear  == val) ? null : val;
            } else {
                activeVenue = (activeVenue == val) ? null : val;
            }
            applyFilters();
        });

        $('#bibtexmodal').on('show.bs.modal', function (event) {
            var raw = $(event.relatedTarget).data('raw');
            $(this).find('.raw').html( raw );
        })
    } )
});
